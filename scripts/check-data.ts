// Checks the shop data files in /data. Run with: npm run check:data
import { readFileSync } from "node:fs";

let failed = false;
function check(name: string, ok: boolean, detail = "") {
  if (!ok) failed = true;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  ${detail}` : ""}`);
}

function readCsv(path: string) {
  const [header, ...lines] = readFileSync(path, "utf8").trim().split("\n");
  const cols = header.split(",");
  return { cols, rows: lines.map((l) => Object.fromEntries(l.split(",").map((v, i) => [cols[i], v]))) };
}

// Work order: every field in the data formats of the build doc.
const workOrder = JSON.parse(readFileSync("data/work-order.json", "utf8"));
const woFields = ["job_id", "customer_name", "address", "equipment", "model", "refrigerant",
  "metering_device", "complaint", "last_visit", "technician"];
const missing = woFields.filter((f) => !workOrder[f]);
check("work order has all fields", missing.length === 0, missing.join(", "));

// Price book.
const pb = readCsv("data/price-book.csv");
check("price book columns", pb.cols.join(",") === "item_code,name,price,unit");
check("price book has about 30 items", pb.rows.length >= 25, `${pb.rows.length} items`);
const badRows = pb.rows.filter((r) => !(Number(r.price) > 0) || !["each", "lb"].includes(r.unit));
check("price book prices and units are valid", badRows.length === 0, badRows.map((r) => r.item_code).join(", "));
const codes = pb.rows.map((r) => r.item_code);
check("price book item codes are unique", new Set(codes).size === codes.length);
const required = ["DIAG-STD", "LEAK-SRCH", "SCHR-CORE", "R410A-LB", "CAP-DUAL", "CONT-1P", "DIAG-AH"];
const absent = required.filter((c) => !codes.includes(c));
check("price book has the demo items", absent.length === 0, absent.join(", "));

// PT tables: same interpolation as the sandbox helper.
const pt = readCsv("data/pt-tables.csv");
check("PT table columns", pt.cols.join(",") === "refrigerant,psig,sat_temp_f");
function saturationTemp(refrigerant: string, psig: number) {
  const rows = pt.rows.filter((r) => r.refrigerant === refrigerant)
    .map((r) => ({ p: Number(r.psig), t: Number(r.sat_temp_f) })).sort((a, b) => a.p - b.p);
  const hi = rows.findIndex((r) => r.p >= psig);
  if (hi <= 0) throw new Error(`${psig} psig is outside the ${refrigerant} table`);
  const a = rows[hi - 1], b = rows[hi];
  return a.t + ((psig - a.p) * (b.t - a.t)) / (b.p - a.p);
}
for (const ref of ["R-410A", "R-22"]) {
  const temps = pt.rows.filter((r) => r.refrigerant === ref).map((r) => Number(r.psig));
  check(`PT table ${ref} increases`, temps.length > 5 && temps.every((p, i) => i === 0 || p > temps[i - 1]));
}
const sat = saturationTemp("R-410A", 105);
check("R-410A at 105 psig is about 34°F", Math.abs(sat - 34) <= 1, `${sat.toFixed(1)}°F`);
const superheat = 60 - sat;
check("demo superheat is about 26°F", Math.abs(superheat - 26) <= 2, `${superheat.toFixed(1)}°F`);

process.exit(failed ? 1 : 0);
