"use client";

import { usePolling } from "./usePolling";
import type { MondayTasksResponse } from "@/types/monday";
import { POLLING_INTERVALS } from "@/lib/utils/constants";

interface ApiResponse {
  success: boolean;
  data?: MondayTasksResponse;
  error?: string;
}

async function fetchMondayTasks(): Promise<MondayTasksResponse> {
  const res = await fetch("/api/monday", { cache: "no-store" });
  const json: ApiResponse = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error ?? "Failed to fetch Monday.com tasks");
  }
  return json.data;
}

export function useMondayTasks() {
  return usePolling<MondayTasksResponse>(
    fetchMondayTasks,
    POLLING_INTERVALS.MONDAY_TASKS
  );
}
