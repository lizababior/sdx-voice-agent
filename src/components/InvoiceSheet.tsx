"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import type { Job, JobEvent } from "@/lib/types";

export function InvoiceSheet({ job, invoice, onClose }: { job: Job; invoice: JobEvent; onClose: () => void }) {
  const [showFull, setShowFull] = useState(false);
  const [saved, setSaved] = useState(false);
  // v2: the invoice PDF from the Daytona sandbox, as a blob URL.
  const url = invoice.invoice_url ?? `/invoices/${job.id}`;

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
          <p className="text-text-dim">Invoice ready</p>
          <p className="tabular text-5xl font-bold">{formatMoney(invoice.total ?? 0)}</p>
          <p className="text-text-dim">
            {job.customer} · {job.address}
          </p>
        </div>

        {invoice.line_items && invoice.line_items.length > 0 && (
          <ul className="divide-y divide-line rounded-card border border-line">
            {invoice.line_items.map((l) => (
              <li key={l.label} className="flex justify-between px-4 py-3">
                <span>{l.label}</span>
                <span className="tabular">{formatMoney(l.amount)}</span>
              </li>
            ))}
          </ul>
        )}

        {showFull && (
          <iframe title="Full invoice" src={url} className="h-96 w-full rounded-card border border-line bg-white" />
        )}

        <div className="flex flex-col gap-3">
          <a
            href={url}
            download={`Invoice-${job.customer}-${job.id}.pdf`}
            onClick={() => setSaved(true)}
            className="flex h-14 items-center justify-center rounded-button bg-accent text-lg font-semibold text-accent-ink active:opacity-80"
          >
            Download invoice
          </a>
          {saved && <p className="text-ok">Saved. Email or share it from your Files.</p>}
          <div className="flex gap-3">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex h-14 flex-1 items-center justify-center rounded-button border border-line text-lg font-semibold active:bg-surface-2"
            >
              Print
            </a>
            <button
              type="button"
              onClick={() => setShowFull((v) => !v)}
              className="h-14 flex-1 rounded-button border border-line text-lg font-semibold active:bg-surface-2"
            >
              {showFull ? "Hide full" : "View full"}
            </button>
          </div>
          <button type="button" onClick={onClose} className="h-14 text-lg text-text-dim active:text-text">
            Done
          </button>
        </div>
      </section>
    </div>
  );
}
