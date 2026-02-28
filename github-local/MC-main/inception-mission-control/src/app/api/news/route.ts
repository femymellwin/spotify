import { NextRequest, NextResponse } from "next/server";
import { fetchGNews } from "@/lib/news/client";
import { transformGNewsResponse } from "@/lib/news/transformers";
import { NEWS_QUERIES } from "@/lib/utils/constants";
import type { NewsCategory } from "@/types/news";

export const runtime = "nodejs";

const VALID_CATEGORIES: NewsCategory[] = ["tech", "world", "uae"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as NewsCategory | null;

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { success: false, error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    let raw;

    if (category === "tech") {
      // Use GNews top-headlines for tech (better curated)
      raw = await fetchGNews({ topic: "technology", max: 12 });
    } else {
      // Use keyword search for world and UAE
      raw = await fetchGNews({ query: NEWS_QUERIES[category], max: 12 });
    }

    const result = transformGNewsResponse(raw, category);

    return NextResponse.json({ success: true, data: result }, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[/api/news?category=${category}]`, message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
