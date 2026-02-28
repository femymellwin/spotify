export type NewsCategory = "tech" | "world" | "uae";

export interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  url: string;
  source: string;
  publishedAt: string;
  category: NewsCategory;
  imageUrl: string | null;
}

export interface NewsResponse {
  articles: NewsArticle[];
  category: NewsCategory;
  totalResults: number;
  fetchedAt: string;
}

// Raw GNews API types
export interface RawGNewsSource {
  name: string;
  url: string;
}

export interface RawGNewsArticle {
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  image: string | null;
  publishedAt: string;
  source: RawGNewsSource;
}

export interface RawGNewsResponse {
  totalArticles: number;
  articles: RawGNewsArticle[];
}
