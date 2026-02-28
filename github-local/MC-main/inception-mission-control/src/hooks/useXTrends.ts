"use client";

import { usePolling } from "./usePolling";
import type { XTrendsResponse } from "@/types/x";
import { POLLING_INTERVALS } from "@/lib/utils/constants";

interface ApiResponse {
  success: boolean;
  data?: XTrendsResponse;
  error?: string;
}

async function fetchXTrends(): Promise<XTrendsResponse> {
  const res = await fetch("/api/x-trends");
  const json: ApiResponse = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error ?? "Failed to fetch X trends");
  }
  return json.data;
}

export function useXTrends() {
  return usePolling<XTrendsResponse>(
    fetchXTrends,
    POLLING_INTERVALS.X_TRENDS
  );
}
