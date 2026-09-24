import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api-auth";
import { getMenu } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const menu = await getMenu();
  return NextResponse.json(menu);
}

export async function POST(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => ({}));
  const maxOrder = await prisma.menuItem.aggregate({ _max: { order: true } });
  const item = await prisma.menuItem.create({
    data: {
      label: typeof body.label === "string" && body.label ? body.label : "New item",
      url: typeof body.url === "string" && body.url ? body.url : "https://",
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/album");

  return NextResponse.json(item, { status: 201 });
}
