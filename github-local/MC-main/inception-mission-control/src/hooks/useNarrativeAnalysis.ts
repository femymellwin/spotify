"use client";

import { usePolling } from "@/hooks/usePolling";
import { POLLING_INTERVALS } from "@/lib/utils/constants";
import type { NarrativeAnalysis } from "@/types/narrative";

async function fetchNarrativeAnalysis(): Promise<NarrativeAnalysis> {
  const res = await fetch("/api/narrative-analysis");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? "Narrative analysis failed");
  return json.data as NarrativeAnalysis;
}

export function useNarrativeAnalysis() {
  return usePolling(fetchNarrativeAnalysis, POLLING_INTERVALS.NARRATIVE);
}
