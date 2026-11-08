"use client";

import { useEffect, useRef, useState } from "react";
import { getEvents } from "./api";
import { MOCK_FEED, USE_MOCK } from "./mock";
import type { JobEvent } from "./types";

const POLL_MS = 2000;
const MOCK_MS = 3000;

/** Merge incoming events by id. A known id replaces the old card, so removals update in place. */
function merge(prev: JobEvent[], incoming: JobEvent[]): { next: JobEvent[]; added: number[] } {
  const byId = new Map(prev.map((e) => [e.id, e]));
  const added: number[] = [];
  for (const e of incoming) {
    if (!byId.has(e.id)) added.push(e.id);
    byId.set(e.id, e);
  }
  const next = [...byId.values()].sort((a, b) => a.id - b.id);
  return { next, added };
}

/**
 * Polls the events for a job. `fresh` holds the ids that arrived after the first load.
 * The timeline uses it to animate only new cards.
 */
export function useEvents(jobId: string) {
  const [events, setEvents] = useState<JobEvent[]>([]);
  const [fresh, setFresh] = useState<Set<number>>(new Set());
  const [error, setError] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    loaded.current = false;
    let stopped = false;

    function apply(incoming: JobEvent[]) {
      setEvents((prev) => {
        const { next, added } = merge(prev, incoming);
        if (loaded.current && added.length > 0) {
          setFresh((f) => new Set([...f, ...added]));
        }
        return next;
      });
      loaded.current = true;
    }

    if (USE_MOCK) {
      let i = 0;
      const timer = setInterval(() => {
        if (i >= MOCK_FEED.length) return clearInterval(timer);
        loaded.current = true;
        apply([MOCK_FEED[i++]]);
      }, MOCK_MS);
      return () => clearInterval(timer);
    }

    async function poll() {
      try {
        const data = await getEvents(jobId);
        if (stopped) return;
        setError(false);
        apply(data);
      } catch {
        if (!stopped) setError(true);
      }
    }
    poll();
    const timer = setInterval(poll, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [jobId]);

  return { events, fresh, error };
}
