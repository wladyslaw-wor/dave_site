import type { Metadata } from "next";
import { getContent, getLinks, getMenu } from "@/lib/content";
import { SiteChrome } from "@/components/site/SiteChrome";
import { AboutIntro } from "@/components/site/AboutIntro";
import { LinkList } from "@/components/site/LinkList";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const title = `${content.name} — About`;
  const description = content.aboutText.split("\n").find((line) => line.trim().length > 0) ?? content.bio;

  return {
    title,
    description,
    alternates: {
      canonical: "/about",
    },
    openGraph: {
      title,
      description,
      type: "profile",
      images: content.aboutPhoto ? [{ url: content.aboutPhoto }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: content.aboutPhoto ? [content.aboutPhoto] : undefined,
    },
  };
}

export default async function AboutPage() {
  const [content, links, menu] = await Promise.all([getContent(), getLinks(), getMenu()]);

  return (
    <SiteChrome content={content} menu={menu}>
      <AboutIntro content={content} />
      <LinkList links={links} variant="compact" />
    </SiteChrome>
  );
}
