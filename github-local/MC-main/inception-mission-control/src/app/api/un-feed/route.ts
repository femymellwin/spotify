// Server-side only.
// Fetches UN press release RSS and filters for Middle East / Iran / Gulf content.
// No API key required.

import { NextResponse } from "next/server";
import { parseRSS, isConflictRelevant, generateId } from "@/lib/utils/rss";

export interface UNPressItem {
  id: string;
  title: string;
  link: string;
  publishedAt: string;
  description: string;
  isSecurityCouncil: boolean;
  isUrgent: boolean;
}

const UN_RSS_URL = "https://press.un.org/en/rss.xml";

const SC_KEYWORDS = [
  "security council", "unsc", "veto", "resolution", "emergency session",
  "chapter vii", "sanctions committee",
];

const URGENT_KEYWORDS = [
  "emergency", "urgent", "breaking", "immediate", "ceasefire", "invasion",
  "strike", "attack", "escalation", "military operation",
];

export async function GET() {
  try {
    const res = await fetch(UN_RSS_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      next: { revalidate: 900 }, // 15-min cache
    });

    if (!res.ok) throw new Error(`UN RSS HTTP ${res.status}`);
    const xml = await res.text();
    const raw = parseRSS(xml, 50);

    const items: UNPressItem[] = raw
      .filter((item) => isConflictRelevant(item.title, item.description))
      .slice(0, 20)
      .map((item) => {
        const text = `${item.title} ${item.description}`.toLowerCase();
        return {
          id: generateId(item.link),
          title: item.title,
          link: item.link,
          publishedAt: item.publishedAt,
          description: item.description,
          isSecurityCouncil: SC_KEYWORDS.some((kw) => text.includes(kw)),
          isUrgent:
            URGENT_KEYWORDS.some((kw) => text.includes(kw)) &&
            Date.now() - new Date(item.publishedAt).getTime() <
              24 * 60 * 60 * 1000, // only recent
        };
      })
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

    return NextResponse.json({ success: true, items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "UN feed unavailable";
    console.error("[/api/un-feed]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
