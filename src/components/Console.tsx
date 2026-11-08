"use client";

import { useEffect, useMemo, useState } from "react";
import { listenBus, type BusEvent } from "@/lib/bus";

const LATENCY_LIMIT_MS = 1500;

function clock(time: number) {
  return new Date(time).toLocaleTimeString("en-US", { hour12: false });
}

function pretty(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function LatencyBadge({ ms }: { ms: number }) {
  const ok = ms < LATENCY_LIMIT_MS;
  return (
    <span
      className={`tabular rounded-full px-2 py-0.5 text-[0.8125rem] font-semibold ${
        ok ? "bg-ok/20 text-ok" : "bg-danger/20 text-danger"
      }`}
    >
      {(ms / 1000).toFixed(2)} s
    </span>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-surface p-4">
      <h2 className="mb-3 text-[0.8125rem] font-semibold tracking-[0.06em] text-text-dim uppercase">{title}</h2>
      {children}
    </section>
  );
}

export function Console() {
  const [events, setEvents] = useState<BusEvent[]>([]);

  useEffect(() => listenBus((e) => setEvents((prev) => [...prev, e])), []);

  const view = useMemo(() => {
    // The latency event comes before the agent line of the same turn. Pair them in order.
    let pending: number | null = null;
    const lines: { time: number; role: string; text: string; language: string; latency: number | null }[] = [];
    const calls = new Map<number, { name: string; args: unknown; time: number; end?: Extract<BusEvent, { event: "tool_end" }> }>();
    let sandbox: { id?: string; status: string } = { status: "waiting for the phone page" };
    const latencies: number[] = [];

    for (const e of events) {
      if (e.event === "latency") {
        pending = e.ms;
        latencies.push(e.ms);
      } else if (e.event === "transcript") {
        const latency = e.role === "agent" ? pending : null;
        if (e.role === "agent") pending = null;
        lines.push({ time: e.time, role: e.role, text: e.text, language: e.language, latency });
      } else if (e.event === "tool_start") {
        calls.set(e.callId, { name: e.name, args: e.args, time: e.time });
      } else if (e.event === "tool_end") {
        const c = calls.get(e.callId);
        if (c) c.end = e;
      } else if (e.event === "sandbox") {
        sandbox = { id: e.id ?? sandbox.id, status: e.status };
      }
    }
    const toolCalls = [...calls.values()];
    return {
      lines,
      toolCalls,
      sandbox,
      pythonRuns: toolCalls.filter((c) => c.name === "run_python"),
      avg: latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : null,
    };
  }, [events]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-[1.75rem] font-bold">VacMan console</h1>
        {view.avg !== null && (
          <p className="flex items-center gap-2 text-text-dim">
            Average turn <LatencyBadge ms={view.avg} />
          </p>
        )}
      </header>
      <p className="text-text-dim">
        Open the phone page in another tab of this browser. Events arrive over BroadcastChannel, with no backend.
      </p>

      <Panel title="Transcript">
        {view.lines.length === 0 ? (
          <p className="text-text-dim">Nothing yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {view.lines.map((l, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-x-3">
                <span className="tabular text-[0.8125rem] text-text-dim">{clock(l.time)}</span>
                <span className="text-[0.8125rem] font-semibold text-text-dim uppercase">{l.language}</span>
                <span className={l.role === "user" ? "font-semibold" : "text-text-dim"}>
                  {l.role === "user" ? "Tech" : "VacMan"}:
                </span>
                <span className="min-w-0 flex-1">{l.text}</span>
                {l.latency !== null && <LatencyBadge ms={l.latency} />}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Tool calls">
        {view.toolCalls.length === 0 ? (
          <p className="text-text-dim">Nothing yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {view.toolCalls.map((c, i) => (
              <li key={i} className="rounded-button border border-line bg-bg p-3">
                <p className="flex items-center gap-3">
                  <span className="tabular text-[0.8125rem] text-text-dim">{clock(c.time)}</span>
                  <span className="font-mono font-semibold">{c.name}</span>
                  {c.end ? (
                    <>
                      <span className={c.end.ok ? "text-ok" : "text-danger"}>{c.end.ok ? "ok" : "failed"}</span>
                      <span className="tabular text-text-dim">{c.end.ms} ms</span>
                    </>
                  ) : (
                    <span className="text-accent">running…</span>
                  )}
                </p>
                <pre className="mt-2 text-[0.8125rem] break-words whitespace-pre-wrap text-text-dim">
                  {pretty(c.args)}
                </pre>
                {c.end && (
                  <pre className="mt-1 text-[0.8125rem] break-words whitespace-pre-wrap">{c.end.result.slice(0, 600)}</pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Daytona">
        <p className="mb-3">
          Sandbox <span className="font-mono">{view.sandbox.id ?? "—"}</span> ·{" "}
          <span
            className={
              view.sandbox.status === "warm"
                ? "text-ok"
                : view.sandbox.status === "failed"
                  ? "text-danger"
                  : "text-accent"
            }
          >
            {view.sandbox.status}
          </span>
        </p>
        {view.pythonRuns.map((c, i) => {
          const code = (c.args as { code?: string }).code ?? "";
          return (
            <div key={i} className="mb-3 rounded-button border border-line bg-bg p-3">
              <p className="mb-1 text-[0.8125rem] text-text-dim">Code the agent wrote</p>
              <pre className="font-mono text-[0.8125rem] whitespace-pre-wrap">{code}</pre>
              <p className="mt-2 mb-1 text-[0.8125rem] text-text-dim">
                Output{c.end ? ` · ${c.end.ms} ms` : ""}
              </p>
              <pre className="font-mono text-[0.8125rem] whitespace-pre-wrap">{c.end?.result ?? "running…"}</pre>
            </div>
          );
        })}
      </Panel>
    </main>
  );
}
