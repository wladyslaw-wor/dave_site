import { NextResponse } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
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
  req: Request,
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
    const ext = path.extname(target).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";
    const size = stats.size;

    const range = req.headers.get("range");
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      const start = match?.[1] ? Number(match[1]) : 0;
      const end = match?.[2] ? Number(match[2]) : size - 1;

      if (!match || Number.isNaN(start) || Number.isNaN(end) || start > end || end >= size) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${size}` },
        });
      }

      const stream = createReadStream(/* turbopackIgnore: true */ target, { start, end });
      return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
        status: 206,
        headers: {
          "Content-Type": contentType,
          "Accept-Ranges": "bytes",
          "Content-Range": `bytes ${start}-${end}/${size}`,
          "Content-Length": String(end - start + 1),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const stream = createReadStream(/* turbopackIgnore: true */ target);
    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Content-Length": String(size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
