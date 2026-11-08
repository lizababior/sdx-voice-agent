"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { warmSandbox } from "@/lib/sandboxClient";
import type { WorkOrder } from "@/lib/vacman";

// The server snapshot is empty, so the date is read only in the browser.
// Next 16 does not allow the current time during prerender.
const subscribeNever = () => () => {};
const readToday = () =>
  new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

export function Home({ workOrders }: { workOrders: WorkOrder[] }) {
  const today = useSyncExternalStore(subscribeNever, readToday, () => "");
  const firstName = workOrders[0].technician.split(" ")[0];
  const count = `${workOrders.length} ${workOrders.length === 1 ? "job" : "jobs"} today`;

  // Start the sandbox now. A failure is handled on the job page, which has a retry.
  useEffect(() => {
    warmSandbox().catch(() => {});
  }, []);

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 pt-8 pb-safe">
      <header>
        <h1 className="text-[1.75rem] leading-tight font-bold">Hi, {firstName}</h1>
        <p className="min-h-7 text-text-dim">{today ? `${today} · ${count}` : ""}</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-[0.8125rem] font-semibold tracking-[0.06em] text-text-dim uppercase">Today</h2>
        {workOrders.map((workOrder) => (
          <Link
            key={workOrder.job_id}
            href={`/job/${workOrder.job_id}`}
            className="flex min-h-24 flex-col justify-center gap-0.5 rounded-card border border-line bg-surface px-4 py-3 active:bg-surface-2"
          >
            <span className="flex items-center gap-2 text-xl font-semibold">
              <span role="img" aria-label="Not started" className="size-3 shrink-0 rounded-full bg-text-dim" />
              {workOrder.customer_name}
            </span>
            <span className="text-text-dim">{workOrder.address}</span>
            <span className="text-text-dim">
              {workOrder.equipment} · {workOrder.refrigerant}
            </span>
            <span className="flex items-center justify-between gap-3">
              <span className="line-clamp-2">{workOrder.complaint}</span>
              <span aria-hidden className="text-text-dim">
                ›
              </span>
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
