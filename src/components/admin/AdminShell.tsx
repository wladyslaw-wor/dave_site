"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Content, ContentPatch, FullState, Link, MenuItem, TourDate } from "@/types";
import { ContentTab } from "./tabs/ContentTab";
import { LinksTab } from "./tabs/LinksTab";
import { VisualTab } from "./tabs/VisualTab";
import { TourTab } from "./tabs/TourTab";
import { StatsTab } from "./tabs/StatsTab";
import { AlbumTab } from "./tabs/AlbumTab";
import { BlogTab } from "./tabs/BlogTab";
import { ArchiveTab } from "./tabs/ArchiveTab";
import { createAutosaveQueue, type SaveStatus } from "@/lib/autosave-queue";

const TABS = [
  { id: "content", label: "Content" },
  { id: "album", label: "The Album" },
  { id: "blog", label: "Blog" },
  { id: "archive", label: "Archive" },
  { id: "links", label: "Links" },
  { id: "visual", label: "Visual" },
  { id: "tour", label: "Tour" },
  { id: "stats", label: "Stats" },
] as const;

type TabId = (typeof TABS)[number]["id"];

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(typeof body.error === "string" ? body.error : `Request failed: ${res.status}`);
  }
  return res.json();
}

export function AdminShell({
  initialState,
  username,
  logoutAction,
}: {
  initialState: FullState;
  username: string;
  logoutAction: () => Promise<void>;
}) {
  const [content, setContent] = useState<Content>(initialState.content);
  const [links, setLinks] = useState<Link[]>(initialState.links);
  const [menu, setMenu] = useState<MenuItem[]>(initialState.menu);
  const [dates, setDates] = useState<TourDate[]>(initialState.dates);
  const [clicks, setClicks] = useState<Record<string, number>>(initialState.clicks);
  const [tab, setTab] = useState<TabId>("content");
  const [saveLabel, setSaveLabel] = useState("Local draft");
  const [busy, setBusy] = useState(false);

  const [linkSaveStatus, setLinkSaveStatus] = useState<SaveStatus>({ pending: false, error: "" });
  const [linkActionBusy, setLinkActionBusy] = useState(false);
  const [linkActionError, setLinkActionError] = useState("");
  const linkActionInFlight = useRef(false);
  const [linkSaves] = useState(() => createAutosaveQueue(
    (url, patch) => api(url, { method: "PATCH", body: JSON.stringify(patch) }),
    (status) => {
      setLinkSaveStatus(status);
      if (!status.pending && !status.error) setSaveLabel(`Saved ${new Date().toLocaleTimeString()}`);
    },
  ));

  useEffect(() => {
    if (!linkSaveStatus.pending && !linkActionBusy) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [linkSaveStatus.pending, linkActionBusy]);

  const flushLinks = useCallback(() => {
    void linkSaves.flush().catch(() => {});
  }, [linkSaves]);

  const runLinkAction = useCallback(async (action: () => Promise<void>) => {
    if (linkActionInFlight.current) return;
    linkActionInFlight.current = true;
    setLinkActionBusy(true);
    setLinkActionError("");
    try {
      await linkSaves.flush();
      await action();
      setSaveLabel(`Saved ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      setLinkActionError(error instanceof Error ? error.message : "Could not update links. Please retry.");
    } finally {
      linkActionInFlight.current = false;
      setLinkActionBusy(false);
    }
  }, [linkSaves]);

  const pendingPatch = useRef<ContentPatch>({});
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushPatch = useCallback(async () => {
    const patch = pendingPatch.current;
    pendingPatch.current = {};
    if (Object.keys(patch).length === 0) return;
    try {
      await api<Content>("/api/content", { method: "PUT", body: JSON.stringify(patch) });
      setSaveLabel(`Saved ${new Date().toLocaleTimeString()}`);
    } catch {
      setSaveLabel("Save failed — retry");
    }
  }, []);

  const patchContent = useCallback(
    (fields: ContentPatch, opts?: { immediate?: boolean }) => {
      setContent((prev) => ({ ...prev, ...fields }));
      pendingPatch.current = { ...pendingPatch.current, ...fields };
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (opts?.immediate) {
        flushPatch();
      } else {
        debounceTimer.current = setTimeout(flushPatch, 500);
      }
    },
    [flushPatch],
  );

  const addLink = useCallback(() => runLinkAction(async () => {
    const link = await api<Link>("/api/links", { method: "POST", body: JSON.stringify({}) });
    setLinks((prev) => [...prev, link]);
  }), [runLinkAction]);

  const updateLink = useCallback((id: string, patch: Partial<Link>) => {
    setLinks((prev) => prev.map((link) => link.id === id ? { ...link, ...patch } : link));
    linkSaves.enqueue(`/api/links/${id}`, patch);
  }, [linkSaves]);

  const deleteLink = useCallback((id: string) => runLinkAction(async () => {
    await api(`/api/links/${id}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((link) => link.id !== id));
  }), [runLinkAction]);

  const moveLink = useCallback((id: string, direction: 1 | -1) => runLinkAction(async () => {
    const updated = await api<Link[]>(`/api/links/${id}/move`, {
      method: "POST",
      body: JSON.stringify({ direction }),
    });
    const orders = new Map(updated.map((link) => [link.id, link.order]));
    // Reordering must not replace editable fields with a server snapshot.
    setLinks((prev) => prev.map((link) => ({ ...link, order: orders.get(link.id) ?? link.order }))
      .sort((a, b) => a.order - b.order));
  }), [runLinkAction]);

  const addMenuItem = useCallback(() => runLinkAction(async () => {
    const item = await api<MenuItem>("/api/menu", { method: "POST", body: JSON.stringify({}) });
    setMenu((prev) => [...prev, item]);
  }), [runLinkAction]);

  const updateMenuItem = useCallback((id: string, patch: Partial<MenuItem>) => {
    setMenu((prev) => prev.map((item) => item.id === id ? { ...item, ...patch } : item));
    linkSaves.enqueue(`/api/menu/${id}`, patch);
  }, [linkSaves]);

  const deleteMenuItem = useCallback((id: string) => runLinkAction(async () => {
    await api(`/api/menu/${id}`, { method: "DELETE" });
    setMenu((prev) => prev.filter((item) => item.id !== id));
  }), [runLinkAction]);

  const addDate = useCallback(async () => {
    const date = await api<TourDate>("/api/dates", { method: "POST", body: JSON.stringify({}) });
    setDates((prev) => [...prev, date]);
    setSaveLabel(`Saved ${new Date().toLocaleTimeString()}`);
  }, []);

  const updateDate = useCallback(async (id: string, patch: Partial<TourDate>) => {
    setDates((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    const date = await api<TourDate>(`/api/dates/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
    setDates((prev) => prev.map((d) => (d.id === id ? date : d)));
    setSaveLabel(`Saved ${new Date().toLocaleTimeString()}`);
  }, []);

  const deleteDate = useCallback(async (id: string) => {
    setDates((prev) => prev.filter((d) => d.id !== id));
    await api(`/api/dates/${id}`, { method: "DELETE" });
    setSaveLabel(`Saved ${new Date().toLocaleTimeString()}`);
  }, []);

  const exportJson = useCallback(() => {
    window.open("/api/export", "_blank");
  }, []);

  const resetAll = useCallback(async () => {
    if (!window.confirm("Reset all content, album, blog, archive, links, menu, dates and click counters to defaults?")) {
      return;
    }
    setBusy(true);
    try {
      await api("/api/reset", { method: "POST" });
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }, []);

  const stats = useMemo(() => {
    const counts = [
      { id: "release", label: `${content.releaseTitle} (featured)`, count: clicks.release ?? 0 },
      ...links.map((l) => ({ id: l.id, label: l.label, count: clicks[l.id] ?? 0 })),
    ];
    const max = Math.max(1, ...counts.map((c) => c.count));
    const total = counts.reduce((a, c) => a + c.count, 0);
    const top = counts.slice().sort((a, b) => b.count - a.count)[0];
    return { counts, max, total, topLabel: total ? top.label : "—" };
  }, [content.releaseTitle, clicks, links]);

  const resetStats = useCallback(async () => {
    await api("/api/reset-clicks", { method: "POST" });
    setClicks({});
  }, []);

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-title">
          <h1 className="admin-title">Site admin</h1>
          <span className="admin-save-label" role="status">{
            linkSaveStatus.error || linkActionError ? "Link changes need attention"
              : linkSaveStatus.pending || linkActionBusy ? "Saving links…" : saveLabel
          }</span>
        </div>
        <div className="admin-topbar-actions">
          <span className="admin-username">{username}</span>
          <form action={logoutAction}>
            <button type="submit" className="admin-btn">
              Log out
            </button>
          </form>
        </div>
      </header>

      <nav className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`admin-tab-btn${tab === t.id ? " is-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="admin-body">
        <div hidden={tab !== "blog"}>
          <BlogTab initialBlog={initialState.blog} />
        </div>
        <div hidden={tab !== "archive"}>
          <ArchiveTab initialArchive={initialState.archive} />
        </div>
        <div hidden={tab !== "album"}>
          <AlbumTab initialAlbum={initialState.album} />
        </div>
        {tab === "content" ? (
          <ContentTab content={content} onPatch={patchContent} />
        ) : null}
        {tab === "links" ? (
          <div className="admin-tab-content">
            <fieldset className="album-editor-fields" disabled={linkActionBusy} onBlur={flushLinks}>
              <LinksTab
                links={links}
                menu={menu}
                onAddLink={addLink}
                onUpdateLink={updateLink}
                onDeleteLink={deleteLink}
                onMoveLink={moveLink}
                onAddMenuItem={addMenuItem}
                onUpdateMenuItem={updateMenuItem}
                onDeleteMenuItem={deleteMenuItem}
              />
            </fieldset>
            {linkSaveStatus.error || linkActionError ? <div role="alert" className="admin-field-error">
              {linkSaveStatus.error || linkActionError}
              {linkSaveStatus.error ? <button type="button" className="admin-btn" onClick={() => { setLinkActionError(""); flushLinks(); }}>Retry saving</button> : null}
            </div> : null}
          </div>
        ) : null}
        {tab === "visual" ? <VisualTab content={content} onPatch={patchContent} /> : null}
        {tab === "tour" ? (
          <TourTab
            dates={dates}
            showTour={content.showTour}
            onAddDate={addDate}
            onUpdateDate={updateDate}
            onDeleteDate={deleteDate}
            onToggleTour={() => patchContent({ showTour: !content.showTour }, { immediate: true })}
          />
        ) : null}
        {tab === "stats" ? <StatsTab stats={stats} onReset={resetStats} /> : null}
      </main>

      <footer className="admin-footer">
        <button type="button" className="admin-btn" onClick={exportJson} disabled={linkSaveStatus.pending || linkActionBusy}>
          Export JSON
        </button>
        <button type="button" className="admin-btn admin-btn-danger" onClick={resetAll} disabled={busy || linkSaveStatus.pending || linkActionBusy}>
          Reset content
        </button>
      </footer>
    </div>
  );
}
