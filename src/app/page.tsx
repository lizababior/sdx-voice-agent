import { Home } from "@/components/Home";
import workOrder from "../../data/work-order.json";

export default function HomePage() {
  return <Home workOrder={workOrder} />;
}
