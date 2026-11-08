import { MOCK_JOBS, USE_MOCK } from "./mock";
import type { Job, JobEvent, JobGroup } from "./types";
import { workOrderJob } from "./workOrder";

function withGroup(job: Job): Job & { group: JobGroup } {
  if (job.group) return job as Job & { group: JobGroup };
  return { ...job, group: job.status === "done" ? "past" : "today" };
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json() as Promise<T>;
}

export async function getJobs(): Promise<(Job & { group: JobGroup })[]> {
  // v2: one hardcoded work order (data/work-order.json), no jobs backend.
  const jobs = USE_MOCK ? MOCK_JOBS : [workOrderJob];
  return jobs.map(withGroup);
}

export async function getJob(id: string): Promise<Job | null> {
  if (USE_MOCK) return MOCK_JOBS.find((j) => j.id === id) ?? null;
  return id === workOrderJob.id ? withGroup(workOrderJob) : null;
}

export async function getEvents(id: string): Promise<JobEvent[]> {
  return getJson<JobEvent[]>(`/api/jobs/${encodeURIComponent(id)}/events`);
}
