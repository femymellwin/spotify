"use client";

import { useState, useEffect, useCallback } from "react";
import { GridLayout, useContainerWidth, noCompactor } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import { getActiveNarrativeWidgets } from "@/config/narrativeWidgets";

import "react-grid-layout/css/styles.css";

const COLS = 12;
const HEADER_HEIGHT = 48;
const TOTAL_DEFAULT_ROWS = 24;
const STORAGE_KEY = "narrative-layout-v1";

function calcRowHeight(containerHeight: number): number {
  return Math.max(30, Math.floor(containerHeight / TOTAL_DEFAULT_ROWS));
}

function widgetsToLayout(widgets: ReturnType<typeof getActiveNarrativeWidgets>): Layout {
  return widgets.map((w) => ({
    i: w.id,
    x: w.grid.x,
    y: w.grid.y,
    w: w.grid.w,
    h: w.grid.h,
    minW: w.grid.minW ?? 2,
    minH: w.grid.minH ?? 2,
    ...(w.grid.maxW != null ? { maxW: w.grid.maxW } : {}),
    ...(w.grid.maxH != null ? { maxH: w.grid.maxH } : {}),
  }));
}

function loadLayout(defaultLayout: Layout): Layout {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultLayout;
    const parsed: Layout = JSON.parse(saved);
    const savedById = new Map(parsed.map((l) => [l.i, l]));
    return defaultLayout.map((d) => savedById.get(d.i) ?? d);
  } catch {
    return defaultLayout;
  }
}

export function NarrativeDashboardGrid() {
  const widgets = getActiveNarrativeWidgets();
  const defaultLayout = widgetsToLayout(widgets);

  const { width, containerRef } = useContainerWidth();
  const [layout, setLayout] = useState<Layout>(defaultLayout);
  // Always start with 900 so server and client agree on the initial render.
  // useEffect updates to the real window height after hydration.
  const [containerHeight, setContainerHeight] = useState(900);
  const [clientMounted, setClientMounted] = useState(false);

  useEffect(() => {
    setLayout(loadLayout(defaultLayout));
    setContainerHeight(window.innerHeight - HEADER_HEIGHT);
    setClientMounted(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function updateHeight() {
      setContainerHeight(window.innerHeight - HEADER_HEIGHT);
    }
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const handleLayoutChange = useCallback((newLayout: Layout) => {
    setLayout(newLayout);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
    } catch {
      // localStorage unavailable
    }
  }, []);

  const rowHeight = calcRowHeight(containerHeight);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto"
      style={{ background: "var(--color-border)" }}
    >
      {clientMounted && (
        <GridLayout
          width={width}
          layout={layout}
          gridConfig={{
            cols: COLS,
            rowHeight,
            margin: [1, 1],
            containerPadding: [0, 0],
          }}
          dragConfig={{ handle: ".widget-drag-handle" }}
          resizeConfig={{ handles: ["se", "sw", "ne", "nw", "e", "w", "n", "s"] }}
          compactor={noCompactor}
          onLayoutChange={handleLayoutChange}
        >
          {widgets.map((widget) => {
            const Widget = widget.component;
            return (
              <div key={widget.id} className="overflow-hidden">
                <Widget
                  widgetId={widget.id}
                  label={widget.label}
                  pollingIntervalMs={widget.pollingIntervalMs}
                />
              </div>
            );
          })}
        </GridLayout>
      )}
    </div>
  );
}
