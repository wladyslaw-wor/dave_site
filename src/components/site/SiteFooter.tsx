import type { Content } from "@/types";

export function SiteFooter({ content }: { content: Content }) {
  return (
    <div className="site-footer">
      <span>{content.footer}</span>
      <a href={content.contactUrl} target="_blank" rel="noopener noreferrer">
        {content.contactLabel}
      </a>
    </div>
  );
}
