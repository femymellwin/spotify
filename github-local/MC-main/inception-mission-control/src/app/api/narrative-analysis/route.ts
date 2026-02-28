// Server-side only.
// Aggregates recent conflict news from multiple RSS sources and runs
// Claude narrative analysis to identify propaganda threads, source stances,
// key entities and information operations.

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { NarrativeAnalysis } from "@/types/narrative";

export const runtime = "nodejs";
export const maxDuration = 45;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── RSS sources for narrative analysis ────────────────────────────────────────
// Deliberately includes state media from multiple angles to detect narrative divergence

const NARRATIVE_SOURCES = [
  { name: "Al Arabiya",     url: "https://english.alarabiya.net/tools/rss.xml",           slant: "Gulf/Saudi-aligned" },
  { name: "Al Jazeera",     url: "https://www.aljazeera.com/xml/rss/all.xml",              slant: "Qatari state media, critical of Gulf states" },
  { name: "BBC ME",         url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",slant: "Western liberal" },
  { name: "Reuters",        url: "https://feeds.reuters.com/reuters/worldNews",             slant: "Western wire, neutral" },
  { name: "Iran International", url: "https://www.iranintl.com/en/rss",                   slant: "Anti-IRGC, UK-based Iranian opposition" },
  { name: "WAM",            url: "https://wam.ae/en/rss",                                  slant: "UAE official state media" },
  { name: "The National",   url: "https://www.thenationalnews.com/rss",                    slant: "UAE English press" },
  { name: "Jerusalem Post", url: "https://www.jpost.com/rss/rssfeedsheadlines.aspx",      slant: "Israeli perspective" },
];

interface RSSArticle {
  title: string;
  description: string;
  source: string;
  slant: string;
}

function extractText(xml: string, tag: string): string {
  const m = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i").exec(xml);
  return m ? m[1].replace(/<[^>]+>/g, "").trim() : "";
}

async function fetchSourceArticles(source: typeof NARRATIVE_SOURCES[0]): Promise<RSSArticle[]> {
  try {
    const res = await fetch(source.url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];
    const xml = await res.text();

    const items: RSSArticle[] = [];
    const itemPattern = /<item>([\s\S]*?)<\/item>|<entry>([\s\S]*?)<\/entry>/gi;
    let m: RegExpExecArray | null;

    while ((m = itemPattern.exec(xml)) !== null && items.length < 4) {
      const block = m[1] ?? m[2];
      const title = extractText(block, "title");
      const desc = extractText(block, "description") || extractText(block, "summary");

      const combined = `${title} ${desc}`.toLowerCase();
      const isRelevant = [
        "iran", "irgc", "uae", "gulf", "hormuz", "abu dhabi", "dubai",
        "pentagon", "us forces", "military", "missile", "drone", "escalat",
        "sanction", "nuclear", "conflict", "attack", "strike", "threat",
      ].some((kw) => combined.includes(kw));

      if (title && isRelevant) {
        items.push({ title, description: desc.slice(0, 120), source: source.name, slant: source.slant });
      }
    }
    return items;
  } catch {
    return [];
  }
}

async function runNarrativeAnalysis(articles: RSSArticle[]): Promise<NarrativeAnalysis> {
  const articleText = articles
    .map((a, i) => `[${i + 1}] SOURCE: ${a.source} (${a.slant})\nHEADLINE: ${a.title}\nSUMMARY: ${a.description}`)
    .join("\n\n");

  const now = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dubai",
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date());

  const prompt = `You are a senior geopolitical intelligence analyst at an Abu Dhabi-based think tank.
Today's date/time in UAE (UTC+4): ${now}

You are analysing ${articles.length} recent news articles about the Iran-US-UAE conflict from diverse sources to identify information narratives, propaganda threads, and key entities.

ARTICLES:
${articleText}

Respond ONLY with a valid JSON object matching this exact schema (no prose, no markdown):

{
  "executiveSummary": "<2-3 sentences on the dominant information environment right now>",
  "overallSentiment": "<POSITIVE|NEGATIVE|NEUTRAL|MIXED — toward UAE stability>",
  "narrativeShift": "<1 sentence on any notable shift vs typical baseline, or 'No significant shift detected'>",
  "dominantNarratives": [
    {
      "id": "<slug>",
      "title": "<short title>",
      "summary": "<1-2 sentences>",
      "stance": "<PRO_IRAN|PRO_US|PRO_UAE|NEUTRAL|ANTI_ESCALATION|ALARMIST|DISINFORMATION>",
      "sources": ["<source names>"],
      "evidenceQuotes": ["<headline or phrase from articles that exemplifies this narrative>"],
      "confidence": <0-100>,
      "isEmerging": <true|false>,
      "dominanceScore": <0-100>
    }
  ],
  "emergingThreads": [
    { "id": "<slug>", "title": "<short>", "summary": "<1 sentence>", "stance": "<stance>",
      "sources": [], "evidenceQuotes": [], "confidence": <0-100>, "isEmerging": true, "dominanceScore": <0-100> }
  ],
  "sourceProfiles": [
    {
      "name": "<source name>",
      "slant": "<editorial slant>",
      "primaryNarrative": "<what narrative this source is mostly pushing today>",
      "credibilityScore": <0-100>,
      "recentHeadlines": ["<1-2 headlines from articles>"]
    }
  ],
  "keyEntities": [
    {
      "name": "<entity>",
      "type": "<MILITARY|GOVERNMENT|PERSON|LOCATION|ORGANIZATION>",
      "framing": "<how this entity is being portrayed across sources>",
      "sentiment": "<POSITIVE|NEGATIVE|NEUTRAL|MIXED>",
      "mentionCount": <number>,
      "sources": ["<sources mentioning this entity>"]
    }
  ],
  "infoOps": [
    {
      "type": "<COORDINATED_AMPLIFICATION|RECYCLED_CONTENT|NARRATIVE_INJECTION|ASTROTURFING|FRAMING_SHIFT>",
      "headline": "<short name for this IO>",
      "description": "<1-2 sentences>",
      "suspectedOrigin": "<state actor or unknown>",
      "confidence": <0-100>,
      "affectedSources": ["<source names>"]
    }
  ],
  "analysedAt": "${new Date().toISOString()}",
  "articlesAnalysed": ${articles.length}
}

Rules:
- dominantNarratives: exactly 3 items max, sorted by dominanceScore descending
- emergingThreads: 0–2 items (only truly new threads, can be empty array)
- sourceProfiles: include only sources that appeared, max 5 items
- keyEntities: exactly 5 most prominent, sorted by mentionCount descending
- infoOps: 0–2 items (only if clearly evidenced, can be empty array)
- evidenceQuotes: max 1 per narrative
- recentHeadlines: max 1 per source profile
- All scores 0–100 integers
- Keep all string values concise (summary ≤ 30 words, reasoning ≤ 20 words)`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  // Check if response was truncated (stop_reason !== "end_turn")
  if (message.stop_reason !== "end_turn") {
    throw new Error(`Claude response truncated (stop_reason: ${message.stop_reason}). Try again or reduce article count.`);
  }
  const jsonMatch = /\{[\s\S]*\}/.exec(raw);
  if (!jsonMatch) throw new Error("Claude returned non-JSON narrative response");
  return JSON.parse(jsonMatch[0]) as NarrativeAnalysis;
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function GET() {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Fetch all sources in parallel, tolerate individual failures
    const results = await Promise.allSettled(
      NARRATIVE_SOURCES.map(fetchSourceArticles)
    );
    const articles = results
      .filter((r): r is PromiseFulfilledResult<RSSArticle[]> => r.status === "fulfilled")
      .flatMap((r) => r.value);

    if (articles.length === 0) {
      return NextResponse.json(
        { success: false, error: "No articles fetched from any source" },
        { status: 503 }
      );
    }

    const analysis = await runNarrativeAnalysis(articles);

    return NextResponse.json({ success: true, data: analysis }, {
      headers: { "Cache-Control": "s-maxage=1200, stale-while-revalidate=60" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Narrative analysis failed";
    console.error("[/api/narrative-analysis]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
