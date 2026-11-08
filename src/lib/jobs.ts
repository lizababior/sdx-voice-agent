import workOrder from "../../data/work-order.json";
import extraWorkOrders from "../../data/extra-work-orders.json";
import type { WorkOrder } from "./vacman";

/** The Johnson demo job first, then the test jobs from data/extra-work-orders.json. */
export const JOBS: WorkOrder[] = [workOrder, ...extraWorkOrders];

export const findJob = (id: string) => JOBS.find((j) => j.job_id === id);
