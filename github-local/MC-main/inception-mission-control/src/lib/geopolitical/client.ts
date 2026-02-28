// Server-side only.

const GNEWS_API_URL = "https://gnews.io/api/v4/search";

// GNews treats spaces as AND — keep each query to 4-5 keywords max
// Iran-US conflict with Gulf/UAE angle
export const IRAN_US_UAE_QUERY = "Iran US escalation Gulf";

// Abu Dhabi specific
export const ABU_DHABI_CONFLICT_QUERY = '"Abu Dhabi" Iran';

// UAE & Gulf states position on Iran-US tensions
export const UAE_OFFICIAL_QUERY = "Iran US UAE";

export async function fetchGeopoliticalNews(query: string, max: number = 8) {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) throw new Error("GNEWS_API_KEY environment variable is not set.");

  const params = new URLSearchParams({
    q: query,
    apikey: apiKey,
    lang: "en",
    max: String(max),
    sortby: "publishedAt",
  });

  const res = await fetch(`${GNEWS_API_URL}?${params}`, {
    next: { revalidate: 3600 }, // 1-hour ISR cache for news
  });

  if (!res.ok) throw new Error(`GNews error ${res.status}: ${res.statusText}`);
  return res.json();
}
