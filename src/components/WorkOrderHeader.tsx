import Link from "next/link";
import type { SandboxStatus, WorkOrder } from "@/lib/vacman";

const SANDBOX: Record<SandboxStatus, { dot: string; text: string }> = {
  warming: { dot: "bg-accent", text: "Sandbox warming…" },
  warm: { dot: "bg-ok", text: "Sandbox ready" },
  failed: { dot: "bg-danger", text: "Sandbox failed. Tap to retry" },
};

export function WorkOrderHeader({
  workOrder,
  sandbox,
  onRetry,
}: {
  workOrder: WorkOrder;
  sandbox: SandboxStatus;
  onRetry: () => void;
}) {
  const s = SANDBOX[sandbox];
  return (
    <header className="sticky top-0 z-10 border-b border-line/60 bg-bg/90 px-5 pt-3 pb-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="-ml-2 flex h-12 items-center gap-1 rounded-full pr-4 pl-2 font-semibold text-accent active:bg-surface"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <path d="m15 6-6 6 6 6" />
          </svg>
          Jobs
        </Link>
        <button
          type="button"
          onClick={onRetry}
          disabled={sandbox !== "failed"}
          className="flex min-h-9 items-center gap-2 rounded-full bg-surface px-3 text-[0.75rem] font-semibold text-text-dim"
        >
          <span aria-hidden className={`size-2 rounded-full ${s.dot}`} />
          {s.text}
        </button>
      </div>
      <h1 className="mt-1 text-[1.75rem] leading-tight font-bold tracking-tight">{workOrder.customer_name}</h1>
      <p className="truncate text-[0.875rem] text-text-dim">{workOrder.address}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {[workOrder.model || workOrder.equipment, workOrder.refrigerant, workOrder.metering_device].map((t) => (
          <span key={t} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[0.75rem] font-semibold text-text-dim">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-3 rounded-2xl bg-surface px-3.5 py-2.5 text-[0.9375rem]">
        <p className="line-clamp-2">
          <span className="mr-1.5 font-semibold text-accent">Complaint</span>
          {workOrder.complaint}
        </p>
      </div>
    </header>
  );
}
