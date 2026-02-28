// Server-side only — never import this from client components.

const X_API_BASE = "https://api.twitter.com/2";

// Topics to track — tuned for AI, frontier models, agents
export const AI_SEARCH_QUERY =
  '("frontier model" OR "AI agent" OR "AI agents" OR "large language model" OR LLM OR ' +
  '"Claude" OR "GPT-5" OR "Gemini" OR "Grok" OR "Llama" OR "multimodal" OR ' +
  '"reasoning model" OR "agentic AI" OR "foundation model") lang:en -is:retweet';

export async function searchRecentTweets(
  query: string,
  maxResults: number = 20
) {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) {
    throw new Error("X_BEARER_TOKEN environment variable is not set.");
  }

  const params = new URLSearchParams({
    query,
    max_results: String(Math.min(maxResults, 100)),
    sort_order: "relevancy",
    "tweet.fields": "created_at,public_metrics,author_id",
    expansions: "author_id",
    "user.fields": "name,username",
  });

  const url = `${X_API_BASE}/tweets/search/recent?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 900 }, // 15-min ISR cache
  });

  if (response.status === 401) {
    throw new Error("X Bearer Token is invalid or expired.");
  }

  if (response.status === 403) {
    throw new Error(
      "X API access denied. Ensure you have at least the Basic plan ($100/mo) at developer.x.com."
    );
  }

  if (response.status === 429) {
    throw new Error("X API rate limit hit. Resets every 15 minutes.");
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`X API error ${response.status}: ${body}`);
  }

  return response.json();
}

// Fetch a single tweet by ID (used by fact-checker)
export async function getTweetById(tweetId: string) {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) throw new Error("X_BEARER_TOKEN environment variable is not set.");

  const params = new URLSearchParams({
    "tweet.fields": "created_at,public_metrics,author_id,text",
    expansions: "author_id",
    "user.fields": "name,username",
  });

  const url = `${X_API_BASE}/tweets/${tweetId}?${params.toString()}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (response.status === 404) throw new Error("Tweet not found or has been deleted.");
  if (response.status === 401) throw new Error("X Bearer Token is invalid or expired.");
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`X API error ${response.status}: ${body}`);
  }

  return response.json();
}
