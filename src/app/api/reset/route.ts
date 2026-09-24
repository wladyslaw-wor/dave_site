import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_CONTENT,
  DEFAULT_LINKS,
  DEFAULT_MENU,
  DEFAULT_DATES,
} from "@/lib/defaults";
import { getContent } from "@/lib/content";
import { clearUploads } from "@/lib/upload";

export async function POST() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const existing = await getContent();

  await prisma.$transaction([
    prisma.content.update({ where: { id: existing.id }, data: DEFAULT_CONTENT }),
    prisma.link.deleteMany({}),
    prisma.menuItem.deleteMany({}),
    prisma.tourDate.deleteMany({}),
    prisma.click.deleteMany({}),
    prisma.album.deleteMany({}),
  ]);

  await prisma.$transaction([
    prisma.link.createMany({ data: DEFAULT_LINKS }),
    prisma.menuItem.createMany({ data: DEFAULT_MENU }),
    prisma.tourDate.createMany({ data: DEFAULT_DATES }),
  ]);

  await clearUploads();

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/album");

  return NextResponse.json({ ok: true });
}
