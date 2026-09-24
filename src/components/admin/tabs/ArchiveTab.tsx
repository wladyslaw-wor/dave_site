"use client";

import { parseArchive, type ArchiveData, type MediaItem } from "@/lib/editor-content";
import { EditorSave, ItemControls, MediaEditor, moveItem, useContentEditor } from "../editor/EditorTools";

export function ArchiveTab({ initialArchive }: { initialArchive: ArchiveData }) {
  const editor = useContentEditor(initialArchive, "/api/archive", parseArchive);
  const { data: archive, setData, saving, uploads, onBusyChange } = editor;

  function add(type: MediaItem["type"]) {
    setData((prev) => ({ items: [...prev.items, { id: crypto.randomUUID(), type, url: "", caption: "" }] }));
  }

  return <form className="admin-tab-content" onSubmit={(event) => { event.preventDefault(); void editor.save(); }}>
    <p className="admin-hint">Add photos and videos by file or link. Arrange items below, then save to publish on /archive.</p>
    <fieldset className="album-editor-fields" disabled={saving || uploads > 0}>
      <div className="admin-group-header">
        <h3 className="admin-group-title">Photo & video archive</h3>
        <div className="admin-btn-row">
          <button type="button" className="admin-btn" disabled={archive.items.length >= 100} onClick={() => add("image")}>+ Photo</button>
          <button type="button" className="admin-btn" disabled={archive.items.length >= 100} onClick={() => add("video")}>+ Video</button>
        </div>
      </div>
      {archive.items.length === 0 ? <p className="admin-field-hint">No photos or videos yet.</p> : null}
      {archive.items.map((item, index) => <section className="album-editor-card" key={item.id}>
        <div className="admin-group-header">
          <span className="admin-field-label">{item.type === "image" ? "Photo" : "Video"} · {index + 1}</span>
          <ItemControls label={`archive item ${index + 1}`} index={index} count={archive.items.length}
            onMove={(direction) => setData((prev) => ({ items: moveItem(prev.items, index, direction) }))}
            onRemove={() => { if (window.confirm("Remove this item from the archive? Save to apply this change.")) setData((prev) => ({ items: prev.items.filter((row) => row.id !== item.id) })); }} />
        </div>
        <MediaEditor item={item} category="archive" onBusyChange={onBusyChange}
          onChange={(updated) => setData((prev) => ({ items: prev.items.map((row) => row.id === item.id ? updated : row) }))} />
      </section>)}
    </fieldset>
    <EditorSave name="archive" href="/archive" {...editor} />
  </form>;
}
