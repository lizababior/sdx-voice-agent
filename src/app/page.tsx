import { Home } from "@/components/Home";
import { JOBS } from "@/lib/jobs";

export default function HomePage() {
  return <Home workOrders={JOBS} />;
}
