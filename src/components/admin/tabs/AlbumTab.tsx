"use client";

import { useEffect, useState } from "react";
import { EMPTY_ALBUM, parseAlbum, type AlbumCollection, type AlbumData, type AlbumItem } from "@/lib/album";
import { UploadField } from "../UploadField";

const COLLECTIONS: { key: AlbumCollection; label: string; titleLabel: string; urlLabel: string }[] = [
  { key: "singles", label: "Singles", titleLabel: "Single title", urlLabel: "Listen URL (optional)" },
  { key: "platforms", label: "Album platforms", titleLabel: "Platform name", urlLabel: "Album URL" },
  { key: "videos", label: "Music videos", titleLabel: "Video title", urlLabel: "YouTube URL" },
  { key: "photos", label: "Photo gallery", titleLabel: "Caption / image description", urlLabel: "Photo URL" },
];

export function AlbumTab({ initialAlbum = EMPTY_ALBUM }: { initialAlbum: AlbumData }) {
  const [album, setAlbum] = useState(initialAlbum);
  const [saved, setSaved] = useState(JSON.stringify(initialAlbum));
  const [saving, setSaving] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const dirty = JSON.stringify(album) !== saved;

  useEffect(() => {
    if (!dirty && uploads === 0) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, uploads]);

  function updateItem(key: AlbumCollection, id: string, patch: Partial<AlbumItem>) {
    setAlbum((prev) => ({ ...prev, [key]: prev[key].map((item) => item.id === id ? { ...item, ...patch } : item) }));
    setMessage("");
  }

  function moveItem(key: AlbumCollection, index: number, direction: -1 | 1) {
    setAlbum((prev) => {
      const items = [...prev[key]];
      const target = index + direction;
      if (target < 0 || target >= items.length) return prev;
      [items[index], items[target]] = [items[target], items[index]];
      return { ...prev, [key]: items };
    });
  }

  async function save() {
    if (saving || uploads > 0) return;
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const data = parseAlbum(album);
      const res = await fetch("/api/album", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(typeof body?.error === "string" ? body.error : "Could not save album. Your changes are still here. Please retry.");
      const updated = parseAlbum(body);
      setAlbum(updated);
      setSaved(JSON.stringify(updated));
      setMessage("Album saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save album. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-tab-content" onSubmit={(event) => { event.preventDefault(); void save(); }}>
      <div className="admin-hint">Edit the album below, then click Save album to publish. Empty sections are hidden.</div>
      <fieldset className="album-editor-fields" disabled={saving}>
        <section className="admin-group">
          <label className="admin-field">
            <span className="admin-field-label">Album title</span>
            <input className="admin-input" maxLength={500} value={album.title} onChange={(e) => setAlbum((prev) => ({ ...prev, title: e.target.value }))} />
          </label>
          <label className="admin-field">
            <span className="admin-field-label">Album cover URL</span>
            <input className="admin-input" maxLength={2048} value={album.coverUrl} placeholder="https://..." onChange={(e) => setAlbum((prev) => ({ ...prev, coverUrl: e.target.value }))} />
          </label>
          <UploadField
            category="album"
            accept="image/jpeg,image/png,image/webp,image/gif"
            label="Upload album cover"
            hint="Square image, displayed below the album title at the same size as the About photo."
            onUploaded={(url) => setAlbum((prev) => ({ ...prev, coverUrl: url }))}
            onBusyChange={(busy) => setUploads((count) => count + (busy ? 1 : -1))}
          />
          {album.coverUrl ? <div className="admin-tab-content">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="album-editor-preview" src={album.coverUrl} alt="Album cover preview" />
            <div className="admin-btn-row">
              <button type="button" className="admin-btn" disabled={uploads > 0} onClick={() => setAlbum((prev) => ({ ...prev, coverUrl: "" }))}>Remove cover</button>
            </div>
          </div> : null}
          <label className="admin-field">
            <span className="admin-field-label">Album text (one paragraph per line)</span>
            <textarea className="admin-input" rows={8} maxLength={50000} value={album.text} onChange={(e) => setAlbum((prev) => ({ ...prev, text: e.target.value }))} />
          </label>
        </section>
        {COLLECTIONS.map(({ key, label, titleLabel, urlLabel }) => (
          <section className="admin-group" key={key}>
            <div className="admin-group-header">
              <h3 className="admin-group-title">{label}</h3>
              <button type="button" className="admin-btn" disabled={album[key].length >= 100} onClick={() => {
                const item = { id: crypto.randomUUID(), title: "", url: "" };
                setAlbum((prev) => ({ ...prev, [key]: [...prev[key], item] }));
              }}>+ Add {key === "photos" ? "photo" : key === "videos" ? "video" : key === "platforms" ? "platform" : "single"}</button>
            </div>
            {key === "videos" ? <p className="admin-field-hint">Paste a YouTube watch, share, Shorts or embed link. The player is created automatically.</p> : null}
            {album[key].length === 0 ? <p className="admin-field-hint">No items yet.</p> : null}
            {album[key].map((item, index) => (
              <div className="album-editor-card" key={item.id}>
                <div className="admin-group-header">
                  <span className="admin-field-label">{label} · {index + 1}</span>
                  <div className="admin-link-controls">
                    <button type="button" className="admin-icon-btn" aria-label={`Move ${label} item ${index + 1} up`} disabled={index === 0} onClick={() => moveItem(key, index, -1)}>↑</button>
                    <button type="button" className="admin-icon-btn" aria-label={`Move ${label} item ${index + 1} down`} disabled={index === album[key].length - 1} onClick={() => moveItem(key, index, 1)}>↓</button>
                    <button type="button" className="admin-icon-btn" aria-label={`Remove ${label} item ${index + 1}`} onClick={() => setAlbum((prev) => ({ ...prev, [key]: prev[key].filter((row) => row.id !== item.id) }))}>✕</button>
                  </div>
                </div>
                <label className="admin-field">
                  <span className="admin-field-label">{titleLabel}</span>
                  <input className="admin-input" maxLength={500} value={item.title} onChange={(e) => updateItem(key, item.id, { title: e.target.value })} />
                </label>
                <label className="admin-field">
                  <span className="admin-field-label">{urlLabel}</span>
                  <input className="admin-input" maxLength={2048} value={item.url} placeholder={key === "videos" ? "https://www.youtube.com/watch?v=..." : "https://..."} onChange={(e) => updateItem(key, item.id, { url: e.target.value })} />
                </label>
                {key === "photos" ? <>
                  <UploadField category="album" accept="image/jpeg,image/png,image/webp,image/gif" label="Upload photo" onUploaded={(url) => updateItem(key, item.id, { url })} onBusyChange={(busy) => setUploads((count) => count + (busy ? 1 : -1))} />
                  {item.url ? (
                    // Uploaded and remote photos use their original URLs without image proxying.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="album-editor-preview" src={item.url} alt={item.title || "Photo preview"} loading="lazy" />
                  ) : null}
                </> : null}
              </div>
            ))}
          </section>
        ))}
      </fieldset>
      <div className="album-editor-save">
        <div className="admin-btn-row">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving || uploads > 0 || !dirty}>{saving ? "Saving…" : "Save album"}</button>
          <a className="admin-btn" href="/album" target="_blank" rel="noreferrer">View album ↗</a>
        </div>
        <span className="admin-field-hint" role="status">{uploads > 0 ? "Uploading photos…" : dirty ? "Unsaved album changes" : message || "All album changes saved"}</span>
        {error ? <span className="admin-field-error" role="alert">{error}</span> : null}
      </div>
    </form>
  );
}
