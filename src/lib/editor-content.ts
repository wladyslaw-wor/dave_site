import { isWebUrl, youtubeEmbedUrl } from "./album";

export type MediaItem = { id: string; type: "image" | "video"; url: string; caption: string };
export type TextBlock = { id: string; type: "text"; text: string };
export type BlogBlock = TextBlock | MediaItem;
export type BlogPost = { id: string; title: string; date: string; published: boolean; blocks: BlogBlock[] };
export type BlogData = { posts: BlogPost[] };
export type ArchiveData = { items: MediaItem[] };
export const EMPTY_BLOG: BlogData = { posts: [] };
export const EMPTY_ARCHIVE: ArchiveData = { items: [] };

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid content data.");
  return value as Record<string, unknown>;
}

function text(value: unknown, label: string, max = 500): string {
  if (typeof value !== "string" || value.length > max) throw new Error(`${label}: use text up to ${max} characters.`);
  return value.trim();
}

function rows(value: unknown, label: string): Record<string, unknown>[] {
  if (!Array.isArray(value) || value.length > 100) throw new Error(`${label}: use up to 100 items.`);
  const ids = new Set<string>();
  return value.map((item) => {
    const row = record(item);
    const id = text(row.id, `${label} ID`, 100);
    if (!/^[a-zA-Z0-9_-]+$/.test(id) || ids.has(id)) throw new Error(`${label}: invalid or duplicate ID.`);
    ids.add(id);
    return { ...row, id };
  });
}

export function isMediaUrl(value: string): boolean {
  return isWebUrl(value) || /^\/api\/uploads\/[a-z]+\/[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp|gif|mp4|webm|mov)$/i.test(value);
}

export function videoSource(value: string): { type: "embed" | "file" | "link"; url: string } | null {
  if (!isMediaUrl(value)) return null;
  const youtube = youtubeEmbedUrl(value);
  if (youtube) return { type: "embed", url: youtube };
  const pathname = value.startsWith("/") ? value : new URL(value).pathname;
  if (/\.(mp4|webm|mov)$/i.test(pathname)) return { type: "file", url: value };
  return { type: "link", url: value };
}

function media(row: Record<string, unknown>): MediaItem {
  if (row.type !== "image" && row.type !== "video") throw new Error("Choose photo or video.");
  const url = text(row.url, "Media URL", 2048);
  if (!isMediaUrl(url)) throw new Error("Upload a file or enter a valid http(s) media URL.");
  return { id: row.id as string, type: row.type, url, caption: text(row.caption, "Caption") };
}

export function parseBlog(value: unknown): BlogData {
  const body = record(value);
  if (JSON.stringify(body).length > 2_000_000) throw new Error("Blog content is too large.");
  return { posts: rows(body.posts, "Posts").map((row) => {
    const title = text(row.title, "Post title");
    const date = text(row.date, "Post date", 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) throw new Error("Enter a valid post date.");
    if (typeof row.published !== "boolean") throw new Error("Invalid publication status.");
    const blocks = rows(row.blocks, "Post blocks").map((block): BlogBlock => block.type === "text"
      ? { id: block.id as string, type: "text", text: text(block.text, "Post text", 50000) }
      : media(block));
    if (row.published && (!title || !blocks.some((block) => block.type !== "text" || block.text))) throw new Error("Published posts need a title and content.");
    return { id: row.id as string, title, date, published: row.published, blocks };
  }) };
}

export function parseArchive(value: unknown): ArchiveData {
  return { items: rows(record(value).items, "Archive").map(media) };
}

export function publishedBlog(blog: BlogData): BlogData {
  return { posts: blog.posts.filter((post) => post.published) };
}

// Only this small link syntax is interpreted. HTML remains ordinary escaped text.
export function inlineText(value: string): { text: string; href?: string }[] {
  const parts: { text: string; href?: string }[] = [];
  const pattern = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let start = 0;
  for (const match of value.matchAll(pattern)) {
    if (!isWebUrl(match[2])) continue;
    parts.push({ text: value.slice(start, match.index) }, { text: match[1], href: match[2] });
    start = match.index! + match[0].length;
  }
  parts.push({ text: value.slice(start) });
  return parts;
}
