"use client";

import { usePolling } from "@/hooks/usePolling";
import { POLLING_INTERVALS } from "@/lib/utils/constants";
import type { AviationData } from "@/types/aviation";

async function fetchAviation(): Promise<AviationData> {
  const res = await fetch("/api/aviation");
  if (!res.ok) throw new Error(`Aviation API error ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json as AviationData;
}

export function useAviation(intervalMs = POLLING_INTERVALS.AVIATION) {
  return usePolling<AviationData>(fetchAviation, intervalMs);
}
