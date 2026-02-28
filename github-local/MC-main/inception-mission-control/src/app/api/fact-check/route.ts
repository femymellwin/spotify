// Server-side only.
// Accepts a social media URL, extracts content, then runs BOTH Claude and
// Inception AI fact-checkers in parallel and returns a combined result.

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getTweetById } from "@/lib/x/client";
import type {
  CombinedFactCheckResult,
  ClaudeFactCheckResult,
  InceptionFactCheckResult,
  InceptionSource,
  FactCheckVerdict,
  TimelinesVerdict,
} from "@/types/fact-check";

export const runtime = "nodejs";
export const maxDuration = 30;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const INCEPTION_URL =
  process.env.INCEPTION_FACT_CHECK_URL ??
  "https://dev-aimagazine-be-65ghk3.inceptionai.app/ai-mag/fact-check";

// ── URL parsers ────────────────────────────────────────────────────────────────

function extractTweetId(url: string): string | null {
  const m = /(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/i.exec(url);
  return m ? m[1] : null;
}

// ── Content fetchers ───────────────────────────────────────────────────────────

interface PostContent {
  text: string;
  authorUsername?: string;
  authorName?: string;
  postDate?: string;
  source: string;
}

async function fetchTweetContent(tweetId: string): Promise<PostContent> {
  const raw = await getTweetById(tweetId);
  const tweet = raw.data;
  const user = raw.includes?.users?.[0];
  return {
    text: tweet.text ?? "",
    authorUsername: user?.username,
    authorName: user?.name,
    postDate: tweet.created_at,
    source: "X / Twitter",
  };
}

async function fetchGenericPageContent(url: string): Promise<PostContent> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Could not fetch page: HTTP ${res.status}`);
  const html = await res.text();

  const title =
    /<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i.exec(html)?.[1] ??
    /<title>([^<]+)<\/title>/i.exec(html)?.[1] ?? "";
  const description =
    /<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i.exec(html)?.[1] ??
    /<meta[^>]+name="description"[^>]+content="([^"]+)"/i.exec(html)?.[1] ?? "";
  const publishedDate =
    /<meta[^>]+property="article:published_time"[^>]+content="([^"]+)"/i.exec(html)?.[1] ??
    /<time[^>]+datetime="([^"]+)"/i.exec(html)?.[1];
  const siteName =
    /<meta[^>]+property="og:site_name"[^>]+content="([^"]+)"/i.exec(html)?.[1] ??
    new URL(url).hostname;

  return {
    text: [title, description].filter(Boolean).join(" — "),
    postDate: publishedDate,
    source: siteName,
  };
}

// ── Claude fact-check ──────────────────────────────────────────────────────────

function getUAEDateString(): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dubai",
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date());
}

async function runClaudeFactCheck(content: PostContent): Promise<ClaudeFactCheckResult> {
  const uaeNow = getUAEDateString();

  const prompt = `You are a senior fact-checker at a geopolitical intelligence desk in Abu Dhabi, UAE.
Today's date and time in UAE (UTC+4) is: ${uaeNow}

SOURCE: ${content.source}
AUTHOR: ${content.authorUsername ? `@${content.authorUsername}` : "Unknown"}
POST DATE (if known): ${content.postDate ?? "Unknown"}
CONTENT:
"""
${content.text}
"""

Respond ONLY with valid JSON — no prose, no markdown outside the JSON:

{
  "timeliness": "<TODAY|RECENT|OLD|UNKNOWN>",
  "isConflictRelevant": <true|false>,
  "verdict": "<VERIFIED|UNVERIFIED|MISLEADING|FALSE|RECYCLED|OUT_OF_CONTEXT>",
  "confidence": <0-100>,
  "reasoning": "<1-3 sentences — be specific, cite observable signals>",
  "flags": ["<FLAG_1>", "<FLAG_2>"]
}

Verdict: VERIFIED=corroborated today, UNVERIFIED=cannot confirm, MISLEADING=framed deceptively,
FALSE=contradicted by facts, RECYCLED=old content recirculated, OUT_OF_CONTEXT=real content wrong event.
Timeliness: TODAY=last 24h UAE, RECENT=1-7d, OLD=>7d or clearly predates today, UNKNOWN=no date available.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = /\{[\s\S]*\}/.exec(rawText);
  if (!jsonMatch) throw new Error("Claude returned non-JSON response");
  const p = JSON.parse(jsonMatch[0]);

  return {
    verdict: (p.verdict ?? "UNVERIFIED") as FactCheckVerdict,
    confidence: Math.min(100, Math.max(0, Number(p.confidence) || 50)),
    timeliness: (p.timeliness ?? "UNKNOWN") as TimelinesVerdict,
    isConflictRelevant: Boolean(p.isConflictRelevant),
    reasoning: String(p.reasoning ?? ""),
    flags: Array.isArray(p.flags) ? p.flags.map(String) : [],
  };
}

// ── Inception fact-check ───────────────────────────────────────────────────────

function mapInceptionVerdict(raw: string): FactCheckVerdict {
  const v = raw.toLowerCase().trim();
  if (v === "true")           return "VERIFIED";
  if (v === "false")          return "FALSE";
  if (v === "misleading")     return "MISLEADING";
  if (v === "recycled" || v === "recycled content") return "RECYCLED";
  if (v === "out of context" || v === "out_of_context") return "OUT_OF_CONTEXT";
  return "UNVERIFIED";
}

// Strip [[title](url)] markdown link syntax from Inception explanation
function cleanExplanation(text: string): string {
  return text.replace(/\[\[([^\]]+)\]\([^)]+\)\]/g, "$1").trim();
}

async function runInceptionFactCheck(claim: string): Promise<InceptionFactCheckResult> {
  const apiKey = process.env.INCEPTION_API_KEY;
  if (!apiKey) throw new Error("INCEPTION_API_KEY not configured");

  const res = await fetch(INCEPTION_URL, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({ claim }),
    signal: AbortSignal.timeout(25000),
  });

  if (!res.ok) throw new Error(`Inception API error: HTTP ${res.status}`);
  const data = await res.json();

  return {
    verdictRaw: String(data.verdict ?? "unverified"),
    verdictMapped: mapInceptionVerdict(String(data.verdict ?? "")),
    explanation: cleanExplanation(String(data.explanation ?? "")),
    action: String(data.action ?? ""),
    sources: Array.isArray(data.sources)
      ? (data.sources as InceptionSource[]).map((s) => ({
          title: String(s.title ?? ""),
          url: String(s.url ?? ""),
          snippet: s.snippet ? String(s.snippet) : null,
          type: (s.type === "database" || s.type === "web") ? s.type : "web",
        }))
      : [],
  };
}

// ── Consensus engine ──────────────────────────────────────────────────────────

const SEVERITY: Record<FactCheckVerdict, number> = {
  VERIFIED: 0, UNVERIFIED: 1, OUT_OF_CONTEXT: 2,
  MISLEADING: 3, RECYCLED: 4, FALSE: 5,
};

function computeConsensus(
  claude: ClaudeFactCheckResult,
  inception: InceptionFactCheckResult | null
): { consensusVerdict: FactCheckVerdict; consensusConfidence: number; agreedOn: boolean } {
  if (!inception) {
    return {
      consensusVerdict: claude.verdict,
      consensusConfidence: claude.confidence,
      agreedOn: false,
    };
  }

  const agreed = claude.verdict === inception.verdictMapped;
  if (agreed) {
    return {
      consensusVerdict: claude.verdict,
      consensusConfidence: Math.min(100, claude.confidence + 10),
      agreedOn: true,
    };
  }

  // Disagreement — use the more conservative (higher severity) verdict
  const moreConservative =
    SEVERITY[claude.verdict] >= SEVERITY[inception.verdictMapped]
      ? claude.verdict
      : inception.verdictMapped;

  return {
    consensusVerdict: moreConservative,
    consensusConfidence: Math.max(20, claude.confidence - 20),
    agreedOn: false,
  };
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url: string = typeof body?.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json({ success: false, error: "url is required" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Fetch post content
    const tweetId = extractTweetId(url);
    const content = tweetId
      ? await fetchTweetContent(tweetId)
      : await fetchGenericPageContent(url);

    if (!content.text.trim()) {
      return NextResponse.json(
        { success: false, error: "Could not extract content from the URL" },
        { status: 422 }
      );
    }

    // Run both engines in parallel — tolerate Inception failure
    const claim = content.text.slice(0, 500); // Inception takes a plain claim string
    const [claudeRes, inceptionRes] = await Promise.allSettled([
      runClaudeFactCheck(content),
      runInceptionFactCheck(claim),
    ]);

    if (claudeRes.status === "rejected") {
      throw claudeRes.reason instanceof Error
        ? claudeRes.reason
        : new Error("Claude fact-check failed");
    }

    const claude = claudeRes.value;
    const inception = inceptionRes.status === "fulfilled" ? inceptionRes.value : null;
    const inceptionError =
      inceptionRes.status === "rejected"
        ? (inceptionRes.reason instanceof Error ? inceptionRes.reason.message : "Inception unavailable")
        : undefined;

    const { consensusVerdict, consensusConfidence, agreedOn } = computeConsensus(claude, inception);

    const result: CombinedFactCheckResult = {
      url,
      postText: content.text,
      authorUsername: content.authorUsername,
      authorName: content.authorName,
      postDate: content.postDate,
      consensusVerdict,
      consensusConfidence,
      agreedOn,
      claude,
      inception,
      inceptionError,
      checkedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fact check failed";
    console.error("[/api/fact-check]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
