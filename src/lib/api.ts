import { MOCK_JOBS, USE_MOCK } from "./mock";
import type { Job, JobEvent, JobGroup } from "./types";

const TECH_ID = "t1";

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
  const jobs = USE_MOCK ? MOCK_JOBS : await getJson<Job[]>(`/api/jobs?tech_id=${TECH_ID}`);
  return jobs.map(withGroup);
}

export async function getJob(id: string): Promise<Job | null> {
  if (USE_MOCK) return MOCK_JOBS.find((j) => j.id === id) ?? null;
  const res = await fetch(`/api/jobs/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return withGroup((await res.json()) as Job);
}

export async function getEvents(id: string): Promise<JobEvent[]> {
  return getJson<JobEvent[]>(`/api/jobs/${encodeURIComponent(id)}/events`);
}
