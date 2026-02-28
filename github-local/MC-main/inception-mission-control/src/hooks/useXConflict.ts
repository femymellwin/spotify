"use client";

import { usePolling } from "./usePolling";
import type { XTrendsResponse } from "@/types/x";
import { POLLING_INTERVALS } from "@/lib/utils/constants";

interface ApiResponse {
  success: boolean;
  data?: XTrendsResponse;
  error?: string;
}

async function fetchXConflict(): Promise<XTrendsResponse> {
  const res = await fetch("/api/x-conflict");
  const json: ApiResponse = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error ?? "Failed to fetch conflict feed");
  }
  return json.data;
}

export function useXConflict() {
  return usePolling<XTrendsResponse>(
    fetchXConflict,
    POLLING_INTERVALS.X_TRENDS
  );
}
