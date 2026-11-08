import workOrder from "../../data/work-order.json";
import type { Job } from "./types";

export type WorkOrder = typeof workOrder;
export { workOrder };

/** The demo work order in the Job shape that the job list and the session screen use. */
export const workOrderJob: Job = {
  id: workOrder.job_id,
  customer: workOrder.customer_name,
  address: workOrder.address,
  time: "Now",
  status: "in_progress",
  equipment: `${workOrder.equipment} · ${workOrder.model}`,
  complaint: workOrder.complaint,
  group: "today",
};

/** The dynamic variables that the agent prompt uses (agent/config.ts). */
export const dynamicVariables = {
  job_id: workOrder.job_id,
  customer_name: workOrder.customer_name,
  address: workOrder.address,
  equipment: workOrder.equipment,
  model: workOrder.model,
  refrigerant: workOrder.refrigerant,
  metering_device: workOrder.metering_device,
  complaint: workOrder.complaint,
};
