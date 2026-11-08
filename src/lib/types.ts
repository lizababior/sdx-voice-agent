export type JobStatus = "not_started" | "in_progress" | "done";
export type JobGroup = "today" | "upcoming" | "past";

export type Job = {
  id: string;
  customer: string;
  address: string;
  /** Display time, for example "9:30 AM" or "Tue 10:00 AM". */
  time: string;
  status: JobStatus;
  /** The list endpoint may leave these out. The job endpoint always has them. */
  equipment?: string;
  complaint?: string;
  /** If the backend does not send a group, the client derives it from the status. */
  group?: JobGroup;
};

export type EventType = "part" | "tool" | "labor" | "damage" | "note" | "substitute" | "invoice";

export type SubstituteOption = {
  part_no: string;
  name: string;
  price: number;
  why: string;
};

export type InvoiceLine = { label: string; amount: number };

export type JobEvent = {
  /** Stable and increasing. The timeline keys cards by this. */
  id: number;
  type: EventType;
  item: string;
  qty?: number;
  labor_min?: number;
  notes?: string;
  created_at: string;
  /** Set when undo_last removed this event. */
  removed?: boolean;
  /** type "substitute" */
  options?: SubstituteOption[];
  /** type "invoice" */
  total?: number;
  invoice_url?: string;
  line_items?: InvoiceLine[];
};
