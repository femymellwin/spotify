import type { GeopoliticalArticle } from "@/types/geopolitical";
import type { RawGNewsArticle, RawGNewsResponse } from "@/types/news";

// UAE-based or Gulf-credible sources — WAM (state agency) rarely appears on GNews
// so we broaden to include reputable regional outlets
const OFFICIAL_UAE_SOURCES = [
  "wam", "emirates news agency", "uae government", "mofaic",
  "ministry of foreign", "uae cabinet", "presidential court",
  "the national", "gulf news", "khaleej times", "arabian business",
  "gulf business", "zawya", "devdiscourse", "reuters",
];

const ABU_DHABI_KEYWORDS = [
  "abu dhabi", "adnoc", "mubadala", "presidential", "uae president",
];

function isOfficialSource(sourceName: string): boolean {
  const s = sourceName.toLowerCase();
  return OFFICIAL_UAE_SOURCES.some((o) => s.includes(o));
}

function isAbuDhabiSpecific(title: string, description: string | null): boolean {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  return ABU_DHABI_KEYWORDS.some((kw) => text.includes(kw));
}

function generateId(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash << 5) - hash + url.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).slice(0, 10);
}

export function transformGeopoliticalArticles(
  raw: RawGNewsResponse,
  seen: Set<string>
): GeopoliticalArticle[] {
  return (raw.articles ?? [])
    .filter((a: RawGNewsArticle) => {
      if (!a.title || a.title === "[Removed]") return false;
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    })
    .map((a: RawGNewsArticle): GeopoliticalArticle => ({
      id: generateId(a.url),
      title: a.title.replace(/\s+-\s+[^-]+$/, "").trim(),
      description: a.description ? a.description.slice(0, 200) : null,
      url: a.url,
      source: a.source.name,
      publishedAt: a.publishedAt,
      isOfficialStatement: isOfficialSource(a.source.name),
      isAbuDhabiSpecific: isAbuDhabiSpecific(a.title, a.description),
    }));
}
