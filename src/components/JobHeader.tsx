import Link from "next/link";
import type { Job } from "@/lib/types";

export function JobHeader({ job }: { job: Job }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg px-4 pt-3 pb-3">
      <Link href="/" className="flex h-14 w-fit items-center pr-6 text-text-dim active:text-text">
        ‹ Jobs
      </Link>
      <h1 className="text-[1.75rem] leading-tight font-bold">{job.customer}</h1>
      <p className="text-text-dim">{job.address}</p>
      <p className="text-text-dim">{[job.equipment, job.complaint].filter(Boolean).join(" · ")}</p>
    </header>
  );
}
