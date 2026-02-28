import type {
  RawXSearchResponse,
  RawXUser,
  XTrendsResponse,
  XTweet,
} from "@/types/x";

function buildTweetUrl(username: string, tweetId: string): string {
  return `https://x.com/${username}/status/${tweetId}`;
}

// Strip URLs and @mentions clutter from display text
function cleanTweetText(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, "")   // remove URLs
    .replace(/\s{2,}/g, " ")          // collapse whitespace
    .trim();
}

export function transformXResponse(raw: RawXSearchResponse): XTrendsResponse {
  const usersById = new Map<string, RawXUser>();
  for (const user of raw.includes?.users ?? []) {
    usersById.set(user.id, user);
  }

  const tweets: XTweet[] = (raw.data ?? []).map((t): XTweet => {
    const author = usersById.get(t.author_id);
    return {
      id: t.id,
      text: cleanTweetText(t.text),
      authorName: author?.name ?? "Unknown",
      authorUsername: author?.username ?? "unknown",
      createdAt: t.created_at,
      url: buildTweetUrl(author?.username ?? "i", t.id),
      metrics: {
        likes: t.public_metrics.like_count,
        retweets: t.public_metrics.retweet_count,
        replies: t.public_metrics.reply_count,
        impressions: t.public_metrics.impression_count,
      },
    };
  });

  return {
    tweets,
    fetchedAt: new Date().toISOString(),
  };
}
