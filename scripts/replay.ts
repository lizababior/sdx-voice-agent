// Replays the demo's tool calls against a real Daytona sandbox. No mocks.
// Run with: npm run replay   (Section 8 of Docs/VacMan-Build-Plan-v2.md)
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
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
const pdfPath = path.join(tmpdir(), "vacman-invoice.pdf");
writeFileSync(pdfPath, pdf);
console.log(`      PDF saved: open ${pdfPath}`);

// Extra jobs (data/extra-work-orders.json). Same seam, other faults. Docs/Test-Scripts.md has the voice scripts.
const extra: Record<string, unknown>[] = JSON.parse(readFileSync("data/extra-work-orders.json", "utf8"));
const job = (id: string) => extra.find((w) => w.job_id === id)!;
type Scenario = { job: string; calc: string; expect: number; tol: number; notes: JobNote[]; codes: string; total: number };
const scenarios: Scenario[] = [
  { // Dan: capacitor 41 µF on a 45 µF rating is 8.9% low, past the 6% limit. The contactor note is taken back.
    job: "JOB-1043", calc: "print(round((45 - 41) / 45 * 100, 1))", expect: 8.9, tol: 0.1,
    notes: [
      { id: "n1", category: "finding", text: "After-hours call", item_code: "DIAG-AH", quantity: 1 },
      { id: "n2", category: "finding", text: "Diagnostic", item_code: "DIAG-STD", quantity: 1 },
      { id: "n3", category: "repair", text: "Replaced the dual run capacitor", item_code: "CAP-DUAL", quantity: 1 },
    ],
    codes: "DIAG-AH,DIAG-STD,CAP-DUAL", total: 505.35,
  },
  { // Rosa: subcooling 12°F at 365 psig / 98°F. The 1-inch filter note was swapped for the 4-inch one.
    job: "JOB-1044", calc: 'import hvac\nprint(round(hvac.saturation_temp("R-410A", 365) - 98, 1))', expect: 12, tol: 1,
    notes: [
      { id: "n1", category: "finding", text: "Diagnostic", item_code: "DIAG-STD", quantity: 1 },
      { id: "n2", category: "part", text: "Replaced the 4-inch media filter", item_code: "FILTER-4IN", quantity: 1 },
      { id: "n3", category: "repair", text: "Cleaned the evaporator coil", item_code: "COIL-CLEAN-EVAP", quantity: 1 },
    ],
    codes: "DIAG-STD,FILTER-4IN,COIL-CLEAN-EVAP", total: 595.86,
  },
  { // Earl: R-22 superheat about 22.6°F at 58 psig / 55°F. 1.5 lb was corrected to 2 lb.
    job: "JOB-1045", calc: 'import hvac\nprint(round(55 - hvac.saturation_temp("R-22", 58), 1))', expect: 22.6, tol: 1,
    notes: [
      { id: "n1", category: "finding", text: "Diagnostic", item_code: "DIAG-STD", quantity: 1 },
      { id: "n2", category: "part", text: "Added 2 lb R-22", item_code: "R22-LB", quantity: 2 },
    ],
    codes: "DIAG-STD,R22-LB", total: 494.57,
  },
];
for (const s of scenarios) {
  const r = await runPython(sandboxId, s.calc);
  check(`${s.job} calculation`, r.exitCode === 0 && Math.abs(Number(r.stdout.trim()) - s.expect) <= s.tol, r.stdout.trim());
  const v = await createInvoice(sandboxId, job(s.job), s.notes);
  const got = v.lineItems.map((li) => li.item_code).join(",");
  check(`${s.job} invoice`, got === s.codes && v.total === s.total && v.unpricedNotes.length === 0, `${got} = $${v.total}`);
}

const hostAfter = (await runPython(sandboxId, host)).stdout.trim();
check("same sandbox for all calls", hostBefore !== "" && hostBefore === hostAfter, hostBefore);

process.exit(failed ? 1 : 0);
