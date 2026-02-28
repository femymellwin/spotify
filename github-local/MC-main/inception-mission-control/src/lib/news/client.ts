// Server-side only — never import this from client components.

const GNEWS_API_URL = "https://gnews.io/api/v4";

interface GNewsFetchOptions {
  query?: string;
  topic?: string;
  lang?: string;
  country?: string;
  max?: number;
}

export async function fetchGNews(options: GNewsFetchOptions) {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    throw new Error("GNEWS_API_KEY environment variable is not set.");
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    lang: options.lang ?? "en",
    max: String(options.max ?? 10),
    sortby: "publishedAt",
  });

  if (options.query) params.set("q", options.query);
  if (options.topic) params.set("topic", options.topic);
  if (options.country) params.set("country", options.country);

  const endpoint = options.topic ? `${GNEWS_API_URL}/top-headlines` : `${GNEWS_API_URL}/search`;
  const url = `${endpoint}?${params.toString()}`;

  const response = await fetch(url, {
    next: { revalidate: 300 }, // 5-minute ISR cache
  });

  if (response.status === 429) {
    throw new Error("GNews rate limit exceeded (100 req/day on free tier). Try again later.");
  }

  if (response.status === 403) {
    throw new Error("GNews API key is invalid or quota exhausted.");
  }

  if (!response.ok) {
    throw new Error(`GNews API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
