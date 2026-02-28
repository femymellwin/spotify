"use client";

import { usePolling } from "@/hooks/usePolling";
import { POLLING_INTERVALS } from "@/lib/utils/constants";
import type { EmbassyAlertsData } from "@/app/api/embassy-alerts/route";

interface ApiResponse {
  success: boolean;
  data?: EmbassyAlertsData;
  error?: string;
}

async function fetchEmbassyAlerts(): Promise<EmbassyAlertsData> {
  const res = await fetch("/api/embassy-alerts");
  const json: ApiResponse = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error ?? "Failed to fetch embassy alerts");
  }
  return json.data;
}

export function useEmbassyAlerts() {
  return usePolling(fetchEmbassyAlerts, POLLING_INTERVALS.EMBASSY_ALERTS);
}
