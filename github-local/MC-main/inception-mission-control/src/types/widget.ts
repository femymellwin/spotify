import type { ComponentType } from "react";

export type WidgetCategory = "tasks" | "news" | "market" | "calendar" | "custom";

// RGL grid position (12-column grid)
export interface WidgetGridLayout {
  x: number;     // column start (0-based, out of 12)
  y: number;     // row start (0-based)
  w: number;     // width in grid units
  h: number;     // height in grid units
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface WidgetProps {
  widgetId: string;
  label: string;
  pollingIntervalMs: number;
}

export interface WidgetDefinition {
  id: string;
  label: string;
  category: WidgetCategory;
  component: ComponentType<WidgetProps>;
  grid: WidgetGridLayout;
  pollingIntervalMs: number;
  enabled: boolean;
}

export interface WidgetShellProps {
  widgetId: string;
  label: string;
  children: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  liveIndicator?: boolean;
  lastUpdated?: Date | null;
  className?: string;
}
