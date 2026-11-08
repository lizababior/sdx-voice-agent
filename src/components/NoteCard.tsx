import { formatClock } from "@/lib/format";
import type { Category, Note } from "@/lib/vacman";

const STYLE: Record<Category, { label: string; border: string; text: string; icon: React.ReactNode }> = {
  finding: {
    label: "Finding",
    border: "border-finding",
    text: "text-finding",
    icon: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-4.5-4.5" />
      </>
    ),
  },
  measurement: {
    label: "Measurement",
    border: "border-measurement",
    text: "text-measurement",
    icon: (
      <>
        <path d="M4 17a8 8 0 1 1 16 0" />
        <path d="m12 17 4-6" />
      </>
    ),
  },
  repair: {
    label: "Repair",
    border: "border-repair",
    text: "text-repair",
    icon: <path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5L15 12l-3-3z" />,
  },
  part: {
    label: "Part",
    border: "border-part",
    text: "text-part",
    icon: (
      <>
        <path d="M12 3 4 7v10l8 4 8-4V7z" />
        <path d="m4 7 8 4 8-4M12 11v10" />
      </>
    ),
  },
};

export function NoteCard({ note, time }: { note: Note; time: number }) {
  const s = STYLE[note.category];
  return (
    <article className={`animate-card-in rounded-card border border-l-4 border-line bg-surface px-4 py-3 ${s.border}`}>
      <p className={`flex items-center gap-2 text-[0.8125rem] font-semibold tracking-[0.06em] uppercase ${s.text}`}>
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {s.icon}
        </svg>
        {s.label}
      </p>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xl font-semibold">{note.text}</p>
        {note.quantity !== undefined && <p className="tabular shrink-0 text-xl">×{note.quantity}</p>}
      </div>
      <p className="flex justify-between text-[0.8125rem] text-text-dim">
        <span>{note.item_code ?? ""}</span>
        <span>{formatClock(new Date(time).toISOString())}</span>
      </p>
    </article>
  );
}
