"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { JobEvent } from "./types";
import { workOrder } from "./workOrder";

// Contract: section 5 of Docs/VacMan-Build-Plan-v2.md.
type Category = "finding" | "measurement" | "repair" | "part";
type JobNote = { id: string; text: string; category: Category; item_code?: string; quantity?: number };
type NoteParams = {
  action?: string;
  text?: string;
  category?: Category;
  item_code?: string;
  quantity?: number;
  note_id?: string;
};
type SandboxStatus = "warming" | "warm" | "failed";

const CARD_TYPE: Record<Category, JobEvent["type"]> = {
  finding: "note",
  measurement: "note",
  repair: "labor",
  part: "part",
};

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data as T;
}

function pdfUrl(base64: string) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
}

/**
 * One job session: the warm Daytona sandbox, the job notes, and the 3 agent tool actions.
 * The notes become timeline cards. Refs hold the truth, because the agent can call tools in parallel.
 */
export function useJobSession() {
  const [events, setEvents] = useState<JobEvent[]>([]);
  const [fresh, setFresh] = useState<Set<number>>(new Set());
  const [sandboxStatus, setSandboxStatus] = useState<SandboxStatus>("warming");
  const notes = useRef<JobNote[]>([]);
  const nextNote = useRef(1);
  const nextEvent = useRef(1);
  const eventByNote = useRef(new Map<string, number>());
  const sandbox = useRef<Promise<string> | null>(null);

  const addEvent = useCallback((event: Omit<JobEvent, "id" | "created_at">) => {
    const id = nextEvent.current++;
    setEvents((prev) => [...prev, { ...event, id, created_at: new Date().toISOString() }]);
    setFresh((prev) => new Set([...prev, id]));
    return id;
  }, []);

  const startSandbox = useCallback(() => {
    sandbox.current = postJson<{ sandboxId: string }>("/api/sandbox/start", {}).then(
      (r) => {
        setSandboxStatus("warm");
        return r.sandboxId;
      },
      (err) => {
        setSandboxStatus("failed");
        sandbox.current = null;
        throw err;
      },
    );
    return sandbox.current;
  }, []);

  // Warm the sandbox when the job screen opens, before the first conversation turn.
  // The guard keeps it to one sandbox: in dev, React runs this effect twice.
  useEffect(() => {
    if (!sandbox.current) startSandbox().catch(() => {});
  }, [startSandbox]);

  // A tool call after a failed warm-up tries once more to create the sandbox.
  const sandboxId = useCallback(() => {
    if (sandbox.current) return sandbox.current;
    setSandboxStatus("warming");
    return startSandbox();
  }, [startSandbox]);

  const logJobNote = useCallback(
    (p: NoteParams) => {
      if (p.action === "remove") {
        const note = notes.current.find((n) => n.id === p.note_id);
        if (!note) return JSON.stringify({ removed: false, reason: `no note with id ${p.note_id}` });
        notes.current = notes.current.filter((n) => n.id !== note.id);
        const eventId = eventByNote.current.get(note.id);
        setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, removed: true } : e)));
        return JSON.stringify({ removed: true });
      }
      if (!p.text) return JSON.stringify({ saved: false, reason: "text is required" });
      // Backstop: the diagnostic fee is billed once per job.
      if (p.item_code === "DIAG-STD" && notes.current.some((n) => n.item_code === "DIAG-STD")) {
        return JSON.stringify({ saved: false, reason: "already logged" });
      }
      const note: JobNote = {
        id: `n${nextNote.current++}`,
        text: p.text,
        category: p.category ?? "finding",
        item_code: p.item_code || undefined,
        quantity: p.quantity,
      };
      notes.current = [...notes.current, note];
      const eventId = addEvent({
        type: CARD_TYPE[note.category] ?? "note",
        item: note.text,
        qty: note.quantity && note.quantity !== 1 ? note.quantity : undefined,
      });
      eventByNote.current.set(note.id, eventId);
      return JSON.stringify({ saved: true, note_id: note.id });
    },
    [addEvent],
  );

  const runPython = useCallback(
    async ({ code }: { code?: string }) => {
      if (!code) return "Error: code is required.";
      try {
        const r = await postJson<{ stdout: string; exitCode: number }>("/api/sandbox/run", {
          sandboxId: await sandboxId(),
          code,
        });
        // The result chip: the calculation output, as the technician would read it.
        if (r.exitCode === 0 && r.stdout.trim()) addEvent({ type: "tool", item: "Calculation", notes: r.stdout.trim() });
        return r.stdout || `Exit code ${r.exitCode}, no output.`;
      } catch (err) {
        return `Error: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
    [addEvent, sandboxId],
  );

  const createInvoice = useCallback(async () => {
    try {
      const inv = await postJson<{
        invoiceNumber: string;
        lineItems: { name: string; quantity: number; unit: string; amount: number }[];
        subtotal: number;
        tax: number;
        total: number;
        pdfBase64: string;
      }>("/api/sandbox/invoice", { sandboxId: await sandboxId(), workOrder, notes: notes.current });
      addEvent({
        type: "invoice",
        item: `Invoice ${inv.invoiceNumber}`,
        total: inv.total,
        invoice_url: pdfUrl(inv.pdfBase64),
        line_items: [
          ...inv.lineItems.map((l) => ({
            label: l.quantity !== 1 ? `${l.name} × ${l.quantity} ${l.unit}` : l.name,
            amount: l.amount,
          })),
          { label: "Tax (7.75%)", amount: inv.tax },
        ],
      });
      return JSON.stringify({
        invoice_number: inv.invoiceNumber,
        total: inv.total,
        status: "Sent to office for review",
      });
    } catch (err) {
      return `Error: ${err instanceof Error ? err.message : String(err)}`;
    }
  }, [addEvent, sandboxId]);

  return { events, fresh, sandboxStatus, logJobNote, runPython, createInvoice };
}

export type JobSessionTools = Pick<ReturnType<typeof useJobSession>, "logJobNote" | "runPython" | "createInvoice">;
