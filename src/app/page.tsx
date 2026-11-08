import { VoiceAgent } from "@/components/VoiceAgent";
import workOrder from "../../data/work-order.json";

export default function Home() {
  return <VoiceAgent workOrder={workOrder} />;
}
