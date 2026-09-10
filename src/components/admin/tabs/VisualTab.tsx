"use client";

import { UploadField } from "../UploadField";
import { ACCENT_PALETTE, FONT_OPTIONS, type FontKey } from "@/lib/defaults";
import type { Content, ContentPatch } from "@/types";

type PatchFn = (patch: ContentPatch, opts?: { immediate?: boolean }) => void;

export function VisualTab({ content, onPatch }: { content: Content; onPatch: PatchFn }) {
  const noMedia = !content.videoUrl && !content.bgUrl;

  return (
    <div className="admin-tab-content">
      <section className="admin-group">
        <span className="admin-field-label">Visual placement</span>
        <div className="admin-btn-row">
          <button
            type="button"
            className={`admin-choice-btn${content.layout === "background" ? " is-active" : ""}`}
            onClick={() => onPatch({ layout: "background" }, { immediate: true })}
          >
            Full background
          </button>
          <button
            type="button"
            className={`admin-choice-btn${content.layout === "left" ? " is-active" : ""}`}
            onClick={() => onPatch({ layout: "left" }, { immediate: true })}
          >
            Split · left
          </button>
        </div>
      </section>

      {noMedia ? (
        <div className="admin-hint">No media yet — add a background video or still image below.</div>
      ) : null}

      <section className="admin-group">
        <label className="admin-field">
          <span className="admin-field-label">Background video URL</span>
          <input
            className="admin-input"
            value={content.videoUrl}
            onChange={(e) => onPatch({ videoUrl: e.target.value })}
            placeholder="https://…mp4"
          />
        </label>
        <UploadField
          category="video"
          accept="video/mp4,video/webm,video/quicktime"
          label="Upload video"
          onUploaded={(url) => onPatch({ videoUrl: url }, { immediate: true })}
        />
        <UploadField
          category="bg"
          accept="image/*"
          label="Still-image fallback"
          onUploaded={(url) => onPatch({ bgUrl: url }, { immediate: true })}
        />
        <UploadField
          category="avatar"
          accept="image/*"
          label="Avatar"
          onUploaded={(url) => onPatch({ avatarUrl: url }, { immediate: true })}
        />
      </section>

      <section className="admin-group">
        <label className="admin-field">
          <span className="admin-field-label">Paper scrim — {Math.round(content.overlay * 100)}%</span>
          <input
            className="admin-range"
            type="range"
            min={0}
            max={0.9}
            step={0.05}
            value={content.overlay}
            onChange={(e) => onPatch({ overlay: parseFloat(e.target.value) }, { immediate: true })}
          />
        </label>
      </section>

      <section className="admin-group">
        <span className="admin-field-label">Accent</span>
        <div className="admin-swatch-row">
          {ACCENT_PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              className={`admin-swatch${content.accent === color ? " is-active" : ""}`}
              style={{ background: color }}
              onClick={() => onPatch({ accent: color }, { immediate: true })}
              aria-label={color}
            />
          ))}
        </div>
      </section>

      <section className="admin-group">
        <span className="admin-field-label">Display typeface</span>
        <div className="admin-btn-row">
          {(Object.keys(FONT_OPTIONS) as FontKey[]).map((key) => (
            <button
              key={key}
              type="button"
              className={`admin-choice-btn${content.font === key ? " is-active" : ""}`}
              style={{ fontFamily: FONT_OPTIONS[key].stack }}
              onClick={() => onPatch({ font: key }, { immediate: true })}
            >
              {FONT_OPTIONS[key].label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
