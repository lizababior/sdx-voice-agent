import { Suspense } from "react";
import { JobSession } from "./JobSession";

export default function Page({ params }: PageProps<"/jobs/[id]">) {
  return (
    <Suspense fallback={<p className="p-4 text-text-dim">Loading the job…</p>}>
      <Session params={params} />
    </Suspense>
  );
}

// Await params inside Suspense. Next 16 with Cache Components needs this.
async function Session({ params }: Pick<PageProps<"/jobs/[id]">, "params">) {
  const { id } = await params;
  return <JobSession jobId={id} />;
}
