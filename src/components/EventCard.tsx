import { formatClock, formatMinutes } from "@/lib/format";
import type { EventType, JobEvent } from "@/lib/types";

export const TYPE_STYLE: Record<EventType, { label: string; border: string; text: string }> = {
  part: { label: "Part", border: "border-part", text: "text-part" },
  tool: { label: "Tool", border: "border-tool", text: "text-tool" },
  labor: { label: "Labor", border: "border-labor", text: "text-labor" },
  damage: { label: "Damage", border: "border-damage", text: "text-damage" },
  note: { label: "Note", border: "border-note", text: "text-note" },
  substitute: { label: "Substitute", border: "border-accent", text: "text-accent" },
  invoice: { label: "Invoice", border: "border-ok", text: "text-ok" },
};

export function EventCard({ event, isNew }: { event: JobEvent; isNew: boolean }) {
  if (event.removed) {
    return (
      <p className={`px-1 text-text-dim ${isNew ? "animate-card-in" : ""}`}>Removed: {event.item}</p>
    );
  }
  const style = TYPE_STYLE[event.type];
  const amount = event.labor_min
    ? formatMinutes(event.labor_min)
    : event.qty
      ? `×${event.qty}`
      : "";
  return (
    <article
      className={`rounded-card border border-l-4 border-line bg-surface px-4 py-3 ${style.border} ${
        isNew ? "animate-card-in" : ""
      }`}
    >
      <p className={`text-[0.8125rem] font-semibold tracking-[0.06em] uppercase ${style.text}`}>
        {style.label}
      </p>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xl font-semibold">{event.item}</p>
        {amount && <p className="tabular shrink-0 text-xl">{amount}</p>}
      </div>
      {event.notes && <p className="text-text-dim">{event.notes}</p>}
      <p className="text-right text-[0.8125rem] text-text-dim">{formatClock(event.created_at)}</p>
    </article>
  );
}
