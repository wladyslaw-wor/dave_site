import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  await prisma.click.deleteMany({});

  return NextResponse.json({ ok: true });
}
