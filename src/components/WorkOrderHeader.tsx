import Link from "next/link";
import type { SandboxStatus, WorkOrder } from "@/lib/vacman";

const SANDBOX: Record<SandboxStatus, { dot: string; text: string }> = {
  warming: { dot: "bg-accent", text: "Sandbox warming…" },
  warm: { dot: "bg-ok", text: "Sandbox warm" },
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
    <header className="sticky top-0 z-10 border-b border-line bg-bg px-4 pt-3 pb-3">
      <div className="-mt-1 flex items-center justify-between gap-3">
        <Link href="/" className="flex h-14 items-center pr-6 text-text-dim active:text-text">
          ‹ Jobs
        </Link>
        <button
          type="button"
          onClick={onRetry}
          disabled={sandbox !== "failed"}
          className="flex min-h-10 items-center gap-2 text-[0.8125rem] font-semibold text-text-dim"
        >
          <span aria-hidden className={`size-2.5 rounded-full ${s.dot}`} />
          {s.text}
        </button>
      </div>
      <h1 className="text-[1.75rem] leading-tight font-bold">{workOrder.customer_name}</h1>
      <p className="text-text-dim">{workOrder.address}</p>
      <p className="text-text-dim">
        {workOrder.equipment} · {workOrder.refrigerant} · {workOrder.metering_device}
      </p>
      <p className="line-clamp-2 text-text-dim">{workOrder.complaint}</p>
    </header>
  );
}
