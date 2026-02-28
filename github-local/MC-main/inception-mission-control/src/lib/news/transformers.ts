import type { NewsArticle, NewsCategory, NewsResponse, RawGNewsArticle, RawGNewsResponse } from "@/types/news";

function generateId(url: string): string {
  // Simple hash from URL
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).slice(0, 10);
}

function cleanTitle(title: string): string {
  // Remove source suffix like " - Reuters"
  return title.replace(/\s+-\s+[^-]+$/, "").trim();
}

export function transformGNewsResponse(
  raw: RawGNewsResponse,
  category: NewsCategory
): NewsResponse {
  const seen = new Set<string>();

  const articles: NewsArticle[] = raw.articles
    .filter((a: RawGNewsArticle) => {
      if (!a.title || a.title === "[Removed]") return false;
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    })
    .map((a: RawGNewsArticle): NewsArticle => ({
      id: generateId(a.url),
      title: cleanTitle(a.title),
      description: a.description
        ? a.description.slice(0, 180) + (a.description.length > 180 ? "…" : "")
        : null,
      url: a.url,
      source: a.source.name,
      publishedAt: a.publishedAt,
      category,
      imageUrl: a.image ?? null,
    }));

  return {
    articles,
    category,
    totalResults: raw.totalArticles,
    fetchedAt: new Date().toISOString(),
  };
}
