import { HeaderBar } from "@/components/layout/HeaderBar";
import { NarrativeDashboardGrid } from "@/components/layout/NarrativeDashboardGrid";
import { NarrativeProvider } from "@/components/providers/NarrativeProvider";
import { DashboardProvider } from "@/components/providers/DashboardProvider";

export default function NarrativePage() {
  return (
    <DashboardProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-bloomberg-bg">
        <HeaderBar />
        <NarrativeProvider>
          <NarrativeDashboardGrid />
        </NarrativeProvider>
      </div>
    </DashboardProvider>
  );
}
