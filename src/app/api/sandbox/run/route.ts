import { runPython } from "@/lib/sandbox";

export const maxDuration = 30;

// Runs the agent's Python (run_python tool) in the job's sandbox.
export async function POST(request: Request) {
  const { sandboxId, code } = (await request.json()) as { sandboxId?: string; code?: string };
  if (!sandboxId || !code) return Response.json({ error: "sandboxId and code are required" }, { status: 400 });
  try {
    return Response.json(await runPython(sandboxId, code));
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
