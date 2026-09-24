import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import path from "path";

const UPLOADS_ROOT = path.resolve(
  /* turbopackIgnore: true */ process.cwd(),
  process.env.UPLOADS_DIR ?? "./uploads",
);

export type UploadCategory = "video" | "bg" | "avatar" | "cover" | "press" | "album";

const KIND_BY_CATEGORY: Record<UploadCategory, "video" | "image"> = {
  video: "video",
  bg: "image",
  avatar: "image",
  cover: "image",
  press: "image",
  album: "image",
};

const ALLOWED_TYPES: Record<"video" | "image", Record<string, string>> = {
  video: {
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
  },
  image: {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  },
};

const MAX_SIZE: Record<"video" | "image", number> = {
  video: 200 * 1024 * 1024,
  image: 15 * 1024 * 1024,
};

export const UPLOAD_CATEGORIES: UploadCategory[] = ["video", "bg", "avatar", "cover", "press", "album"];

export async function saveUpload(file: File, category: UploadCategory): Promise<string> {
  const kind = KIND_BY_CATEGORY[category];
  const ext = ALLOWED_TYPES[kind][file.type];
  if (!ext) {
    throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
  }
  if (file.size > MAX_SIZE[kind]) {
    throw new Error("File is too large");
  }

  const filename = `${randomUUID()}${ext}`;
  const dir = path.join(/* turbopackIgnore: true */ UPLOADS_ROOT, category);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(/* turbopackIgnore: true */ dir, filename), buffer);

  return `/api/uploads/${category}/${filename}`;
}

export function uploadsRoot() {
  return UPLOADS_ROOT;
}

export async function clearUploads() {
  await Promise.all(
    UPLOAD_CATEGORIES.map((category) =>
      rm(path.join(/* turbopackIgnore: true */ UPLOADS_ROOT, category), {
        recursive: true,
        force: true,
      }),
    ),
  );
}
