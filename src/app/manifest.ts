import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const content = await getContent();

  return {
    name: content.name,
    short_name: content.name,
    start_url: "/",
    display: "standalone",
    background_color: "#f2efe9",
    theme_color: content.accent,
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
