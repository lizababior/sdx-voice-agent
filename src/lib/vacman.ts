export type WorkOrder = {
  job_id: string;
  customer_name: string;
  address: string;
  equipment: string;
  model: string;
  refrigerant: string;
  metering_device: string;
  complaint: string;
  last_visit: string;
  technician: string;
};

export const CATEGORIES = ["finding", "measurement", "repair", "part"] as const;
export type Category = (typeof CATEGORIES)[number];

/** A job note. The wire shape for /api/sandbox/invoice is {id, text, category, item_code?, quantity?}. */
export type Note = {
  id: string;
  text: string;
  category: Category;
  item_code?: string;
  quantity?: number;
};

/** One row of the live feed on the phone. */
export type FeedItem =
  | { kind: "note"; id: string; note: Note; removed: boolean; time: number }
  | { kind: "chip"; id: string; tool: "run_python" | "create_invoice"; label: string; ok: boolean; time: number };

export type SandboxStatus = "warming" | "warm" | "failed";

export type InvoiceLine = {
  item_code: string;
  name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
};

/** The answer of /api/sandbox/invoice, plus a blob URL for the PDF. */
export type Invoice = {
  invoiceNumber: string;
  lineItems: InvoiceLine[];
  subtotal: number;
  tax: number;
  total: number;
  unpricedNotes: { note_id: string; item_code: string; text: string }[];
  pdfUrl: string;
};

export function asCategory(value: unknown): Category {
  return (CATEGORIES as readonly string[]).includes(String(value)) ? (value as Category) : "finding";
}

/** base64 -> Blob URL, for the iframe, the download link and print. */
export function pdfBlobUrl(base64: string): string {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
}
