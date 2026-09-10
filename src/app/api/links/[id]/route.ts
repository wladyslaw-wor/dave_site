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
  for (const key of ["label", "url", "tag"] as const) {
    if (key in body) data[key] = body[key];
  }

  const link = await prisma.link.update({ where: { id }, data });

  revalidatePath("/");
  revalidatePath("/about");

  return NextResponse.json(link);
}

export async function DELETE(_req: Request, { params }: Params) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await prisma.link.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/about");

  return NextResponse.json({ ok: true });
}
