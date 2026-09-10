import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = body.id;
  if (typeof id !== "string" || !id || id.length > 100) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.click.upsert({
    where: { id },
    create: { id, count: 1 },
    update: { count: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}
