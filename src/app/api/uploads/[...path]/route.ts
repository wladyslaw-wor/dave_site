import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { uploadsRoot } from "@/lib/upload";

const MIME_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const root = path.resolve(/* turbopackIgnore: true */ uploadsRoot());
  const target = path.resolve(/* turbopackIgnore: true */ root, ...segments);

  if (!target.startsWith(root + path.sep)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const stats = await stat(/* turbopackIgnore: true */ target);
    if (!stats.isFile()) {
      return new NextResponse("Not found", { status: 404 });
    }
    const data = await readFile(/* turbopackIgnore: true */ target);
    const ext = path.extname(target).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
