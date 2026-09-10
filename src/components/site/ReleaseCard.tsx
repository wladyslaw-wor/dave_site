import { TrackedLink } from "./TrackedLink";
import type { Content } from "@/types";

export function ReleaseCard({ content }: { content: Content }) {
  return (
    <TrackedLink
      trackId="release"
      href={content.releaseUrl}
      target="_blank"
      rel="noreferrer"
      className="release-card"
    >
      <div
        className={`release-cover${content.coverUrl ? "" : " is-empty"}`}
        style={content.coverUrl ? { backgroundImage: `url("${content.coverUrl}")` } : undefined}
      >
        {!content.coverUrl ? <span className="release-cover-caption">Cover</span> : null}
      </div>
      <div className="release-body">
        <span className="release-kicker">{content.releaseKicker}</span>
        <span className="release-title">{content.releaseTitle}</span>
      </div>
      <span className="release-arrow">↗</span>
    </TrackedLink>
  );
}
