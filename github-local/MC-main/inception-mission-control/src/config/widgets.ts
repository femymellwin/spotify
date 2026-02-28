// ─── MISSION CONTROL WIDGET REGISTRY ─────────────────────────────────────────
// UAE-Iran-US conflict focus only. Tech/AI feeds removed.
// To add a widget: create component, add entry below — nothing else changes.
//
// Grid: 12 cols, rowHeight = viewport / 35 rows. Drag by title bar, resize any edge.
// Layout persisted to localStorage under "dashboard-layout-v1".
// ──────────────────────────────────────────────────────────────────────────────

import type { WidgetDefinition } from "@/types/widget";
import { POLLING_INTERVALS } from "@/lib/utils/constants";
import { UAENewsWidget } from "@/components/widgets/UAENewsWidget";
import { WorldNewsWidget } from "@/components/widgets/WorldNewsWidget";
import { GeopoliticalRiskWidget } from "@/components/widgets/GeopoliticalRiskWidget";
import { AviationWidget } from "@/components/widgets/AviationWidget";
import { CommoditiesWidget } from "@/components/widgets/CommoditiesWidget";
import { XConflictWidget } from "@/components/widgets/XConflictWidget";
import { VerifiedNewsWidget } from "@/components/widgets/VerifiedNewsWidget";
import { UNFeedWidget } from "@/components/widgets/UNFeedWidget";
import { EmbassyAlertsWidget } from "@/components/widgets/EmbassyAlertsWidget";
import { FactCheckerWidget } from "@/components/widgets/FactCheckerWidget";

// ── Default layout (12-col grid, 35 total rows) ───────────────────────────────
//
//   Col  0   1   2   3   4   5   6   7   8   9  10  11
//   Row  ├────────────────────────────────┤───────────┤
//    0   │  Geopolitical Risk (w=8, h=6)  │Fact Check │   rows 0–5 / 0–9
//    6   │  X Conflict (w=4, h=10)        │(top-right)│   rows 6–15
//    6   │                │ UAE News(w=4) │           │   rows 6–10
//   11   │                │ World(part)  │ more...   │   rows 11–15
//   16   │           World News (full width)          │   rows 16–19
//   20   │  Aviation Monitor  │  Commodities          │   rows 20–24
//   25   │     Verified Regional News (full width)    │   rows 25–29
//   30   │   UN Security Feed  │  Embassy Alerts      │   rows 30–34
//
export const WIDGET_REGISTRY: WidgetDefinition[] = [
  {
    id: "geopolitical-risk",
    label: "IRAN-US ESCALATION · UAE RISK ASSESSMENT",
    category: "news",
    component: GeopoliticalRiskWidget,
    grid: { x: 0, y: 0, w: 8, h: 6, minW: 4, minH: 4 },
    pollingIntervalMs: 60 * 60 * 1000,
    enabled: true,
  },
  {
    id: "fact-checker",
    label: "REAL-TIME FACT CHECKER — PASTE ANY SOCIAL / NEWS LINK",
    category: "custom",
    component: FactCheckerWidget,
    grid: { x: 8, y: 0, w: 4, h: 10, minW: 3, minH: 6 },
    pollingIntervalMs: 0,
    enabled: true,
  },
  {
    id: "x-conflict",
    label: "X — IRAN · US · UAE CONFLICT FEED",
    category: "news",
    component: XConflictWidget,
    grid: { x: 0, y: 6, w: 4, h: 10, minW: 2, minH: 5 },
    pollingIntervalMs: POLLING_INTERVALS.X_CONFLICT,
    enabled: true,
  },
  {
    id: "uae-news",
    label: "UAE BRIEF",
    category: "news",
    component: UAENewsWidget,
    grid: { x: 4, y: 6, w: 4, h: 10, minW: 2, minH: 4 },
    pollingIntervalMs: POLLING_INTERVALS.UAE_NEWS,
    enabled: true,
  },
  {
    id: "world-news",
    label: "WORLD — GEO-POLITICS & MARKETS",
    category: "news",
    component: WorldNewsWidget,
    grid: { x: 0, y: 16, w: 12, h: 4, minW: 4, minH: 3 },
    pollingIntervalMs: POLLING_INTERVALS.WORLD_NEWS,
    enabled: true,
  },
  {
    id: "aviation-monitor",
    label: "AVIATION MONITOR — PERSIAN GULF AIRSPACE",
    category: "custom",
    component: AviationWidget,
    grid: { x: 0, y: 20, w: 6, h: 5, minW: 3, minH: 3 },
    pollingIntervalMs: POLLING_INTERVALS.AVIATION,
    enabled: true,
  },
  {
    id: "commodities",
    label: "COMMODITIES — ESCALATION INDICATORS",
    category: "market",
    component: CommoditiesWidget,
    grid: { x: 6, y: 20, w: 6, h: 5, minW: 3, minH: 3 },
    pollingIntervalMs: POLLING_INTERVALS.COMMODITIES,
    enabled: true,
  },
  {
    id: "verified-news",
    label: "VERIFIED REGIONAL NEWS — AL ARABIYA · BBC · WAM · REUTERS · AJ",
    category: "news",
    component: VerifiedNewsWidget,
    grid: { x: 0, y: 25, w: 12, h: 5, minW: 4, minH: 3 },
    pollingIntervalMs: POLLING_INTERVALS.VERIFIED_NEWS,
    enabled: true,
  },
  {
    id: "un-feed",
    label: "UN PRESS — MIDDLE EAST · SECURITY COUNCIL",
    category: "news",
    component: UNFeedWidget,
    grid: { x: 0, y: 30, w: 6, h: 5, minW: 3, minH: 3 },
    pollingIntervalMs: POLLING_INTERVALS.UN_FEED,
    enabled: true,
  },
  {
    id: "embassy-alerts",
    label: "US EMBASSY — UAE TRAVEL ADVISORY & ALERTS",
    category: "news",
    component: EmbassyAlertsWidget,
    grid: { x: 6, y: 30, w: 6, h: 5, minW: 3, minH: 3 },
    pollingIntervalMs: POLLING_INTERVALS.EMBASSY_ALERTS,
    enabled: true,
  },
];

export function getActiveWidgets(): WidgetDefinition[] {
  return WIDGET_REGISTRY.filter((w) => w.enabled);
}
