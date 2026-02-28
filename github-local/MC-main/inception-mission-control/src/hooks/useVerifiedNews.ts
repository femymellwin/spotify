"use client";

import { usePolling } from "@/hooks/usePolling";
import { POLLING_INTERVALS } from "@/lib/utils/constants";
import type { VerifiedNewsItem } from "@/app/api/verified-news/route";

interface ApiResponse {
  success: boolean;
  items?: VerifiedNewsItem[];
  sourcesAvailable?: number;
  error?: string;
}

async function fetchVerifiedNews(): Promise<{ items: VerifiedNewsItem[]; sourcesAvailable: number }> {
  const res = await fetch("/api/verified-news");
  const json: ApiResponse = await res.json();
  if (!json.success) throw new Error(json.error ?? "Failed to fetch news");
  return { items: json.items ?? [], sourcesAvailable: json.sourcesAvailable ?? 0 };
}

export function useVerifiedNews() {
  return usePolling(fetchVerifiedNews, POLLING_INTERVALS.VERIFIED_NEWS);
}
