import { startSandbox } from "@/lib/sandbox";

export const maxDuration = 120;

// Creates the job's warm sandbox. The phone page calls this when it opens.
export async function POST() {
  try {
    return Response.json(await startSandbox());
  } catch (err) {
    return Response.json({ status: "failed", error: String(err) }, { status: 500 });
  }
}
