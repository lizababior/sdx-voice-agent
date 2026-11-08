"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { getJobs } from "@/lib/api";
import { MOCK_JOBS, USE_MOCK } from "@/lib/mock";
import type { Job, JobGroup } from "@/lib/types";
import { JobCard } from "./JobCard";

type GroupedJob = Job & { group: JobGroup };

const SECTIONS: { group: JobGroup; label: string }[] = [
  { group: "today", label: "Today" },
  { group: "upcoming", label: "Upcoming" },
  { group: "past", label: "Past" },
];

const subscribeNever = () => () => {};
const readToday = () =>
  new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

export function JobList() {
  const [jobs, setJobs] = useState<GroupedJob[] | null>(
    USE_MOCK ? MOCK_JOBS.map((j) => ({ ...j, group: j.group ?? "today" })) : null,
  );
  const [error, setError] = useState<string | null>(null);
  // The server snapshot is empty, so the date is read only in the browser.
  // Next 16 does not allow the current time during prerender.
  const today = useSyncExternalStore(subscribeNever, readToday, () => "");

  useEffect(() => {
    if (USE_MOCK) return;
    getJobs()
      .then(setJobs)
      .catch(() => setError("Can't reach the server. Pull down to try again."));
  }, []);

  const todayCount = jobs?.filter((j) => j.group === "today").length ?? 0;

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 pt-8 pb-safe">
      <header>
        <h1 className="text-[1.75rem] leading-tight font-bold">Hi, Mike</h1>
        <p className="min-h-7 text-text-dim">
          {today}
          {today && jobs ? " · " : ""}
          {jobs ? `${todayCount} ${todayCount === 1 ? "job" : "jobs"} today` : ""}
        </p>
      </header>

      {error && <p className="text-danger">{error}</p>}
      {!jobs && !error && <p className="text-text-dim">Loading your jobs…</p>}

      {jobs &&
        SECTIONS.map(({ group, label }) => {
          const items = jobs
            .filter((j) => j.group === group)
            // The job in progress goes first.
            .sort((a, b) => Number(b.status === "in_progress") - Number(a.status === "in_progress"));
          if (items.length === 0) return null;
          return (
            <section key={group} className="flex flex-col gap-3">
              <h2 className="text-[0.8125rem] font-semibold tracking-[0.06em] text-text-dim uppercase">
                {label}
              </h2>
              {items.map((job) => (
                <JobCard key={job.id} job={job} dim={group === "past"} />
              ))}
            </section>
          );
        })}
    </main>
  );
}
