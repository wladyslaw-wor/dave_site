import type { Metadata } from "next";
import { getContent, getMenu } from "@/lib/content";
import { getArchive } from "@/lib/editor-data";
import { SiteChrome } from "@/components/site/SiteChrome";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MediaDisplay } from "@/components/site/EditorialContent";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return { title: `Archive — ${content.name}`, description: `Photos and videos from ${content.name}.`, alternates: { canonical: "/archive" } };
}

export default async function ArchivePage() {
  const [content, menu, archive] = await Promise.all([getContent(), getMenu(), getArchive()]);
  return (
    <SiteChrome content={content} menu={menu}>
      <main className="album-page">
        <header className="hero-block">
          <p className="release-kicker">Photos & videos · {content.name}</p>
          <h1 className="hero-h1">Archive</h1>
          <div className="hero-rule" />
        </header>
        {archive.items.length ? <div className="archive-grid">{archive.items.map((item) => <MediaDisplay key={item.id} item={item} />)}</div> : <p className="about-paragraph">Photos and videos are coming soon.</p>}
      </main>
      <SiteFooter content={content} />
    </SiteChrome>
  );
}
