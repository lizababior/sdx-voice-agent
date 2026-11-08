"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { getJob } from "@/lib/api";
import { useEvents } from "@/lib/useEvents";
import type { Job } from "@/lib/types";
import { InvoiceSheet } from "@/components/InvoiceSheet";
import { JobHeader } from "@/components/JobHeader";
import { Timeline } from "@/components/Timeline";
import { VoiceDock, VoiceProvider } from "@/components/VoiceAgent";

export function JobSession({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<Job | null | undefined>(undefined);
  const [loadError, setLoadError] = useState(false);
  const [dismissed, setDismissed] = useState<number | null>(null);
  const { events, fresh, error } = useEvents(jobId);

  useEffect(() => {
    getJob(jobId).then(setJob).catch(() => setLoadError(true));
  }, [jobId]);

  if (job === null) notFound();
  if (loadError) return <p className="p-4 text-danger">Can&apos;t reach the server. Go back and try again.</p>;
  if (!job) return <p className="p-4 text-text-dim">Loading the job…</p>;

  const invoice = [...events].reverse().find((e) => e.type === "invoice");
  const sheetOpen = invoice !== undefined && invoice.id !== dismissed;

  return (
    <VoiceProvider>
      <div className="flex h-dvh flex-col">
        <JobHeader job={job} />
        <Timeline events={events} fresh={fresh} error={error} />
        <VoiceDock job={job} />
      </div>
      {sheetOpen && invoice && <InvoiceSheet job={job} invoice={invoice} onClose={() => setDismissed(invoice.id)} />}
    </VoiceProvider>
  );
}
