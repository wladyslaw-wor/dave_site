import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const direction = body.direction === 1 ? 1 : body.direction === -1 ? -1 : null;
  if (!direction) {
    return NextResponse.json({ error: "direction must be 1 or -1" }, { status: 400 });
  }

  const links = await prisma.link.findMany({ orderBy: { order: "asc" } });
  const index = links.findIndex((l) => l.id === id);
  const swapIndex = index + direction;
  if (index === -1 || swapIndex < 0 || swapIndex >= links.length) {
    return NextResponse.json(links);
  }

  const current = links[index];
  const swap = links[swapIndex];

  await prisma.$transaction([
    prisma.link.update({ where: { id: current.id }, data: { order: swap.order } }),
    prisma.link.update({ where: { id: swap.id }, data: { order: current.order } }),
  ]);

  revalidatePath("/");
  revalidatePath("/about");

  const updated = await prisma.link.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(updated);
}
