import type { CSSProperties } from "react";

type Props = {
  videoUrl: string;
  bgUrl: string;
  overlay: number;
  layout: string;
};

export function BackgroundVisual({ videoUrl, bgUrl, overlay, layout }: Props) {
  const left = layout === "left";

  const style = {
    "--vis-pos": left ? "relative" : "fixed",
    "--vis-flex": left ? "1 1 clamp(280px,44%,660px)" : "none",
    "--vis-min": left ? "clamp(260px,44vh,100vh)" : "0",
    "--overlay": overlay,
    "--bg-image": bgUrl ? `url("${bgUrl}")` : "none",
  } as CSSProperties;

  return (
    <div className="visual-layer" style={style}>
      <div className="visual-stripes" />
      {videoUrl ? (
        <video className="visual-video" src={videoUrl} autoPlay muted loop playsInline />
      ) : null}
      <div className="visual-fallback" />
      <div className="visual-scrim" />
      <div className="visual-gradient" />
    </div>
  );
}
