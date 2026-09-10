import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api-auth";
import { getDates } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const dates = await getDates();
  return NextResponse.json(dates);
}

export async function POST(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => ({}));
  const maxOrder = await prisma.tourDate.aggregate({ _max: { order: true } });
  const date = await prisma.tourDate.create({
    data: {
      date: typeof body.date === "string" && body.date ? body.date : "01 JAN",
      city: typeof body.city === "string" && body.city ? body.city : "City",
      venue: typeof body.venue === "string" && body.venue ? body.venue : "Venue",
      url: typeof body.url === "string" && body.url ? body.url : "https://",
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath("/");

  return NextResponse.json(date, { status: 201 });
}
