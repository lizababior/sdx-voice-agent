"use client";

import { useState } from "react";
import {
  ConversationProvider,
  useConversation,
  useConversationClientTool,
  type MessagePayload,
} from "@elevenlabs/react";

type Line = { role: "user" | "agent" | "tool"; text: string };

export function VoiceAgent() {
  return (
    <ConversationProvider>
      <Agent />
    </ConversationProvider>
  );
}

function Agent() {
  const [lines, setLines] = useState<Line[]>([]);
  const [error, setError] = useState<string | null>(null);
  const log = (line: Line) => setLines((prev) => [...prev, line]);

  const { status, isSpeaking, startSession, endSession } = useConversation({
    onMessage: ({ role, message }: MessagePayload) => log({ role, text: message }),
    onError: (message: string) => setError(message),
  });

  // Handler for the run_code tool. It sends the code to /api/run-code, which runs it on Daytona.
  // The name and parameters must agree with the definition in agent/config.ts.
  useConversationClientTool("run_code", async ({ code, language }: Record<string, unknown>) => {
    log({ role: "tool", text: `run_code (${language})\n${code}` });
    const res = await fetch("/api/run-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
    });
    const data = await res.json();
    const out = data.error ?? data.output ?? "";
    log({ role: "tool", text: `→ ${out}` });
    return String(out).slice(0, 4000);
  });

  async function start() {
    setError(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const res = await fetch("/api/conversation-token");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      startSession({ conversationToken: data.token, connectionType: "webrtc" });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const connected = status === "connected";

  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <button
          onClick={connected ? endSession : start}
          disabled={status === "connecting"}
          className="rounded-full bg-black px-6 py-3 font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {connected ? "End call" : status === "connecting" ? "Connecting…" : "Start talking"}
        </button>
        <span className="text-sm text-zinc-500">
          {status}
          {connected && (isSpeaking ? " · agent speaking" : " · listening")}
        </span>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="flex flex-col gap-2 text-sm">
        {lines.map((l, i) => (
          <li
            key={i}
            className={
              l.role === "tool"
                ? "whitespace-pre-wrap rounded bg-zinc-100 p-2 font-mono text-xs dark:bg-zinc-900"
                : l.role === "user"
                  ? "self-end rounded-2xl bg-zinc-200 px-3 py-2 dark:bg-zinc-800"
                  : "self-start"
            }
          >
            {l.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
