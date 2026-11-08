// Replays the demo's tool calls against a real Daytona sandbox. No mocks.
// Run with: npm run replay   (Section 8 of Docs/VacMan-Build-Plan-v2.md)
import { readFileSync } from "node:fs";
import { createInvoice, runPython, startSandbox, type JobNote } from "../src/lib/sandbox.ts";

let failed = false;
function check(name: string, ok: boolean, detail = "") {
  if (!ok) failed = true;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  ${detail}` : ""}`);
}

const workOrder = JSON.parse(readFileSync("data/work-order.json", "utf8"));
const host = "import socket; print(socket.gethostname())";

const t0 = Date.now();
const { sandboxId } = await startSandbox();
console.log(`      sandbox ${sandboxId} warm in ${Date.now() - t0} ms`);
const hostBefore = (await runPython(sandboxId, host)).stdout.trim();

// 1-2. Diagnosis, measurement and repair notes, as log_job_note would build them. Includes a capacitor.
let notes: JobNote[] = [
  { id: "n1", category: "finding", text: "Outdoor board flashing code 32, low-pressure switch trip", item_code: "DIAG-STD", quantity: 1 },
  { id: "n2", category: "measurement", text: "Suction 105 psig, suction line 60°F, R-410A" },
  { id: "n3", category: "finding", text: "Leak found at the suction Schrader core", item_code: "LEAK-SRCH", quantity: 1 },
  { id: "n4", category: "repair", text: "Replaced the Schrader core", item_code: "SCHR-CORE", quantity: 1 },
  { id: "n5", category: "part", text: "Added 2 lb R-410A", item_code: "R410A-LB", quantity: 2 },
  { id: "n6", category: "repair", text: "Replaced the dual run capacitor", item_code: "CAP-DUAL", quantity: 1 },
];

// 3. The technician changes their mind: remove the capacitor note.
notes = notes.filter((n) => n.id !== "n6");

// 4. Superheat, written the way the agent would.
const run = await runPython(
  sandboxId,
  'import hvac\nsat = hvac.saturation_temp("R-410A", 105)\nprint(round(60 - sat, 1))',
);
const superheat = Number(run.stdout.trim());
check("superheat is 26°F ±2", run.exitCode === 0 && Math.abs(superheat - 26) <= 2, `${run.stdout.trim()} (${run.ms} ms)`);

// A broken program returns its error text, not a crash.
const bad = await runPython(sandboxId, "print(1/0)");
check("errors come back as text", bad.exitCode !== 0 && bad.stdout.includes("ZeroDivisionError"));

// 5. The invoice.
const t1 = Date.now();
const inv = await createInvoice(sandboxId, workOrder, notes);
console.log(`      invoice ${inv.invoiceNumber} in ${Date.now() - t1} ms`);
const codes = inv.lineItems.map((li) => li.item_code);
check("no capacitor on the invoice", !codes.includes("CAP-DUAL"));
check("line items are correct", codes.join(",") === "DIAG-STD,LEAK-SRCH,SCHR-CORE,R410A-LB", codes.join(","));
// 129 + 249 + 89 + 2 × 95 = 657; tax 7.75% = 50.92; total 707.92
check("subtotal, tax and total", inv.subtotal === 657 && inv.tax === 50.92 && inv.total === 707.92,
  `${inv.subtotal} + ${inv.tax} = ${inv.total}`);
const pdf = Buffer.from(inv.pdfBase64, "base64");
check("PDF is not empty", pdf.length > 1000 && pdf.subarray(0, 4).toString() === "%PDF", `${pdf.length} bytes`);

const hostAfter = (await runPython(sandboxId, host)).stdout.trim();
check("same sandbox for all calls", hostBefore !== "" && hostBefore === hostAfter, hostBefore);

process.exit(failed ? 1 : 0);
