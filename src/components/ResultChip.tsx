import type { FeedItem } from "@/lib/vacman";

export function ResultChip({ item }: { item: Extract<FeedItem, { kind: "chip" }> }) {
  return (
    <p
      className={`animate-card-in w-fit max-w-full rounded-full border px-4 py-2 text-lg font-semibold ${
        item.ok ? "border-line bg-surface-2 text-text" : "border-danger text-danger"
      }`}
    >
      <span className="mr-2 text-text-dim">{item.tool === "run_python" ? "Calc" : "Invoice"}</span>
      {item.label}
    </p>
  );
}
