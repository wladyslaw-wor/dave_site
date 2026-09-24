import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api-auth";
import { getBlog } from "@/lib/editor-data";
import { parseBlog } from "@/lib/editor-content";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  return NextResponse.json(await getBlog());
}

export async function PUT(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  let data;
  try {
    data = parseBlog(await req.json());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid blog data." }, { status: 400 });
  }
  try {
    await prisma.blog.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data });
  } catch (error) {
    console.error("Failed to save blog", error);
    return NextResponse.json({ error: "Could not save blog. Your changes are still here. Please retry." }, { status: 500 });
  }
  revalidatePath("/blog");
  revalidatePath("/admin");
  return NextResponse.json(data);
}
