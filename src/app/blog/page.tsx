import type { Metadata } from "next";
import { getContent, getMenu } from "@/lib/content";
import { getBlog } from "@/lib/editor-data";
import { publishedBlog } from "@/lib/editor-content";
import { SiteChrome } from "@/components/site/SiteChrome";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BlogPostContent } from "@/components/site/EditorialContent";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return { title: `Blog — ${content.name}`, description: `News and stories from ${content.name}.`, alternates: { canonical: "/blog" } };
}

export default async function BlogPage() {
  const [content, menu, blog] = await Promise.all([getContent(), getMenu(), getBlog()]);
  const { posts } = publishedBlog(blog);
  return (
    <SiteChrome content={content} menu={menu}>
      <main className="album-page">
        <header className="hero-block">
          <p className="release-kicker">Notes & stories · {content.name}</p>
          <h1 className="hero-h1">Blog</h1>
          <div className="hero-rule" />
        </header>
        {posts.length ? posts.map((post) => <BlogPostContent key={post.id} post={post} />) : <p className="about-paragraph">New stories are on the way.</p>}
      </main>
      <SiteFooter content={content} />
    </SiteChrome>
  );
}
