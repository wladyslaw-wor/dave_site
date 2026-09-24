import { prisma } from "@/lib/prisma";
import { EMPTY_ALBUM, parseAlbum } from "@/lib/album";

export async function getAlbum() {
  const album = await prisma.album.findUnique({ where: { id: 1 } });
  return album ? parseAlbum(album) : EMPTY_ALBUM;
}
