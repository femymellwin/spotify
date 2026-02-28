"use client";

import { usePolling } from "./usePolling";
import type { NewsCategory, NewsResponse } from "@/types/news";
import { POLLING_INTERVALS } from "@/lib/utils/constants";

interface ApiResponse {
  success: boolean;
  data?: NewsResponse;
  error?: string;
}

function createNewsFetcher(category: NewsCategory) {
  return async function fetchNews(): Promise<NewsResponse> {
    const res = await fetch(`/api/news?category=${category}`);
    const json: ApiResponse = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error ?? `Failed to fetch ${category} news`);
    }
    return json.data;
  };
}

export function useNews(category: NewsCategory) {
  return usePolling<NewsResponse>(
    createNewsFetcher(category),
    POLLING_INTERVALS.WORLD_NEWS
  );
}
