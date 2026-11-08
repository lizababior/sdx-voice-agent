"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { getJob } from "@/lib/api";
import { useJobSession } from "@/lib/useJobSession";
import { dynamicVariables } from "@/lib/workOrder";
import type { Job } from "@/lib/types";
import { InvoiceSheet } from "@/components/InvoiceSheet";
import { JobTools } from "@/components/JobTools";
import { JobHeader } from "@/components/JobHeader";
import { Timeline } from "@/components/Timeline";
import { VoiceDock, VoiceProvider } from "@/components/VoiceAgent";

export function JobSession({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<Job | null | undefined>(undefined);
  const [loadError, setLoadError] = useState(false);
  const [dismissed, setDismissed] = useState<number | null>(null);
  // The job notes, the warm sandbox and the agent tool actions live in the page (build doc v2).
  const session = useJobSession();
  const { events, fresh } = session;

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
      <JobTools tools={session} />
      <div className="flex h-dvh flex-col">
        <JobHeader job={job} />
        <Timeline events={events} fresh={fresh} error={session.sandboxStatus === "failed"} />
        <VoiceDock dynamicVariables={dynamicVariables} />
      </div>
      {sheetOpen && invoice && <InvoiceSheet job={job} invoice={invoice} onClose={() => setDismissed(invoice.id)} />}
    </VoiceProvider>
  );
}
