import { VoiceAgent } from "@/components/VoiceAgent";
import workOrder from "../../../data/work-order.json";

export default function JobPage() {
  return <VoiceAgent workOrder={workOrder} />;
}
