import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api-auth";
import { getContent } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const content = await getContent();
  return NextResponse.json(content);
}

const EDITABLE_FIELDS = [
  "name",
  "kicker",
  "bio",
  "releaseKicker",
  "releaseTitle",
  "releaseUrl",
  "coverUrl",
  "footer",
  "contactLabel",
  "contactUrl",
  "aboutTitle",
  "aboutText",
  "aboutPhoto",
  "videoUrl",
  "bgUrl",
  "avatarUrl",
  "overlay",
  "accent",
  "font",
  "layout",
  "showTour",
  "googleAnalyticsCode",
  "yandexMetrikaCode",
  "instagramUrl",
  "tiktokUrl",
  "youtubeUrl",
  "threadsUrl",
  "xUrl",
] as const;

export async function PUT(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of EDITABLE_FIELDS) {
    if (key in body) data[key] = body[key];
  }

  const existing = await getContent();
  const updated = await prisma.content.update({ where: { id: existing.id }, data });

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/album");

  return NextResponse.json(updated);
}
