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
  "googleAnalyticsId",
  "yandexMetrikaId",
] as const;

const GA_ID_PATTERN = /^G-[A-Z0-9]+$/i;
const YM_ID_PATTERN = /^\d+$/;

export async function PUT(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of EDITABLE_FIELDS) {
    if (key in body) data[key] = body[key];
  }

  if (
    typeof data.googleAnalyticsId === "string" &&
    data.googleAnalyticsId !== "" &&
    !GA_ID_PATTERN.test(data.googleAnalyticsId)
  ) {
    return NextResponse.json(
      { error: "Google Analytics ID must look like G-XXXXXXXXXX" },
      { status: 400 },
    );
  }
  if (
    typeof data.yandexMetrikaId === "string" &&
    data.yandexMetrikaId !== "" &&
    !YM_ID_PATTERN.test(data.yandexMetrikaId)
  ) {
    return NextResponse.json(
      { error: "Yandex Metrika ID must be numeric" },
      { status: 400 },
    );
  }

  const existing = await getContent();
  const updated = await prisma.content.update({ where: { id: existing.id }, data });

  revalidatePath("/");
  revalidatePath("/about");

  return NextResponse.json(updated);
}
