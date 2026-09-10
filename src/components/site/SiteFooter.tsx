import type { Content } from "@/types";

export function SiteFooter({ content }: { content: Content }) {
  return (
    <div className="site-footer">
      <span>{content.footer}</span>
      <a href={content.contactUrl}>{content.contactLabel}</a>
    </div>
  );
}
