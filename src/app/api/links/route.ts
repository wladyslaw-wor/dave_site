import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api-auth";
import { getLinks } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const links = await getLinks();
  return NextResponse.json(links);
}

export async function POST(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => ({}));
  const maxOrder = await prisma.link.aggregate({ _max: { order: true } });
  const link = await prisma.link.create({
    data: {
      label: typeof body.label === "string" && body.label ? body.label : "New link",
      url: typeof body.url === "string" && body.url ? body.url : "",
      tag: typeof body.tag === "string" ? body.tag : "Link",
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath("/");
  revalidatePath("/about");

  return NextResponse.json(link, { status: 201 });
}
