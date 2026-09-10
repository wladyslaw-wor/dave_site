import type { CSSProperties, ReactNode } from "react";
import { BackgroundVisual } from "./BackgroundVisual";
import { SiteHeader } from "./SiteHeader";
import { BackToTop } from "./BackToTop";
import { Analytics } from "./Analytics";
import type { Content, MenuItem } from "@/types";

const FONT_STACK_VARS: Record<string, string> = {
  serif: "var(--stack-serif)",
  syne: "var(--stack-syne)",
  grotesk: "var(--stack-grotesk)",
};

export function SiteChrome({
  content,
  menu,
  children,
}: {
  content: Content;
  menu: MenuItem[];
  children: ReactNode;
}) {
  const left = content.layout === "left";

  const shellStyle = {
    "--accent": content.accent,
    "--fh": FONT_STACK_VARS[content.font] ?? FONT_STACK_VARS.serif,
  } as CSSProperties;

  const columnStyle = {
    "--col-max": left ? "640px" : "620px",
    "--col-margin": left ? "0" : "0 auto",
  } as CSSProperties;

  return (
    <div className="site-shell" style={shellStyle}>
      <Analytics
        googleAnalyticsId={content.googleAnalyticsId}
        yandexMetrikaId={content.yandexMetrikaId}
      />
      <BackgroundVisual
        videoUrl={content.videoUrl}
        bgUrl={content.bgUrl}
        overlay={content.overlay}
        layout={content.layout}
      />
      <SiteHeader name={content.name} menu={menu} />
      <div className="content-column" style={columnStyle}>
        {children}
      </div>
      <BackToTop />
    </div>
  );
}
