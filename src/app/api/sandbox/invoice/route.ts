import { createInvoice, type JobNote } from "@/lib/sandbox";

export const maxDuration = 60;

// Builds the invoice PDF (create_invoice tool) in the job's sandbox.
export async function POST(request: Request) {
  const { sandboxId, workOrder, notes } = (await request.json()) as {
    sandboxId?: string;
    workOrder?: unknown;
    notes?: JobNote[];
  };
  if (!sandboxId || !workOrder) return Response.json({ error: "sandboxId and workOrder are required" }, { status: 400 });
  try {
    return Response.json(await createInvoice(sandboxId, workOrder, notes ?? []));
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
