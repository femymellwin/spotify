"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDubaiTime } from "@/hooks/useDubaiTime";
import { useDashboard } from "@/components/providers/DashboardProvider";
import { LiveIndicator } from "@/components/ui/LiveIndicator";
import { cn } from "@/lib/utils/cn";

const TABS = [
  { href: "/",          label: "MISSION CONTROL" },
  { href: "/narrative", label: "NARRATIVE ANALYTICS" },
];

export function HeaderBar() {
  const dubaiTime = useDubaiTime();
  const { isOffline, refreshAll } = useDashboard();
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between px-4 bg-bloomberg-header border-b border-bloomberg-border h-12 flex-shrink-0 z-10">
      {/* Left: Brand + Tab Nav */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-[0.2em] text-bloomberg-accent">
              INCEPTION
            </span>
          </div>
          <span className="text-2xs tracking-widest text-bloomberg-muted mt-0.5">
            A G42 COMPANY
          </span>
        </div>

        {/* Tabs */}
        <nav className="flex items-stretch h-12">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center px-4 text-2xs font-bold tracking-widest transition-colors border-b-2",
                  isActive
                    ? "text-bloomberg-accent border-bloomberg-accent"
                    : "text-bloomberg-muted border-transparent hover:text-bloomberg-text hover:border-bloomberg-border"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Center: Status */}
      <div className="flex items-center gap-4">
        {isOffline ? (
          <span className="text-2xs font-bold tracking-widest text-bloomberg-negative border border-bloomberg-negative px-2 py-0.5">
            ⚠ OFFLINE
          </span>
        ) : (
          <LiveIndicator color="positive" label="LIVE" />
        )}

        <button
          onClick={refreshAll}
          className="text-2xs text-bloomberg-muted hover:text-bloomberg-accent tracking-widest transition-colors border border-bloomberg-border px-2 py-0.5 hover:border-bloomberg-accent"
          title="Refresh all widgets"
        >
          ↻ REFRESH ALL
        </button>
      </div>

      {/* Right: Dubai Clock */}
      <div className="flex flex-col items-end leading-none min-w-[120px]">
        <div className="text-base font-bold tracking-[0.1em] text-bloomberg-text tabular-nums">
          {dubaiTime?.time ?? "──:──:──"}
          <span className="text-2xs text-bloomberg-muted ml-1.5 font-normal">UAE</span>
        </div>
        <div className="text-2xs tracking-widest text-bloomberg-muted mt-0.5">
          {dubaiTime?.date ?? ""}
        </div>
      </div>
    </header>
  );
}
