export type AlbumItem = { id: string; title: string; url: string };
export type AlbumCollection = "singles" | "platforms" | "videos" | "photos";
export type AlbumData = {
  title: string;
  coverUrl: string;
  text: string;
} & Record<AlbumCollection, AlbumItem[]>;

export const EMPTY_ALBUM: AlbumData = {
  title: "", coverUrl: "", text: "", singles: [], platforms: [], videos: [], photos: [],
};

export function isWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function youtubeEmbedUrl(value: string): string | null {
  if (!isWebUrl(value)) return null;
  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  let id: string | null = null;
  if (host === "youtu.be") {
    id = url.pathname.slice(1);
  } else if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)) {
    id = url.pathname === "/watch"
      ? url.searchParams.get("v")
      : url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)\/?$/)?.[1] ?? null;
  }
  return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

function isImageUrl(value: string): boolean {
  return isWebUrl(value) || /^\/api\/uploads\/[a-z]+\/[a-zA-Z0-9._-]+$/.test(value);
}

export function parseAlbum(value: unknown): AlbumData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid album data.");
  }
  const body = value as Record<string, unknown>;
  function readString(value: unknown, label: string, max: number) {
    if (typeof value !== "string" || value.length > max) {
      throw new Error(`${label} must be text, up to ${max} characters.`);
    }
    return value.trim();
  }
  const album: AlbumData = {
    ...EMPTY_ALBUM,
    title: readString(body.title, "Album title", 500),
    coverUrl: readString(body.coverUrl === undefined ? "" : body.coverUrl, "Album cover URL", 2048),
    text: readString(body.text, "Album text", 50000),
  };
  if (album.coverUrl && !isImageUrl(album.coverUrl)) {
    throw new Error("Album cover: upload an image or enter a valid http(s) URL.");
  }
  for (const key of ["singles", "platforms", "videos", "photos"] as const) {
    const rows = body[key];
    if (!Array.isArray(rows) || rows.length > 100) {
      throw new Error(`${key}: use a list of up to 100 items.`);
    }
    const ids = new Set<string>();
    album[key] = rows.map((row, index) => {
      const label = `${key}, item ${index + 1}`;
      if (!row || typeof row !== "object" || Array.isArray(row)) throw new Error(`${label}: invalid item.`);
      const id = readString(row.id, label, 100);
      const title = readString(row.title, `${label} title`, 500);
      const url = readString(row.url, `${label} URL`, 2048);
      if (!id || ids.has(id)) throw new Error(`${label}: invalid or duplicate ID.`);
      ids.add(id);
      if (url) {
        const valid = key === "videos" ? !!youtubeEmbedUrl(url)
          : key === "photos" ? isImageUrl(url)
          : isWebUrl(url);
        if (!valid) throw new Error(`${label}: enter ${key === "videos" ? "a valid YouTube video link" : "a valid http(s) URL"}.`);
      }
      return { id, title, url };
    });
  }
  return album;
}
