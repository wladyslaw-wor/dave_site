import { prisma } from "@/lib/prisma";
import { DEFAULT_CONTENT } from "@/lib/defaults";
import { getAlbum } from "@/lib/album-content";
import { getBlog, getArchive } from "@/lib/editor-data";

export async function getContent() {
  const content = await prisma.content.findFirst({ orderBy: { id: "asc" } });
  if (content) return content;
  return prisma.content.create({ data: DEFAULT_CONTENT });
}

export function getLinks() {
  return prisma.link.findMany({ orderBy: { order: "asc" } });
}

export function getMenu() {
  return prisma.menuItem.findMany({ orderBy: { order: "asc" } });
}

export function getDates() {
  return prisma.tourDate.findMany({ orderBy: { order: "asc" } });
}

export async function getClicksMap(): Promise<Record<string, number>> {
  const clicks = await prisma.click.findMany();
  return Object.fromEntries(clicks.map((c) => [c.id, c.count]));
}

export async function getSiteData() {
  const [content, links, menu, dates] = await Promise.all([
    getContent(),
    getLinks(),
    getMenu(),
    getDates(),
  ]);
  return { content, links, menu, dates };
}

export async function getFullState() {
  const [content, links, menu, dates, clicks, album, blog, archive] = await Promise.all([
    getContent(),
    getLinks(),
    getMenu(),
    getDates(),
    getClicksMap(),
    getAlbum(),
    getBlog(),
    getArchive(),
  ]);
  return { content, links, menu, dates, clicks, album, blog, archive };
}
