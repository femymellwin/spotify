import { NextResponse } from "next/server";
import {
  fetchGeopoliticalNews,
  IRAN_US_UAE_QUERY,
  ABU_DHABI_CONFLICT_QUERY,
  UAE_OFFICIAL_QUERY,
} from "@/lib/geopolitical/client";
import { transformGeopoliticalArticles } from "@/lib/geopolitical/transformers";
import { computeRiskScore } from "@/lib/geopolitical/risk-scorer";
import type { GeopoliticalRiskResponse } from "@/types/geopolitical";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Fetch all three article sets in parallel
    const [conflictRaw, abuDhabiRaw, officialRaw] = await Promise.all([
      fetchGeopoliticalNews(IRAN_US_UAE_QUERY, 8),
      fetchGeopoliticalNews(ABU_DHABI_CONFLICT_QUERY, 6),
      fetchGeopoliticalNews(UAE_OFFICIAL_QUERY, 6),
    ]);

    // Deduplicate across all sets using a shared seen-URL set
    const seen = new Set<string>();
    const conflictNews   = transformGeopoliticalArticles(conflictRaw, seen);
    const abuDhabiNews   = transformGeopoliticalArticles(abuDhabiRaw, seen);
    const allOfficial    = transformGeopoliticalArticles(officialRaw, seen);

    // Official statements = confirmed government sources only
    const officialStatements = allOfficial.filter((a) => a.isOfficialStatement);

    // Compute risk score across all retrieved articles
    const allArticles = [...conflictNews, ...abuDhabiNews, ...allOfficial];
    const risk = computeRiskScore(allArticles);

    const result: GeopoliticalRiskResponse = {
      risk,
      officialStatements,
      conflictNews,
      abuDhabiNews,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: result }, {
      headers: {
        // News: 1 hour cache; risk score will recompute from fresh articles every 2h
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[/api/geopolitical-risk]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
