import "server-only";
import type { NewsArticle } from "./types";

/**
 * Football news from public RSS feeds (BBC Sport, The Guardian).
 * football-data.org has no news endpoint, so headlines come from here.
 *
 * Only the headline, a short summary and a link back to the publisher are
 * kept — the full article always stays on the publisher's site.
 */

const FEEDS = [
  { source: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/football/rss.xml" },
  { source: "The Guardian", url: "https://www.theguardian.com/football/rss" },
] as const;

const REVALIDATE_SECONDS = 600;
const REQUEST_TIMEOUT_MS = 8000;
const MAX_ARTICLES = 12;
const MAX_SUMMARY_LENGTH = 200;

const NAMED_ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity: string) => {
    if (entity[0] !== "#") return NAMED_ENTITIES[entity.toLowerCase()];
    const code = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
  });
}

function stripHtml(text: string): string {
  return decodeEntities(text.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .replace(/\s*Continue reading\.\.\.$/i, "")
    .trim();
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Text of the first <tag> in an RSS item, with CDATA unwrapped and entities decoded. */
function tagText(block: string, tag: string): string | undefined {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  if (!match) return undefined;
  const raw = match[1].trim();
  const cdata = raw.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return cdata ? cdata[1].trim() : decodeEntities(raw);
}

/** Feed links end up in href attributes, so only accept plain http(s) URLs. */
function safeHttpUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function parseFeed(xml: string, source: string): NewsArticle[] {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  return items.flatMap((item) => {
    const headline = stripHtml(tagText(item, "title") ?? "");
    const url = safeHttpUrl(tagText(item, "link"));
    const published = Date.parse(tagText(item, "pubDate") ?? "");
    if (!headline || !url || Number.isNaN(published)) return [];
    return [
      {
        id: url,
        headline,
        source,
        url,
        publishedAt: new Date(published).toISOString(),
        summary: truncate(stripHtml(tagText(item, "description") ?? ""), MAX_SUMMARY_LENGTH),
        category: stripHtml(tagText(item, "category") ?? "") || "Football",
      },
    ];
  });
}

async function fetchFeed(feed: (typeof FEEDS)[number]): Promise<NewsArticle[]> {
  const res = await fetch(feed.url, {
    headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`${feed.source} feed request failed (${res.status})`);
  return parseFeed(await res.text(), feed.source);
}

/** Newest football headlines across all feeds. A feed that fails is skipped; if all fail the list is empty. */
export async function getFootballNews(): Promise<NewsArticle[]> {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));

  const byUrl = new Map<string, NewsArticle>();
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("[football] news feed failed:", result.reason instanceof Error ? result.reason.message : result.reason);
      return;
    }
    result.value.forEach((article) => byUrl.set(article.url, article));
  });

  return [...byUrl.values()]
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, MAX_ARTICLES);
}
