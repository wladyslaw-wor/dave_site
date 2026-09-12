import type { Content } from "@/types";

const ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.6 2h-3.2v13.2a3.1 3.1 0 1 1-2.5-3.04V8.9a6.3 6.3 0 1 0 5.7 6.27V9.03a7.9 7.9 0 0 0 4.6 1.47V7.3a4.85 4.85 0 0 1-4.6-4.83z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.3l5 2.7-5 2.7z" fill="currentColor" stroke="none" />
    </svg>
  ),
  threads: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 21.5c5 0 7.5-3.2 7.5-9.5S17 2.5 12 2.5 4.5 5.7 4.5 12" strokeLinecap="round" />
      <path d="M15.8 9.6c-.3-2-1.7-2.8-3.4-2.8-2.4 0-4 1.6-4 4.2v2c0 2.6 1.7 4.2 4.2 4.2 2.1 0 3.6-1 3.9-2.7.3-1.9-.7-3-3-3.3-2.6-.3-4 .4-4 1.9" strokeLinecap="round" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.5 3h4.2l4 5.6L16.4 3H20l-6.6 8.4L20.4 21h-4.2l-4.4-6.1L6.1 21H2.5l7-8.9z" />
    </svg>
  ),
};

const NETWORKS: { key: keyof typeof ICONS; field: keyof Content; label: string }[] = [
  { key: "instagram", field: "instagramUrl", label: "Instagram" },
  { key: "tiktok", field: "tiktokUrl", label: "TikTok" },
  { key: "youtube", field: "youtubeUrl", label: "YouTube" },
  { key: "threads", field: "threadsUrl", label: "Threads" },
  { key: "x", field: "xUrl", label: "X" },
];

export function SocialLinks({ content }: { content: Content }) {
  const items = NETWORKS.filter((n) => content[n.field]);
  if (items.length === 0) return null;

  return (
    <div className="social-links">
      {items.map((n) => (
        <a
          key={n.key}
          href={content[n.field] as string}
          target="_blank"
          rel="noreferrer"
          className="social-link"
          aria-label={n.label}
        >
          {ICONS[n.key]}
        </a>
      ))}
    </div>
  );
}
