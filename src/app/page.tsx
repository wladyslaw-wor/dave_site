import type { Metadata } from "next";
import { getContent, getLinks, getMenu, getDates } from "@/lib/content";
import { SiteChrome } from "@/components/site/SiteChrome";
import { HeroHeader } from "@/components/site/HeroHeader";
import { ReleaseCard } from "@/components/site/ReleaseCard";
import { LinkList } from "@/components/site/LinkList";
import { TourDates } from "@/components/site/TourDates";
import { SocialLinks } from "@/components/site/SocialLinks";
import { SiteFooter } from "@/components/site/SiteFooter";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const title = content.name;
  const description = `${content.bio} ${content.releaseKicker}: ${content.releaseTitle}.`.trim();

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: content.coverUrl ? [{ url: content.coverUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: content.coverUrl ? [content.coverUrl] : undefined,
    },
  };
}

export default async function LinksPage() {
  const [content, links, menu, dates] = await Promise.all([
    getContent(),
    getLinks(),
    getMenu(),
    getDates(),
  ]);

  return (
    <SiteChrome content={content} menu={menu}>
      <HeroHeader name={content.name} bio={content.bio} />
      <ReleaseCard content={content} />
      <LinkList links={links} />
      {content.showTour ? <TourDates dates={dates} /> : null}
      <SocialLinks content={content} />
      <SiteFooter content={content} />
    </SiteChrome>
  );
}
