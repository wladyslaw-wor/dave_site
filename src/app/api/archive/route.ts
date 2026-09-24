import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api-auth";
import { getArchive } from "@/lib/editor-data";
import { parseArchive } from "@/lib/editor-content";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return NextResponse.json(await getArchive());
}

export async function PUT(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  let data;
  try {
    data = parseArchive(await req.json());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid archive data." }, { status: 400 });
  }
  try {
    await prisma.mediaArchive.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data });
  } catch (error) {
    console.error("Failed to save archive", error);
    return NextResponse.json({ error: "Could not save archive. Your changes are still here. Please retry." }, { status: 500 });
  }
  revalidatePath("/archive");
  revalidatePath("/admin");
  return NextResponse.json(data);
}
