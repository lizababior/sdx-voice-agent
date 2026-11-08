import Link from "next/link";
import type { Job } from "@/lib/types";

const DOT: Record<Job["status"], string> = {
  in_progress: "bg-accent",
  done: "bg-ok",
  not_started: "bg-text-dim",
};

const STATUS_WORD: Record<Job["status"], string> = {
  in_progress: "In progress",
  done: "Done",
  not_started: "Not started",
};

export function JobCard({ job, dim = false }: { job: Job; dim?: boolean }) {
  const active = job.status === "in_progress";
  return (
    <Link
      href={`/jobs/${job.id}`}
      className={`flex min-h-24 flex-col justify-center gap-0.5 rounded-card border bg-surface px-4 py-3 active:bg-surface-2 ${
        active ? "border-accent" : "border-line"
      } ${dim ? "text-text-dim" : "text-text"}`}
    >
      <span className="flex items-center gap-2 text-xl font-semibold">
        <span
          aria-label={STATUS_WORD[job.status]}
          role="img"
          className={`size-3 shrink-0 rounded-full ${DOT[job.status]}`}
        />
        {job.customer}
      </span>
      <span className="text-text-dim">{job.address}</span>
      <span className="text-text-dim">
        {job.time}
        {job.equipment ? ` · ${job.equipment}` : ""}
      </span>
      {job.complaint && (
        <span className="flex items-center justify-between">
          <span>{job.complaint}</span>
          <span aria-hidden className="text-text-dim">
            ›
          </span>
        </span>
      )}
    </Link>
  );
}
