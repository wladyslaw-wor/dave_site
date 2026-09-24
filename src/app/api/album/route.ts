import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api-auth";
import { getAlbum } from "@/lib/album-content";
import { parseAlbum } from "@/lib/album";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return NextResponse.json(await getAlbum());
}

export async function PUT(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  let album;
  try {
    album = parseAlbum(await req.json());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid album data." }, { status: 400 });
  }
  try {
    await prisma.album.upsert({ where: { id: 1 }, create: { id: 1, ...album }, update: album });
  } catch (error) {
    console.error("Failed to save album", error);
    return NextResponse.json(
      { error: "Could not save album. Your changes are still here. Please retry." },
      { status: 500 },
    );
  }
  revalidatePath("/album");
  revalidatePath("/admin");
  return NextResponse.json(album);
}
