import { getAlbum } from "@/lib/album-content";
import { youtubeEmbedUrl } from "@/lib/album";
import { getContent, getMenu } from "@/lib/content";
import { SiteChrome } from "@/components/site/SiteChrome";
import { SiteFooter } from "@/components/site/SiteFooter";

export async function AlbumPageContent() {
  const [album, content, menu] = await Promise.all([getAlbum(), getContent(), getMenu()]);
  const singles = album.singles.filter((item) => item.title);
  const platforms = album.platforms.filter((item) => item.title && item.url);
  const videos = album.videos.flatMap((item) => {
    const src = youtubeEmbedUrl(item.url);
    return src ? [{ ...item, src }] : [];
  });
  const photos = album.photos.filter((item) => item.url);

  return (
    <SiteChrome content={content} menu={menu}>
      <main className="album-page">
        <header className="hero-block">
          <p className="release-kicker">The Album · {content.name}</p>
          <h1 className="hero-h1">{album.title || "The Album"}</h1>
          <div className="hero-rule" />
        </header>

        {album.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="about-photo album-cover" src={album.coverUrl} alt={`${album.title || "The Album"} — cover art`} />
        ) : null}

        {platforms.length ? <section className="album-section" aria-labelledby="album-listen">
          <h2 className="album-section-title" id="album-listen">Listen to the album</h2>
          <div className="album-platforms">
            {platforms.map((platform) => <a className="album-platform" key={platform.id} href={platform.url} target="_blank" rel="noreferrer">{platform.title}<span aria-hidden="true">↗</span></a>)}
          </div>
        </section> : null}

        {album.text ? <section className="album-section" aria-labelledby="album-story">
          <h2 className="album-section-title" id="album-story">About the album</h2>
          <div>{album.text.split(/\r?\n/).filter((line) => line.trim()).map((paragraph, index) => <p className="about-paragraph" key={index}>{paragraph}</p>)}</div>
        </section> : null}

        {singles.length ? <section className="album-section" aria-labelledby="album-singles">
          <h2 className="album-section-title" id="album-singles">Singles</h2>
          <ol className="album-singles link-list">
            {singles.map((single, index) => {
              const label = <><span className="link-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span className="link-label">{single.title}</span></>;
              return <li key={single.id}>{single.url ? <a className="link-row" href={single.url} target="_blank" rel="noreferrer">{label}<span className="link-arrow" aria-hidden="true">↗</span></a> : <div className="link-row album-single-text">{label}</div>}</li>;
            })}
          </ol>
        </section> : null}

        {videos.length ? <section className="album-section" aria-labelledby="album-videos">
          <h2 className="album-section-title" id="album-videos">Music videos</h2>
          {videos.map((video, index) => <figure className="album-video" key={video.id}>
            <iframe src={video.src} title={video.title || `${album.title || "The Album"} — music video ${index + 1}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
            {video.title ? <figcaption>{video.title}</figcaption> : null}
          </figure>)}
        </section> : null}

        {photos.length ? <section className="album-section" aria-labelledby="album-photos">
          <h2 className="album-section-title" id="album-photos">Gallery</h2>
          <div className="album-gallery">
            {photos.map((photo, index) => <figure key={photo.id}>
              <a href={photo.url} target="_blank" rel="noreferrer" aria-label={`Open photo: ${photo.title || `${album.title || "The Album"} ${index + 1}`}`}>
                {/* Uploaded and remote photos use their original URLs without image proxying. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.title || `${album.title || "The Album"} — photo ${index + 1}`} loading="lazy" />
              </a>
              {photo.title ? <figcaption>{photo.title}</figcaption> : null}
            </figure>)}
          </div>
        </section> : null}
      </main>
      <SiteFooter content={content} />
    </SiteChrome>
  );
}
