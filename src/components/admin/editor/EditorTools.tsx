"use client";

import { useEffect, useRef, useState } from "react";
import { isWebUrl } from "@/lib/album";
import { isMediaUrl, type MediaItem } from "@/lib/editor-content";
import { MediaDisplay } from "@/components/site/EditorialContent";
import { UploadField } from "../UploadField";

export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const result = [...items];
  const target = index + direction;
  if (target < 0 || target >= result.length) return result;
  [result[index], result[target]] = [result[target], result[index]];
  return result;
}

export function ItemControls({ label, index, count, onMove, onRemove, disabled }: {
  label: string; index: number; count: number; onMove: (direction: -1 | 1) => void; onRemove: () => void; disabled?: boolean;
}) {
  return <div className="admin-link-controls">
    <button type="button" className="admin-icon-btn" aria-label={`Move ${label} up`} disabled={disabled || index === 0} onClick={() => onMove(-1)}>↑</button>
    <button type="button" className="admin-icon-btn" aria-label={`Move ${label} down`} disabled={disabled || index === count - 1} onClick={() => onMove(1)}>↓</button>
    <button type="button" className="admin-icon-btn" aria-label={`Remove ${label}`} disabled={disabled} onClick={onRemove}>✕</button>
  </div>;
}

export function MediaEditor({ item, category, onChange, onBusyChange }: {
  item: MediaItem; category: "blog" | "archive"; onChange: (item: MediaItem) => void; onBusyChange: (busy: boolean) => void;
}) {
  return <>
    <label className="admin-field">
      <span className="admin-field-label">{item.type === "image" ? "Photo URL" : "Video URL"}</span>
      <input className="admin-input" maxLength={2048} value={item.url} placeholder="https://..." onChange={(event) => onChange({ ...item, url: event.target.value })} />
    </label>
    <UploadField category={item.type === "video" ? "video" : category}
      accept={item.type === "video" ? "video/mp4,video/webm,video/quicktime" : "image/jpeg,image/png,image/webp,image/gif"}
      label={item.type === "video" ? "Or upload video" : "Or upload photo"}
      hint={item.type === "video" ? "MP4, WebM or MOV · up to 200 MB. MP4 and WebM have the widest browser support." : "JPG, PNG, WebP or GIF · up to 15 MB. For links, use the image file URL."}
      onUploaded={(url) => onChange({ ...item, url })} onBusyChange={onBusyChange} />
    {item.type === "video" ? <p className="admin-field-hint">YouTube links and direct video files play on the page. Other video links open in a new tab.</p> : null}
    <label className="admin-field">
      <span className="admin-field-label">Caption / description</span>
      <input className="admin-input" maxLength={500} value={item.caption} onChange={(event) => onChange({ ...item, caption: event.target.value })} />
    </label>
    {isMediaUrl(item.url) ? <details className="editor-media-preview"><summary>Preview media</summary><MediaDisplay item={item} /></details> : null}
  </>;
}

export function TextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const input = useRef<HTMLTextAreaElement>(null);
  const selection = useRef({ start: value.length, end: value.length });
  const [addingLink, setAddingLink] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function insertLink() {
    if (!isWebUrl(url.trim()) || !label.trim() || /[\[\]\r\n]/.test(label)) {
      setError("Enter link text and a valid http(s) URL. Link text cannot contain brackets or line breaks.");
      return;
    }
    const href = url.trim().replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\s/g, "%20");
    const link = `[${label.trim()}](${href})`;
    const { start, end } = selection.current;
    const updated = value.slice(0, start) + link + value.slice(end);
    if (updated.length > 50000) { setError("Text is too long. Shorten it before adding a link."); return; }
    onChange(updated);
    setAddingLink(false);
    setError("");
    requestAnimationFrame(() => { input.current?.focus(); input.current?.setSelectionRange(start + link.length, start + link.length); });
  }

  return <div className="admin-tab-content">
    <label className="admin-field">
      <span className="admin-field-label">Text</span>
      <textarea ref={input} className="admin-input" rows={7} maxLength={50000} value={value} onChange={(event) => onChange(event.target.value)}
        onSelect={() => { if (input.current) selection.current = { start: input.current.selectionStart, end: input.current.selectionEnd }; }} />
    </label>
    <div className="admin-btn-row"><button className="admin-btn" type="button" onClick={() => {
      if (input.current) selection.current = { start: input.current.selectionStart, end: input.current.selectionEnd };
      const { start, end } = selection.current;
      setLabel(value.slice(start, end)); setUrl(""); setError(""); setAddingLink(true);
    }}>Insert link</button></div>
    {addingLink ? <div className="editor-link-form">
      <label className="admin-field"><span className="admin-field-label">Link text</span><input className="admin-input" maxLength={500} value={label} onChange={(event) => setLabel(event.target.value)} /></label>
      <label className="admin-field"><span className="admin-field-label">Website URL</span><input className="admin-input" maxLength={2048} value={url} placeholder="https://..." onChange={(event) => setUrl(event.target.value)} /></label>
      <div className="admin-btn-row"><button type="button" className="admin-btn" onClick={insertLink}>Add link</button><button type="button" className="admin-btn" onClick={() => setAddingLink(false)}>Cancel</button></div>
      {error ? <p className="admin-field-error" role="alert">{error}</p> : null}
    </div> : null}
    <p className="admin-field-hint">Select text or place the cursor, then insert a link. Links appear as [text](URL) here and open in a new tab on the site.</p>
  </div>;
}

export function useContentEditor<T>(initial: T, endpoint: string, parse: (value: unknown) => T) {
  const [data, setData] = useState(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(data) !== saved;

  useEffect(() => {
    if (!dirty && uploads === 0) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, uploads]);

  async function save() {
    if (saving || uploads > 0) return;
    setSaving(true);
    setError("");
    try {
      const parsed = parse(data);
      const res = await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed) });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(typeof body?.error === "string" ? body.error : "Could not save. Your changes are still here. Please retry.");
      const updated = parse(body);
      setData(updated);
      setSaved(JSON.stringify(updated));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  return { data, setData, dirty, saving, uploads, error, save, onBusyChange: (busy: boolean) => setUploads((count) => count + (busy ? 1 : -1)) };
}

export function EditorSave({ name, href, saving, uploads, dirty, error }: {
  name: string; href: string; saving: boolean; uploads: number; dirty: boolean; error: string;
}) {
  return <div className="album-editor-save">
    <div className="admin-btn-row">
      <button type="submit" className="admin-btn admin-btn-primary" disabled={saving || uploads > 0 || !dirty}>{saving ? "Saving…" : `Save ${name}`}</button>
      <a className="admin-btn" href={href} target="_blank" rel="noopener noreferrer">View {name} ↗</a>
    </div>
    <span className="admin-field-hint" role="status">{uploads > 0 ? "Uploading…" : dirty ? "Unsaved changes" : "All changes saved"}</span>
    {error ? <span className="admin-field-error" role="alert">{error}</span> : null}
  </div>;
}
