// ─── NARRATIVE ANALYTICS WIDGET REGISTRY ─────────────────────────────────────
// All widgets share data from NarrativeProvider — pollingIntervalMs is unused
// (the provider polls once for all widgets). Grid: 12 cols, 24 rows.
//
// Layout:
//   Row 0–5:   NarrativeSummary (w=8) | InfoOps (w=4)
//   Row 6–18:  NarrativeThreads (w=7) | SourceMatrix (w=5)
//   Row 19–23: EntitySpotlight (full width)
// ──────────────────────────────────────────────────────────────────────────────

import type { WidgetDefinition } from "@/types/widget";
import { NarrativeSummaryWidget } from "@/components/widgets/NarrativeSummaryWidget";
import { NarrativeThreadsWidget } from "@/components/widgets/NarrativeThreadsWidget";
import { SourceMatrixWidget } from "@/components/widgets/SourceMatrixWidget";
import { EntitySpotlightWidget } from "@/components/widgets/EntitySpotlightWidget";
import { InfoOpsWidget } from "@/components/widgets/InfoOpsWidget";

export const NARRATIVE_WIDGET_REGISTRY: WidgetDefinition[] = [
  {
    id: "narrative-summary",
    label: "NARRATIVE INTELLIGENCE — EXECUTIVE BRIEF",
    category: "news",
    component: NarrativeSummaryWidget,
    grid: { x: 0, y: 0, w: 8, h: 6, minW: 4, minH: 4 },
    pollingIntervalMs: 0,
    enabled: true,
  },
  {
    id: "info-ops",
    label: "INFORMATION OPERATIONS — IO INDICATORS",
    category: "news",
    component: InfoOpsWidget,
    grid: { x: 8, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
    pollingIntervalMs: 0,
    enabled: true,
  },
  {
    id: "narrative-threads",
    label: "NARRATIVE THREADS — DOMINANT & EMERGING",
    category: "news",
    component: NarrativeThreadsWidget,
    grid: { x: 0, y: 6, w: 7, h: 13, minW: 4, minH: 6 },
    pollingIntervalMs: 0,
    enabled: true,
  },
  {
    id: "source-matrix",
    label: "SOURCE MATRIX — EDITORIAL STANCE & CREDIBILITY",
    category: "news",
    component: SourceMatrixWidget,
    grid: { x: 7, y: 6, w: 5, h: 13, minW: 3, minH: 6 },
    pollingIntervalMs: 0,
    enabled: true,
  },
  {
    id: "entity-spotlight",
    label: "KEY ENTITIES — FRAMING & SENTIMENT ACROSS SOURCES",
    category: "news",
    component: EntitySpotlightWidget,
    grid: { x: 0, y: 19, w: 12, h: 5, minW: 6, minH: 3 },
    pollingIntervalMs: 0,
    enabled: true,
  },
];

export function getActiveNarrativeWidgets(): WidgetDefinition[] {
  return NARRATIVE_WIDGET_REGISTRY.filter((w) => w.enabled);
}
