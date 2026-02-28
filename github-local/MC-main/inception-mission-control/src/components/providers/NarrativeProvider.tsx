"use client";

import { createContext, useContext } from "react";
import { useNarrativeAnalysis } from "@/hooks/useNarrativeAnalysis";
import type { NarrativeAnalysis } from "@/types/narrative";

interface NarrativeContextValue {
  data: NarrativeAnalysis | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

const NarrativeContext = createContext<NarrativeContextValue>({
  data: null,
  isLoading: false,
  isError: false,
  error: null,
  lastUpdated: null,
  refresh: () => {},
});

export function useNarrative() {
  return useContext(NarrativeContext);
}

export function NarrativeProvider({ children }: { children: React.ReactNode }) {
  const state = useNarrativeAnalysis();
  return (
    <NarrativeContext.Provider value={state}>
      {children}
    </NarrativeContext.Provider>
  );
}
