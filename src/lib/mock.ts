import type { Job, JobEvent } from "./types";

/** Use mock data when the backend is not ready. Set NEXT_PUBLIC_USE_MOCK=1. */
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "1";

export const MOCK_JOBS: Job[] = [
  {
    id: "j1",
    customer: "Garcia",
    address: "412 Palm St",
    time: "9:30 AM",
    status: "in_progress",
    equipment: "Carrier 24ANA6 3T",
    complaint: "Not cooling",
    group: "today",
  },
  {
    id: "j2",
    customer: "Nguyen",
    address: "88 Bayview Ct",
    time: "11:45 AM",
    status: "not_started",
    equipment: "Trane XR14 4T",
    complaint: "Short cycling",
    group: "today",
  },
  {
    id: "j3",
    customer: "Patel",
    address: "1920 Orchard Ln",
    time: "2:15 PM",
    status: "not_started",
    equipment: "Lennox ML14 2T",
    complaint: "Frozen coil",
    group: "today",
  },
  {
    id: "j4",
    customer: "Brooks",
    address: "35 Ridge Rd",
    time: "Tue 10:00 AM",
    status: "not_started",
    equipment: "Goodman GSX14 3T",
    complaint: "Annual tune-up",
    group: "upcoming",
  },
  {
    id: "j5",
    customer: "Okafor",
    address: "607 Cedar Ave",
    time: "Fri 3:30 PM",
    status: "done",
    equipment: "Carrier 24ACC 2T",
    complaint: "Loud outdoor unit",
    group: "past",
  },
  {
    id: "j6",
    customer: "Lindqvist",
    address: "14 Harbor Way",
    time: "Thu 8:00 AM",
    status: "done",
    equipment: "Rheem RA14 5T",
    complaint: "No cooling",
    group: "past",
  },
];

/** Events in demo order. The mock feed adds one every few seconds. */
const t = (min: number) => new Date(Date.UTC(2026, 10, 8, 14, 30 + min)).toISOString();

export const MOCK_FEED: JobEvent[] = [
  { id: 1, type: "note", item: "Unit not cooling. Fan runs, compressor does not.", created_at: t(0) },
  { id: 2, type: "tool", item: "Multimeter", created_at: t(3) },
  { id: 3, type: "damage", item: "Bent fins on condenser", notes: "About 10 percent", created_at: t(6) },
  {
    id: 4,
    type: "substitute",
    item: "45/5 µF capacitor",
    created_at: t(9),
    options: [
      { part_no: "CAP-455-440", name: "45/5 µF 440V dual run", price: 24.5, why: "Exact match. In stock." },
      { part_no: "CAP-455-370", name: "45/5 µF 370V dual run", price: 19.0, why: "Same µF. Voltage is lower, so check the rating." },
      { part_no: "CAP-505-440", name: "50/5 µF 440V dual run", price: 26.75, why: "Within 6 percent. Works if you have no other." },
    ],
  },
  { id: 5, type: "part", item: "45/5 µF capacitor", qty: 1, created_at: t(12) },
  { id: 6, type: "part", item: "Contactor 30A", qty: 1, created_at: t(14) },
  { id: 7, type: "labor", item: "Replace capacitor", labor_min: 30, created_at: t(18) },
  { id: 6, type: "part", item: "Contactor 30A", qty: 1, removed: true, created_at: t(14) },
  {
    id: 9,
    type: "invoice",
    item: "Invoice",
    total: 325.41,
    invoice_url: "/invoices/j1",
    created_at: t(25),
    line_items: [
      { label: "Trip fee", amount: 89 },
      { label: "Labor 1.5h", amount: 165 },
      { label: "Capacitor 45/5", amount: 48 },
      { label: "Tax 7.75%", amount: 23.41 },
    ],
  },
];
