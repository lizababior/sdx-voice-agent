"use client";

import { useRef } from "react";
import { formatMoney } from "@/lib/format";
import type { Invoice, WorkOrder } from "@/lib/vacman";

export function InvoiceSheet({
  workOrder,
  invoice,
  onClose,
}: {
  workOrder: WorkOrder;
  invoice: Invoice;
  onClose: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const fileName = `${invoice.invoiceNumber}.pdf`;

  function print() {
    try {
      frame.current?.contentWindow?.print();
    } catch {
      window.open(invoice.pdfUrl, "_blank");
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-end">
      <button type="button" aria-label="Close invoice" onClick={onClose} className="flex-1 bg-black/60" />
      <section
        role="dialog"
        aria-label="Invoice"
        className="pb-safe flex max-h-[85dvh] flex-col gap-4 overflow-y-auto rounded-t-sheet border-t border-line bg-surface px-4 pt-3"
      >
        <button type="button" aria-label="Close invoice" onClick={onClose} className="mx-auto flex h-8 w-24 items-center justify-center">
          <span className="h-1.5 w-12 rounded-full bg-line" />
        </button>

        <div>
          <p className="text-text-dim">Invoice {invoice.invoiceNumber}</p>
          <p className="tabular text-5xl font-bold">{formatMoney(invoice.total)}</p>
          <p className="text-text-dim">
            {workOrder.customer_name} · {workOrder.address}
          </p>
          <p className="mt-1 font-semibold text-ok">Sent to office for review</p>
        </div>

        <ul className="divide-y divide-line rounded-card border border-line">
          {invoice.lineItems.map((l) => (
            <li key={l.item_code} className="flex justify-between gap-3 px-4 py-3">
              <span>
                {l.name}
                {l.quantity !== 1 ? ` ×${l.quantity}` : ""}
              </span>
              <span className="tabular shrink-0">{formatMoney(l.amount)}</span>
            </li>
          ))}
          <li className="flex justify-between px-4 py-3 text-text-dim">
            <span>Tax</span>
            <span className="tabular">{formatMoney(invoice.tax)}</span>
          </li>
        </ul>

        {invoice.unpricedNotes.length > 0 && (
          <p className="text-danger">
            Not priced: {invoice.unpricedNotes.map((n) => n.item_code).join(", ")}. Check the item codes.
          </p>
        )}

        <iframe
          ref={frame}
          title={`Invoice ${invoice.invoiceNumber} PDF`}
          src={invoice.pdfUrl}
          className="h-96 w-full rounded-card border border-line bg-white"
        />

        <div className="flex flex-col gap-3">
          <a
            href={invoice.pdfUrl}
            download={fileName}
            className="flex h-14 items-center justify-center rounded-button bg-accent text-lg font-semibold text-accent-ink active:opacity-80"
          >
            Download invoice
          </a>
          <button
            type="button"
            onClick={print}
            className="h-14 rounded-button border border-line text-lg font-semibold active:bg-surface-2"
          >
            Print
          </button>
          <button type="button" onClick={onClose} className="h-14 text-lg text-text-dim active:text-text">
            Done
          </button>
        </div>
      </section>
    </div>
  );
}
