import type { Metadata } from "next";
import { getAlbum } from "@/lib/album-content";
import { getContent } from "@/lib/content";
import { AlbumPageContent } from "@/components/site/AlbumPageContent";

export async function generateMetadata(): Promise<Metadata> {
  const [album, content] = await Promise.all([getAlbum(), getContent()]);
  const title = `${album.title || "The Album"} — ${content.name}`;
  const description = album.text.split("\n").find((line) => line.trim()) ?? `The album by ${content.name}.`;
  const photo = album.coverUrl || album.photos.find((item) => item.url)?.url;
  return {
    title, description, alternates: { canonical: "/album" },
    openGraph: { title, description, type: "website", images: photo ? [{ url: photo }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: photo ? [photo] : undefined },
  };
}

export default function AlbumPage() {
  return <AlbumPageContent />;
}
