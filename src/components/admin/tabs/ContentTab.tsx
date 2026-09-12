"use client";

import type { ChangeEvent } from "react";
import { UploadField } from "../UploadField";
import type { Content, ContentPatch } from "@/types";

type PatchFn = (patch: ContentPatch, opts?: { immediate?: boolean }) => void;

export function ContentTab({ content, onPatch }: { content: Content; onPatch: PatchFn }) {
  const field =
    (key: keyof Content) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onPatch({ [key]: e.target.value } as ContentPatch);
    };

  return (
    <div className="admin-tab-content">
      <section className="admin-group">
        <label className="admin-field">
          <span className="admin-field-label">Artist name</span>
          <input className="admin-input" value={content.name} onChange={field("name")} />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Bio</span>
          <textarea className="admin-input" rows={3} value={content.bio} onChange={field("bio")} />
        </label>
      </section>

      <section className="admin-group">
        <h3 className="admin-group-title">Featured release</h3>
        <label className="admin-field">
          <span className="admin-field-label">Label</span>
          <input className="admin-input" value={content.releaseKicker} onChange={field("releaseKicker")} />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Title</span>
          <input className="admin-input" value={content.releaseTitle} onChange={field("releaseTitle")} />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">URL</span>
          <input className="admin-input" value={content.releaseUrl} onChange={field("releaseUrl")} />
        </label>
        <UploadField
          category="cover"
          accept="image/*"
          label="Cover art"
          onUploaded={(url) => onPatch({ coverUrl: url }, { immediate: true })}
        />
      </section>

      <section className="admin-group">
        <h3 className="admin-group-title">About page</h3>
        <label className="admin-field">
          <span className="admin-field-label">Headline</span>
          <input className="admin-input" value={content.aboutTitle} onChange={field("aboutTitle")} />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Text (one paragraph per line)</span>
          <textarea className="admin-input" rows={6} value={content.aboutText} onChange={field("aboutText")} />
        </label>
        <UploadField
          category="press"
          accept="image/*"
          label="Press photo"
          onUploaded={(url) => onPatch({ aboutPhoto: url }, { immediate: true })}
        />
      </section>

      <section className="admin-group">
        <h3 className="admin-group-title">Footer</h3>
        <label className="admin-field">
          <span className="admin-field-label">Footer line</span>
          <input className="admin-input" value={content.footer} onChange={field("footer")} />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Contact label</span>
          <input className="admin-input" value={content.contactLabel} onChange={field("contactLabel")} />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Contact URL</span>
          <input className="admin-input" value={content.contactUrl} onChange={field("contactUrl")} />
        </label>
      </section>

      <section className="admin-group">
        <h3 className="admin-group-title">Social links</h3>
        <label className="admin-field">
          <span className="admin-field-label">Instagram URL</span>
          <input className="admin-input" value={content.instagramUrl} onChange={field("instagramUrl")} placeholder="https://instagram.com/..." />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">TikTok URL</span>
          <input className="admin-input" value={content.tiktokUrl} onChange={field("tiktokUrl")} placeholder="https://tiktok.com/@..." />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">YouTube URL</span>
          <input className="admin-input" value={content.youtubeUrl} onChange={field("youtubeUrl")} placeholder="https://youtube.com/@..." />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Threads URL</span>
          <input className="admin-input" value={content.threadsUrl} onChange={field("threadsUrl")} placeholder="https://threads.net/@..." />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">X (Twitter) URL</span>
          <input className="admin-input" value={content.xUrl} onChange={field("xUrl")} placeholder="https://x.com/..." />
        </label>
        <span className="admin-field-hint">Leave empty to hide an icon.</span>
      </section>

      <section className="admin-group">
        <h3 className="admin-group-title">Analytics</h3>
        <label className="admin-field">
          <span className="admin-field-label">Google Analytics code</span>
          <textarea
            className="admin-input"
            rows={5}
            value={content.googleAnalyticsCode}
            onChange={field("googleAnalyticsCode")}
            placeholder={'<script async src="https://www.googletagmanager.com/gtag/js?id=..."></script>\n<script>...</script>'}
          />
          <span className="admin-field-hint">
            Paste the full snippet from Google Analytics (Admin → Data Streams → your stream).
            Leave empty to disable.
          </span>
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Yandex Metrika code</span>
          <textarea
            className="admin-input"
            rows={5}
            value={content.yandexMetrikaCode}
            onChange={field("yandexMetrikaCode")}
            placeholder={'<script>...</script>\n<noscript>...</noscript>'}
          />
          <span className="admin-field-hint">
            Paste the full counter code from Yandex Metrika (Settings → Counter code).
            Leave empty to disable.
          </span>
        </label>
      </section>
    </div>
  );
}
