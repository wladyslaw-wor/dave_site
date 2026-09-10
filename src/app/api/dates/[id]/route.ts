import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  for (const key of ["date", "city", "venue", "url"] as const) {
    if (key in body) data[key] = body[key];
  }

  const date = await prisma.tourDate.update({ where: { id }, data });

  revalidatePath("/");

  return NextResponse.json(date);
}

export async function DELETE(_req: Request, { params }: Params) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await prisma.tourDate.delete({ where: { id } });

  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
