// Server-side only — never import this from client components.
// Searches X for Iran-US-UAE conflict-related posts.

import { NextResponse } from "next/server";
import { searchRecentTweets } from "@/lib/x/client";
import { transformXResponse } from "@/lib/x/transformers";

export const runtime = "nodejs";

// Focused on Iran-US escalation with UAE/Gulf angle
const CONFLICT_QUERY =
  "((Iran OR IRGC) (UAE OR Gulf OR Hormuz OR \"Abu Dhabi\" OR Pentagon OR \"US forces\") " +
  "(strike OR escalation OR military OR missile OR drone OR conflict OR attack)) lang:en -is:retweet";

export async function GET() {
  try {
    const raw = await searchRecentTweets(CONFLICT_QUERY, 25);
    const result = transformXResponse(raw);

    return NextResponse.json({ success: true, data: result }, {
      headers: {
        "Cache-Control": "s-maxage=900, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[/api/x-conflict]", message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
