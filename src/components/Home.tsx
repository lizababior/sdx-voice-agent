"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { warmSandbox } from "@/lib/sandboxClient";
import type { WorkOrder } from "@/lib/vacman";

// The server snapshot is empty, so the date is read only in the browser.
// Next 16 does not allow the current time during prerender.
const subscribeNever = () => () => {};
const readToday = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[0.75rem] font-semibold text-text-dim">
      {children}
    </span>
  );
}

export function Home({ workOrders }: { workOrders: WorkOrder[] }) {
  const today = useSyncExternalStore(subscribeNever, readToday, () => "");
  const firstName = workOrders[0].technician.split(" ")[0];

  // Start the sandbox now. A failure is handled on the job page, which has a retry.
  useEffect(() => {
    warmSandbox().catch(() => {});
  }, []);

  return (
    <main className="flex flex-1 flex-col gap-7 px-5 pt-10 pb-safe">
      <header className="flex flex-col gap-1">
        <p className="min-h-5 text-[0.8125rem] font-semibold tracking-[0.06em] text-text-dim uppercase">{today}</p>
        <h1 className="text-[2rem] leading-tight font-bold tracking-tight">Hi, {firstName}</h1>
        <div className="mt-2 flex gap-2">
          <span className="rounded-full bg-accent/15 px-3 py-1 text-[0.8125rem] font-semibold text-accent">
            {workOrders.length} {workOrders.length === 1 ? "job" : "jobs"} today
          </span>
          <span className="rounded-full bg-surface px-3 py-1 text-[0.8125rem] font-semibold text-text-dim">
            San Diego
          </span>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-[0.8125rem] font-semibold tracking-[0.06em] text-text-dim uppercase">Today</h2>
        {workOrders.map((workOrder, i) => (
          <Link
            key={workOrder.job_id}
            href={`/job/${workOrder.job_id}`}
            className={`flex min-h-24 items-center gap-4 rounded-[20px] border bg-surface px-4 py-4 transition-colors active:bg-surface-2 ${
              i === 0 ? "border-accent/40" : "border-line/60"
            }`}
          >
            <span
              aria-hidden
              className={`flex size-12 shrink-0 items-center justify-center rounded-full text-base font-bold ${
                i === 0 ? "bg-accent text-accent-ink" : "bg-surface-2 text-text"
              }`}
            >
              {initials(workOrder.customer_name)}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-lg font-semibold">{workOrder.customer_name}</span>
                {i === 0 && (
                  <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[0.6875rem] font-bold tracking-wide text-accent uppercase">
                    Next up
                  </span>
                )}
              </span>
              <span className="truncate text-[0.875rem] text-text-dim">{workOrder.address}</span>
              <span className="truncate text-[0.875rem] text-text">{workOrder.complaint}</span>
              <span className="mt-1 flex flex-wrap gap-1.5">
                <Tag>{workOrder.model.split(" ")[0]}</Tag>
                <Tag>{workOrder.refrigerant}</Tag>
                <Tag>{workOrder.metering_device}</Tag>
              </span>
            </span>
            <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-text-dim" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="m9 6 6 6-6 6" />
            </svg>
          </Link>
        ))}
      </section>
    </main>
  );
}
