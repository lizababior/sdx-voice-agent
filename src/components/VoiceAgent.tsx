"use client";

import { useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation, useConversationClientTool } from "@elevenlabs/react";
import { emit, hostBus } from "@/lib/bus";
import { detectLanguage } from "@/lib/lang";
import { warmSandbox } from "@/lib/sandboxClient";
import {
  asCategory,
  pdfBlobUrl,
  type FeedItem,
  type Invoice,
  type Note,
  type SandboxStatus,
  type WorkOrder,
} from "@/lib/vacman";
import { InvoiceSheet } from "./InvoiceSheet";
import { MicDock, type MicState } from "./MicDock";
import { Timeline, type TranscriptLine } from "./Timeline";
import { WorkOrderHeader } from "./WorkOrderHeader";

export function VoiceAgent({ workOrder }: { workOrder: WorkOrder }) {
  return (
    <ConversationProvider>
      <Session workOrder={workOrder} />
    </ConversationProvider>
  );
}

async function postJson(path: string, body: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

function Session({ workOrder }: { workOrder: WorkOrder }) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [sandbox, setSandbox] = useState<SandboxStatus>("warming");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // True from the "Wrap up the job" tap until VacMan answers. More taps would interrupt the answer.
  const [wrapPending, setWrapPending] = useState(false);

  // Refs hold the latest values for the tool handlers, which can run between renders.
  const feedRef = useRef<FeedItem[]>([]);
  const sandboxId = useRef<string | null>(null);
  const counter = useRef(0);
  const lastUserAt = useRef(0);
  // Hang-up after the invoice: "invoice" when it is made, "replied" once VacMan answers (the total).
  const endAfterReply = useRef<"no" | "invoice" | "replied">("no");

  function pushFeed(item: FeedItem) {
    feedRef.current = [...feedRef.current, item];
    setFeed(feedRef.current);
  }
  const activeNotes = (): Note[] =>
    feedRef.current.flatMap((i) => (i.kind === "note" && !i.removed ? [i.note] : []));

  // The console can open late. Answer its "hello" with the history.
  useEffect(() => hostBus(), []);

  function connectSandbox() {
    warmSandbox()
      .then((id) => {
        sandboxId.current = id;
        setSandbox("warm");
        emit({ event: "sandbox", id, status: "warm" });
      })
      .catch(() => {
        setSandbox("failed");
        emit({ event: "sandbox", status: "failed" });
      });
  }
  function retrySandbox() {
    setSandbox("warming");
    emit({ event: "sandbox", status: "warming" });
    connectSandbox();
  }
  useEffect(() => {
    // The state already starts as "warming", so the effect only starts the request.
    emit({ event: "sandbox", status: "warming" });
    connectSandbox();
  }, []);

  const { status, mode, startSession, endSession, sendUserMessage, sendContextualUpdate } = useConversation({
    onMessage: ({ role, message }) => {
      const r = role === "user" ? "user" : "agent";
      setTranscript((t) => [...t, { id: ++counter.current, role: r, text: message }]);
      emit({ event: "transcript", role: r, text: message, language: detectLanguage(message) });
      // The user line arrives when the transcript is final. The next "speaking" ends the turn.
      if (r === "user") lastUserAt.current = Date.now();
      if (r === "agent") setWrapPending(false);
      if (r === "agent" && endAfterReply.current === "invoice") endAfterReply.current = "replied";
    },
    onModeChange: ({ mode }) => {
      if (mode === "speaking" && lastUserAt.current) {
        emit({ event: "latency", ms: Date.now() - lastUserAt.current });
        lastUserAt.current = 0;
      }
    },
    onError: (message: string) => setError(message),
    onDisconnect: () => {
      setError(null);
      setWrapPending(false);
    },
  });

  // After the invoice, hang up once VacMan finishes the total, so the mic is not open on the invoice.
  useEffect(() => {
    if (endAfterReply.current === "no") return;
    if (endAfterReply.current === "replied" && mode === "listening") {
      endAfterReply.current = "no";
      endSession();
      return;
    }
    // Fallback: hang up even if VacMan never answers.
    const t = setTimeout(() => {
      if (endAfterReply.current === "no") return;
      endAfterReply.current = "no";
      endSession();
    }, 20000);
    return () => clearTimeout(t);
  }, [mode, endSession, invoice]);

  /** Runs a tool handler and sends start and end events to the console. */
  async function tracked(name: string, args: unknown, run: () => Promise<{ result: string; ok: boolean }>) {
    const callId = ++counter.current;
    const started = Date.now();
    emit({ event: "tool_start", callId, name, args });
    try {
      const { result, ok } = await run();
      emit({ event: "tool_end", callId, name, result, ms: Date.now() - started, ok });
      return result;
    } catch (err) {
      const result = `Error: ${err instanceof Error ? err.message : String(err)}`;
      emit({ event: "tool_end", callId, name, result, ms: Date.now() - started, ok: false });
      return result;
    }
  }

  useConversationClientTool("log_job_note", async (params: Record<string, unknown>) =>
    tracked("log_job_note", params, async () => {
      if (params.action === "remove") {
        const id = String(params.note_id ?? "");
        const target = feedRef.current.find((i) => i.kind === "note" && i.note.id === id && !i.removed);
        if (!target) return { result: JSON.stringify({ removed: false, reason: "unknown note_id" }), ok: false };
        feedRef.current = feedRef.current.map((i) => (i === target ? { ...i, removed: true } : i));
        setFeed(feedRef.current);
        return { result: JSON.stringify({ removed: true }), ok: true };
      }
      const text = String(params.text ?? "").trim();
      if (!text) return { result: JSON.stringify({ saved: false, reason: "text is required" }), ok: false };
      const item_code = params.item_code ? String(params.item_code) : undefined;
      // Backstop for the prompt rule: one diagnostic fee per job.
      if (item_code === "DIAG-STD" && activeNotes().some((n) => n.item_code === "DIAG-STD")) {
        return { result: JSON.stringify({ saved: false, reason: "already logged" }), ok: false };
      }
      const note: Note = {
        id: `n${++counter.current}`,
        text,
        category: asCategory(params.category),
        item_code,
        quantity: typeof params.quantity === "number" ? params.quantity : undefined,
      };
      pushFeed({ kind: "note", id: note.id, note, removed: false, time: Date.now() });
      return { result: JSON.stringify({ saved: true, note_id: note.id }), ok: true };
    }),
  );

  useConversationClientTool("run_python", async (params: Record<string, unknown>) =>
    tracked("run_python", params, async () => {
      if (!sandboxId.current) return { result: "Error: the sandbox is not ready.", ok: false };
      const data = await postJson("/api/sandbox/run", { sandboxId: sandboxId.current, code: params.code });
      const stdout = String(data.stdout ?? "").trim();
      const ok = data.exitCode === 0;
      const firstLine = stdout.split("\n").filter(Boolean).pop() ?? "Done";
      pushFeed({
        kind: "chip",
        id: `c${++counter.current}`,
        tool: "run_python",
        label: firstLine.slice(0, 60),
        ok,
        time: Date.now(),
      });
      return { result: stdout.slice(0, 4000) || "(no output)", ok };
    }),
  );

  useConversationClientTool("create_invoice", async () =>
    tracked("create_invoice", {}, async () => {
      if (!sandboxId.current) return { result: "Error: the sandbox is not ready.", ok: false };
      const notes = activeNotes();
      const data = await postJson("/api/sandbox/invoice", { sandboxId: sandboxId.current, workOrder, notes });
      const inv: Invoice = { ...data, unpricedNotes: data.unpricedNotes ?? [], pdfUrl: pdfBlobUrl(data.pdfBase64) };
      setInvoice(inv);
      setSheetOpen(true);
      endAfterReply.current = "invoice";
      pushFeed({
        kind: "chip",
        id: `c${++counter.current}`,
        tool: "create_invoice",
        label: `${inv.invoiceNumber} · $${inv.total.toFixed(2)}`,
        ok: true,
        time: Date.now(),
      });
      return {
        result: JSON.stringify({
          invoiceNumber: inv.invoiceNumber,
          total: inv.total,
          ...(inv.unpricedNotes.length > 0 && { unpricedNotes: inv.unpricedNotes }),
        }),
        ok: true,
      };
    }),
  );

  const connected = status === "connected";
  const connecting = status === "connecting";

  // A new call starts with an empty agent memory. When the page already has notes (for example
  // after a dropped call), tell the agent what is logged, so it continues the job.
  useEffect(() => {
    if (!connected) return;
    const notes = activeNotes();
    if (notes.length === 0) return;
    const lines = notes.map(
      (n) => `${n.id}: ${n.text}${n.item_code ? ` (${n.item_code} x${n.quantity ?? 1})` : ""}`,
    );
    sendContextualUpdate(
      `This call continues a job in progress. These job notes are already logged, with their note_id: ${lines.join("; ")}.` +
        (invoice ? ` Invoice ${invoice.invoiceNumber} is already created.` : "") +
        " Continue from here, and use these note_id values to remove a note.",
    );
    // Runs once per connection. The notes come from the ref at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  async function start() {
    setError(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Mic is blocked. Tap here to fix");
      return;
    }
    try {
      const res = await fetch("/api/conversation-token");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start the session.");
      startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
        useWakeLock: true,
        dynamicVariables: {
          job_id: workOrder.job_id,
          customer_name: workOrder.customer_name,
          address: workOrder.address,
          equipment: workOrder.equipment,
          model: workOrder.model,
          refrigerant: workOrder.refrigerant,
          metering_device: workOrder.metering_device,
          complaint: workOrder.complaint,
        },
      });
      navigator.vibrate?.(10);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lost connection. Tap the mic to reconnect.");
    }
  }

  function toggle() {
    if (connected || connecting) {
      endSession();
      navigator.vibrate?.(10);
    } else {
      void start();
    }
  }

  const micState: MicState = error
    ? "error"
    : connecting
      ? "connecting"
      : connected
        ? mode === "speaking"
          ? "speaking"
          : "listening"
        : "idle";

  const hasInvoice = invoice !== null;

  return (
    <>
      <div className="flex h-dvh flex-col">
        <WorkOrderHeader workOrder={workOrder} sandbox={sandbox} onRetry={retrySandbox} />
        <Timeline feed={feed} transcript={transcript} />
        <MicDock
          state={micState}
          errorText={error}
          note={!connected && sandbox === "warming" ? "Warming up the sandbox…" : null}
          startDisabled={sandbox === "warming"}
          onToggle={toggle}
          secondaryLabel={hasInvoice ? "View invoice" : wrapPending ? "Wrapping up…" : "Wrap up the job"}
          onSecondary={() => {
            if (hasInvoice) return setSheetOpen(true);
            if (wrapPending) return;
            setWrapPending(true);
            sendUserMessage("Wrap up the job");
          }}
          secondaryDisabled={!hasInvoice && (!connected || wrapPending)}
        />
      </div>
      {sheetOpen && invoice && (
        <InvoiceSheet workOrder={workOrder} invoice={invoice} onClose={() => setSheetOpen(false)} />
      )}
    </>
  );
}
