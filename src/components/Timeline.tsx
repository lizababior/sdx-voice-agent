"use client";

import { useEffect, useRef } from "react";
import type { FeedItem } from "@/lib/vacman";
import { NoteCard } from "./NoteCard";
import { ResultChip } from "./ResultChip";

export type TranscriptLine = { id: number; role: "user" | "agent"; text: string };

export function Timeline({ feed, transcript }: { feed: FeedItem[]; transcript: TranscriptLine[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);

  function onScroll() {
    const el = ref.current;
    if (!el) return;
    nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  // Follow the newest card, unless the tech scrolled up to read.
  useEffect(() => {
    const el = ref.current;
    if (el && nearBottom.current) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [feed]);

  return (
    <div ref={ref} onScroll={onScroll} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
      {feed.length === 0 ? (
        <div className="m-auto flex max-w-72 flex-col items-center gap-3 text-center">
          <span aria-hidden className="flex size-14 items-center justify-center rounded-full bg-surface text-text-dim">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 5h10M9 12h10M9 19h10M5 5h.01M5 12h.01M5 19h.01" />
            </svg>
          </span>
          <p className="font-semibold">No notes yet</p>
          <p className="-mt-2 text-[0.9375rem] text-text-dim">Tap the mic and say what you see. Notes show up here.</p>
        </div>
      ) : (
        feed.map((item) =>
          item.kind === "chip" ? (
            <ResultChip key={item.id} item={item} />
          ) : item.removed ? (
            <p key={item.id} className="px-1 text-text-dim">
              Removed: {item.note.text}
            </p>
          ) : (
            <NoteCard key={item.id} note={item.note} time={item.time} />
          ),
        )
      )}

      {transcript.length > 0 && (
        <details className="mt-2 rounded-card border border-line bg-surface">
          <summary className="flex min-h-14 cursor-pointer items-center px-4 font-semibold">
            Transcript ({transcript.length})
          </summary>
          <ul className="flex flex-col gap-2 px-4 pb-4">
            {transcript.map((l) => (
              <li key={l.id} className={l.role === "user" ? "text-text" : "text-text-dim"}>
                <span className="font-semibold">{l.role === "user" ? "You" : "VacMan"}: </span>
                {l.text}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
