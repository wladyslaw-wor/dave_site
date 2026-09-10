import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveUpload, UPLOAD_CATEGORIES, type UploadCategory } from "@/lib/upload";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const category = form.get("category");

  if (
    !(file instanceof File) ||
    typeof category !== "string" ||
    !UPLOAD_CATEGORIES.includes(category as UploadCategory)
  ) {
    return NextResponse.json({ error: "Invalid upload request" }, { status: 400 });
  }

  try {
    const url = await saveUpload(file, category as UploadCategory);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
