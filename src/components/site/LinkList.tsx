import { TrackedLink } from "./TrackedLink";
import type { Link as LinkModel } from "@/types";

export function LinkList({
  links,
  variant = "full",
}: {
  links: LinkModel[];
  variant?: "full" | "compact";
}) {
  return (
    <div className="link-list">
      {links.map((link, i) => (
        <TrackedLink
          key={link.id}
          trackId={link.id}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className={`link-row${variant === "compact" ? " is-compact" : ""}`}
        >
          {variant === "full" ? (
            <span className="link-index">{String(i + 1).padStart(2, "0")}</span>
          ) : null}
          <span className="link-label">{link.label}</span>
          {link.tag ? <span className="link-tag">{link.tag}</span> : null}
          <span className="link-arrow">↗</span>
        </TrackedLink>
      ))}
    </div>
  );
}
