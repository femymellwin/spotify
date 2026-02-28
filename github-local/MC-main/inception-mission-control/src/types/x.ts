export interface XTweet {
  id: string;
  text: string;
  authorName: string;
  authorUsername: string;
  createdAt: string;
  url: string;
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
    impressions: number;
  };
}

export interface XTrendsResponse {
  tweets: XTweet[];
  fetchedAt: string;
}

// Raw X API v2 types
export interface RawXPublicMetrics {
  retweet_count: number;
  like_count: number;
  reply_count: number;
  impression_count: number;
}

export interface RawXTweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics: RawXPublicMetrics;
}

export interface RawXUser {
  id: string;
  name: string;
  username: string;
}

export interface RawXSearchResponse {
  data?: RawXTweet[];
  includes?: {
    users?: RawXUser[];
  };
  meta?: {
    result_count: number;
    newest_id: string;
    oldest_id: string;
    next_token?: string;
  };
}
