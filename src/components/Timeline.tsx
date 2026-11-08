"use client";

import { useEffect, useRef } from "react";
import type { JobEvent } from "@/lib/types";
import { EventCard } from "./EventCard";
import { SubstituteCard } from "./SubstituteCard";

export function Timeline({
  events,
  fresh,
  error,
}: {
  events: JobEvent[];
  fresh: Set<number>;
  error: boolean;
}) {
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
  }, [events]);

  // The invoice has its own sheet, so it does not show as a card.
  const visible = events.filter((e) => e.type !== "invoice");

  return (
    <div ref={ref} onScroll={onScroll} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
      {error && <p className="text-danger">Lost connection. Retrying.</p>}
      {visible.length === 0 ? (
        <p className="m-auto max-w-72 text-center text-text-dim">
          Nothing logged yet. Tap the mic and say what you did.
        </p>
      ) : (
        visible.map((e) =>
          e.type === "substitute" ? (
            <SubstituteCard key={e.id} event={e} isNew={fresh.has(e.id)} />
          ) : (
            <EventCard key={e.id} event={e} isNew={fresh.has(e.id)} />
          ),
        )
      )}
    </div>
  );
}
