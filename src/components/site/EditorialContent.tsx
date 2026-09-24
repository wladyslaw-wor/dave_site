import { inlineText, videoSource, type BlogPost, type MediaItem } from "@/lib/editor-content";

export function MediaDisplay({ item }: { item: MediaItem }) {
  const source = item.type === "video" ? videoSource(item.url) : null;
  return (
    <figure className="editorial-media">
      {item.type === "image" ? (
        <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={item.caption ? `Open photo: ${item.caption}` : "Open photo"}>
          {/* Remote and uploaded photos are served directly. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.url} alt={item.caption || "Photo"} loading="lazy" />
        </a>
      ) : source?.type === "embed" ? (
        <iframe src={source.url} title={item.caption || "Video"} loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
      ) : source?.type === "file" ? (
        <video controls playsInline preload="metadata" src={source.url} aria-label={item.caption || "Video"}>
          <a href={source.url} target="_blank" rel="noopener noreferrer">Open video ↗</a>
        </video>
      ) : source ? (
        <a className="editorial-video-link" href={source.url} target="_blank" rel="noopener noreferrer">Watch video<span aria-hidden="true">↗</span></a>
      ) : null}
      {item.caption ? <figcaption>{item.caption}</figcaption> : null}
    </figure>
  );
}

export function BlogPostContent({ post }: { post: BlogPost }) {
  return (
    <article className="blog-post" id={`post-${post.id}`}>
      <header className="blog-post-heading">
        <time className="release-kicker" dateTime={post.date}>{new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${post.date}T00:00:00Z`))}</time>
        <h2 className="about-h2">{post.title}</h2>
      </header>
      <div className="blog-blocks">
        {post.blocks.map((block) => block.type === "text" ? (
          <p className="about-paragraph blog-text" key={block.id}>
            {inlineText(block.text).map((part, index) => part.href ? <a key={index} href={part.href} target="_blank" rel="noopener noreferrer">{part.text}</a> : part.text)}
          </p>
        ) : <MediaDisplay key={block.id} item={block} />)}
      </div>
    </article>
  );
}
