import { formatClock, formatMoney } from "@/lib/format";
import type { JobEvent } from "@/lib/types";

export function SubstituteCard({ event, isNew }: { event: JobEvent; isNew: boolean }) {
  return (
    <article
      className={`rounded-card border border-accent bg-surface px-4 py-3 ${isNew ? "animate-card-in" : ""}`}
    >
      <p className="text-[0.8125rem] font-semibold tracking-[0.06em] text-accent uppercase">Substitute</p>
      <p className="mb-2 text-xl font-semibold">Substitute for {event.item}</p>
      <ul className="flex flex-col divide-y divide-line">
        {(event.options ?? []).slice(0, 3).map((o) => (
          <li key={o.part_no} className="flex min-h-14 flex-col justify-center py-2">
            <span className="flex items-baseline justify-between gap-3">
              <span className="font-semibold">
                {o.part_no} · {o.name}
              </span>
              <span className="tabular shrink-0">{formatMoney(o.price)}</span>
            </span>
            <span className="text-text-dim">{o.why}</span>
          </li>
        ))}
      </ul>
      <p className="text-right text-[0.8125rem] text-text-dim">{formatClock(event.created_at)}</p>
    </article>
  );
}
