// Deandre's Daytona back office. Used by /api/sandbox/* and `npm run replay`.
// No "@/..." imports, so Node can run this file directly in scripts.
import { readFileSync } from "node:fs";
import path from "node:path";
import { Daytona, type Sandbox } from "@daytonaio/sdk";

const DIR = "vacman"; // folder in the sandbox that holds the helpers and data
const FILES = ["sandbox/hvac.py", "sandbox/invoice.py", "data/price-book.csv", "data/pt-tables.csv"];

// On globalThis so Next.js hot reloads keep the cache.
const g = globalThis as unknown as {
  vmDaytona?: Daytona;
  vmSandboxes?: Map<string, Sandbox>;
  vmStarting?: Promise<{ sandboxId: string; status: "warm" }>;
};
const daytona = () => (g.vmDaytona ??= new Daytona()); // reads DAYTONA_API_KEY
const cache = () => (g.vmSandboxes ??= new Map());

const LABELS = { app: "vacman" };

/**
 * Returns the job's warm sandbox. Every page, tab and reload shares one sandbox: a running VacMan
 * sandbox is reused, and a new one is created only when none runs. A live sandbox is never deleted,
 * because a start from another tab used to delete the sandbox of the open job screen.
 */
export function startSandbox() {
  // Starts at the same moment (two tabs) share one request, so they do not create two sandboxes.
  g.vmStarting ??= startOrReuse().finally(() => {
    g.vmStarting = undefined;
  });
  return g.vmStarting;
}

async function startOrReuse() {
  const all: Sandbox[] = [];
  for await (const s of daytona().list({ labels: LABELS })) all.push(s);
  // Clean up sandboxes that are not running. The account allows only 10 CPUs.
  await Promise.allSettled(all.filter((s) => s.state !== "started").map((s) => s.delete()));

  const running = all
    .filter((s) => s.state === "started")
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  for (const sandbox of running) {
    try {
      // Setup again: it copies the latest helpers and data, and proves that the sandbox answers.
      await setUp(sandbox);
      // Older sandboxes had an idle timer. Turn it off, so the sandbox never stops for inactivity.
      if (sandbox.autoStopInterval !== 0) await sandbox.setAutostopInterval(0);
      cache().set(sandbox.id, sandbox);
      return { sandboxId: sandbox.id, status: "warm" as const };
    } catch {
      await sandbox.delete().catch(() => {});
    }
  }

  // Setup takes ~3 s, but once in testing it hung. A hung sandbox is deleted and a fresh one tried once.
  for (let attempt = 1; ; attempt++) {
    // autoStopInterval 0: the sandbox never stops for inactivity, so it lasts through the demo and the finals.
    const sandbox = await daytona().create({ language: "python", ephemeral: true, autoStopInterval: 0, labels: LABELS });
    try {
      await setUp(sandbox);
      cache().set(sandbox.id, sandbox);
      return { sandboxId: sandbox.id, status: "warm" as const };
    } catch (err) {
      await sandbox.delete().catch(() => {});
      if (attempt === 2) throw err;
    }
  }
}

async function setUp(sandbox: Sandbox) {

  // Files go in through env vars, not fs.uploadFiles: the SDK's upload breaks when Next.js bundles it.
  const env: Record<string, string> = {};
  const writes = FILES.map((file, i) => {
    env[`F${i}`] = readFileSync(path.join(process.cwd(), file)).toString("base64");
    return `printf %s "$F${i}" | base64 -d > ${DIR}/${path.basename(file)}`;
  });
  const setup = [
    `mkdir -p ${DIR}`,
    ...writes,
    `(python3 -c "import reportlab" 2>/dev/null || pip install -q reportlab)`,
  ].join(" && ");
  const res = await sandbox.process.executeCommand(`sh -c '${setup}'`, undefined, env, 40);
  if (res.exitCode !== 0) throw new Error(`Sandbox setup failed: ${res.result}`);
}

async function getSandbox(sandboxId: string): Promise<Sandbox> {
  const hit = cache().get(sandboxId);
  if (hit) return hit;
  const sandbox = await daytona().get(sandboxId);
  cache().set(sandboxId, sandbox);
  return sandbox;
}

/** Runs the agent's Python in the job's sandbox. `import hvac` works. 10-second limit. */
export async function runPython(sandboxId: string, code: string) {
  const sandbox = await getSandbox(sandboxId);
  const started = Date.now();
  try {
    const res = await sandbox.process.executeCommand(`sh -c 'python3 -c "$CODE" 2>&1'`, DIR, { CODE: code }, 10);
    return { stdout: res.result, exitCode: res.exitCode, ms: Date.now() - started };
  } catch (err) {
    if (!String(err).includes("timeout")) throw err;
    return { stdout: "Error: the code ran longer than 10 seconds and was stopped.", exitCode: 124, ms: Date.now() - started };
  }
}

export type JobNote = { id: string; text: string; category: string; item_code?: string; quantity?: number };
export type Invoice = {
  invoiceNumber: string;
  lineItems: { item_code: string; name: string; quantity: number; unit: string; unit_price: number; amount: number }[];
  subtotal: number;
  tax: number;
  total: number;
  pdfBase64: string;
  unpricedNotes: { note_id: string; item_code: string; text: string }[];
};

/** Prices the notes from the price book and builds the PDF, in the job's sandbox. */
export async function createInvoice(sandboxId: string, workOrder: unknown, notes: JobNote[]): Promise<Invoice> {
  const sandbox = await getSandbox(sandboxId);
  const res = await sandbox.process.executeCommand("python3 invoice.py", DIR, {
    ARGS: JSON.stringify({ workOrder, notes }),
  }, 30);
  if (res.exitCode !== 0) throw new Error(`invoice.py failed: ${res.result}`);
  return JSON.parse(res.result);
}
