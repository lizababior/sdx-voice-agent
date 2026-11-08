import { notFound } from "next/navigation";
import { VoiceAgent } from "@/components/VoiceAgent";
import { JOBS, findJob } from "@/lib/jobs";

export function generateStaticParams() {
  return JOBS.map((j) => ({ id: j.job_id }));
}

export default async function JobByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const job = findJob((await params).id);
  if (!job) notFound();
  return <VoiceAgent workOrder={job} />;
}
