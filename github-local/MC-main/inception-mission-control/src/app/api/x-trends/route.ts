import { NextResponse } from "next/server";
import { searchRecentTweets, AI_SEARCH_QUERY } from "@/lib/x/client";
import { transformXResponse } from "@/lib/x/transformers";

export const runtime = "nodejs";

export async function GET() {
  try {
    const raw = await searchRecentTweets(AI_SEARCH_QUERY, 20);
    const result = transformXResponse(raw);

    return NextResponse.json({ success: true, data: result }, {
      headers: {
        "Cache-Control": "s-maxage=900, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[/api/x-trends]", message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
