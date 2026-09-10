"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { UploadCategory } from "@/lib/upload";

export function UploadField({
  category,
  accept,
  label,
  hint,
  onUploaded,
}: {
  category: UploadCategory;
  accept: string;
  label: string;
  hint?: string;
  onUploaded: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("category", category);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body.error === "string" ? body.error : "Upload failed");
      }
      const data = await res.json();
      onUploaded(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <label className="admin-field">
      <span className="admin-field-label">{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={busy}
        className="admin-file-input"
      />
      {hint ? <span className="admin-field-hint">{hint}</span> : null}
      {busy ? <span className="admin-field-hint">Uploading…</span> : null}
      {error ? <span className="admin-field-error">{error}</span> : null}
    </label>
  );
}
