"use client";

import { usePolling } from "@/hooks/usePolling";
import { POLLING_INTERVALS } from "@/lib/utils/constants";
import type { UNPressItem } from "@/app/api/un-feed/route";

interface ApiResponse {
  success: boolean;
  items?: UNPressItem[];
  error?: string;
}

async function fetchUNFeed(): Promise<UNPressItem[]> {
  const res = await fetch("/api/un-feed");
  const json: ApiResponse = await res.json();
  if (!json.success) throw new Error(json.error ?? "Failed to fetch UN feed");
  return json.items ?? [];
}

export function useUNFeed() {
  return usePolling(fetchUNFeed, POLLING_INTERVALS.UN_FEED);
}
