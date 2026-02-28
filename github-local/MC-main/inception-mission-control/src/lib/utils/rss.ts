// Shared server-side RSS/Atom XML parser. Zero dependencies.

export interface RSSItem {
  title: string;
  link: string;
  publishedAt: string; // ISO 8601
  description: string;
}

function extractTag(xml: string, tag: string): string {
  // CDATA variant: <tag><![CDATA[...]]></tag>
  const cdata = new RegExp(
    `<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`,
    "i"
  ).exec(xml);
  if (cdata) return cdata[1].trim();

  // Plain text variant: <tag>...</tag>
  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(xml);
  if (plain) return plain[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  return "";
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const m = new RegExp(`<${tag}[^>]+${attr}=["']([^"']+)["']`, "i").exec(xml);
  return m ? m[1] : "";
}

function toISO(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  try {
    return new Date(dateStr).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function generateId(link: string): string {
  let hash = 0;
  for (let i = 0; i < link.length; i++) {
    hash = (hash << 5) - hash + link.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/** Parse RSS 2.0 or Atom feed into normalized RSSItem array. */
export function parseRSS(xml: string, limit = 15): RSSItem[] {
  const items: RSSItem[] = [];

  // RSS 2.0: <item> blocks
  const rssBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];

  // Atom: <entry> blocks
  const atomBlocks = xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];

  const blocks = rssBlocks.length > 0 ? rssBlocks : atomBlocks;

  for (const block of blocks.slice(0, limit)) {
    const title = extractTag(block, "title");
    if (!title) continue;

    // Link: prefer <link href="..."/> (Atom) over <link>...</link> (RSS)
    const linkHref = extractAttr(block, "link", "href");
    const linkText = extractTag(block, "link") || extractTag(block, "guid");
    const link = linkHref || linkText;
    if (!link) continue;

    const pubDate =
      extractTag(block, "pubDate") ||
      extractTag(block, "published") ||
      extractTag(block, "updated") ||
      extractTag(block, "dc:date");

    const description =
      extractTag(block, "description") ||
      extractTag(block, "summary") ||
      extractTag(block, "content");

    items.push({
      title,
      link,
      publishedAt: toISO(pubDate),
      description: description.slice(0, 300),
    });
  }

  return items;
}

/** Keywords to identify conflict-relevant articles from general feeds. */
const CONFLICT_KEYWORDS = [
  "iran", "irgc", "hormuz", "strait", "gulf", "missile", "strike",
  "nuclear", "escalation", "ceasefire", "sanctions", "houthi", "pentagon",
  "iranian", "warship", "carrier group", "navy", "airstrike", "air strike",
  "conflict", "war", "drone", "ballistic", "retaliation", "khamenei",
  "uae", "abu dhabi", "dubai", "israel", "netanyahu", "hezbollah",
  "tanker", "oil field", "adnoc", "mubadala", "us forces", "military base",
  "intercept", "bombed", "attack on", "fired on", "security alert",
];

export function isConflictRelevant(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return CONFLICT_KEYWORDS.some((kw) => text.includes(kw));
}

export { generateId };
