import { HeaderBar } from "@/components/layout/HeaderBar";
import { DashboardGrid } from "@/components/layout/DashboardGrid";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bloomberg-bg">
      <HeaderBar />
      <DashboardGrid />
    </div>
  );
}
