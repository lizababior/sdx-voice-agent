/** "2:41p" */
export function formatClock(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const suffix = h >= 12 ? "p" : "a";
  h = h % 12 || 12;
  return `${h}:${m}${suffix}`;
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/** 30 -> "30m", 90 -> "1.5h" */
export function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const h = min / 60;
  return `${Number.isInteger(h) ? h : h.toFixed(1)}h`;
}
