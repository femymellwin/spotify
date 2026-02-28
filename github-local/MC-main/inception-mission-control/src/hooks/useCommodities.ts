"use client";

import { usePolling } from "@/hooks/usePolling";
import { POLLING_INTERVALS } from "@/lib/utils/constants";
import type { CommoditiesData } from "@/types/commodities";

async function fetchCommodities(): Promise<CommoditiesData> {
  const res = await fetch("/api/commodities");
  if (!res.ok) throw new Error(`Commodities API error ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json as CommoditiesData;
}

export function useCommodities(intervalMs = POLLING_INTERVALS.COMMODITIES) {
  return usePolling<CommoditiesData>(fetchCommodities, intervalMs);
}
