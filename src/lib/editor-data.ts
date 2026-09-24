import { prisma } from "@/lib/prisma";
import { EMPTY_ARCHIVE, EMPTY_BLOG, parseArchive, parseBlog } from "./editor-content";

export async function getBlog() {
  const data = await prisma.blog.findUnique({ where: { id: 1 } });
  return data ? parseBlog(data) : EMPTY_BLOG;
}

export async function getArchive() {
  const data = await prisma.mediaArchive.findUnique({ where: { id: 1 } });
  return data ? parseArchive(data) : EMPTY_ARCHIVE;
}
