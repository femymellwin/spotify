"use client";

import { usePolling } from "./usePolling";
import type { GeopoliticalRiskResponse } from "@/types/geopolitical";

interface ApiResponse {
  success: boolean;
  data?: GeopoliticalRiskResponse;
  error?: string;
}

async function fetchGeopoliticalRisk(): Promise<GeopoliticalRiskResponse> {
  const res = await fetch("/api/geopolitical-risk");
  const json: ApiResponse = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error ?? "Failed to fetch geopolitical risk data");
  }
  return json.data;
}

// News refreshes every hour; risk score is recomputed server-side from fresh articles
const ONE_HOUR_MS = 60 * 60 * 1000;

export function useGeopoliticalRisk() {
  return usePolling<GeopoliticalRiskResponse>(fetchGeopoliticalRisk, ONE_HOUR_MS);
}
