import type { Content } from "@/types";

export function AboutIntro({ content }: { content: Content }) {
  const paragraphs = content.aboutText.split("\n").filter((line) => line.trim().length > 0);

  return (
    <div className="about-block">
      <div
        className={`about-photo${content.aboutPhoto ? "" : " is-empty"}`}
        style={content.aboutPhoto ? { backgroundImage: `url("${content.aboutPhoto}")` } : undefined}
      >
        {!content.aboutPhoto ? (
          <span className="about-photo-caption">press photo / 1600 × 1600 px</span>
        ) : null}
      </div>

      <div>
        <h2 className="about-h2">{content.aboutTitle}</h2>
        <div className="about-rule" />
      </div>

      <div>
        {paragraphs.map((p, i) => (
          <p className="about-paragraph" key={i}>
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
