// Server-side only.
// Aggregates conflict-relevant articles from verified regional RSS feeds.
// No API keys required.

import { NextResponse } from "next/server";
import { parseRSS, isConflictRelevant, generateId } from "@/lib/utils/rss";

export interface VerifiedNewsItem {
  id: string;
  title: string;
  link: string;
  publishedAt: string;
  source: string;
  sourceType: "state" | "wire" | "regional" | "intl";
}

const SOURCES = [
  {
    name: "WAM",
    url: "https://wam.ae/en/feed/rss",
    type: "state" as const,
    filterConflict: false, // UAE state news — show all
  },
  {
    name: "BBC",
    url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
    type: "intl" as const,
    filterConflict: true,
  },
  {
    name: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    type: "regional" as const,
    filterConflict: true,
  },
  {
    name: "Al Arabiya",
    url: "https://english.alarabiya.net/rss.xml",
    type: "regional" as const,
    filterConflict: true,
  },
  {
    name: "Reuters",
    url: "https://feeds.reuters.com/Reuters/worldNews",
    type: "wire" as const,
    filterConflict: true,
  },
];

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  Accept: "application/rss+xml, application/xml, text/xml, */*",
};

async function fetchSource(source: (typeof SOURCES)[number]): Promise<VerifiedNewsItem[]> {
  const res = await fetch(source.url, {
    headers: HEADERS,
    next: { revalidate: 600 }, // 10-min cache
  });

  if (!res.ok) throw new Error(`${source.name}: HTTP ${res.status}`);
  const text = await res.text();
  const items = parseRSS(text, 20);

  return items
    .filter((item) =>
      source.filterConflict
        ? isConflictRelevant(item.title, item.description)
        : true
    )
    .slice(0, 8)
    .map((item) => ({
      id: generateId(item.link),
      title: item.title,
      link: item.link,
      publishedAt: item.publishedAt,
      source: source.name,
      sourceType: source.type,
    }));
}

export async function GET() {
  const results = await Promise.allSettled(SOURCES.map(fetchSource));

  const allItems: VerifiedNewsItem[] = [];
  const errors: string[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    } else {
      errors.push(result.reason?.message ?? "Unknown error");
    }
  }

  // Deduplicate by ID, sort newest first
  const seen = new Set<string>();
  const unique = allItems
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  return NextResponse.json({
    success: true,
    items: unique,
    sourcesAvailable: SOURCES.length - errors.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
