"use client";

import type { Link, MenuItem } from "@/types";

export function LinksTab({
  links,
  menu,
  onAddLink,
  onUpdateLink,
  onDeleteLink,
  onMoveLink,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
}: {
  links: Link[];
  menu: MenuItem[];
  onAddLink: () => void;
  onUpdateLink: (id: string, patch: Partial<Link>) => void;
  onDeleteLink: (id: string) => void;
  onMoveLink: (id: string, direction: 1 | -1) => void;
  onAddMenuItem: () => void;
  onUpdateMenuItem: (id: string, patch: Partial<MenuItem>) => void;
  onDeleteMenuItem: (id: string) => void;
}) {
  return (
    <div className="admin-tab-content">
      <section className="admin-group">
        <h3 className="admin-group-title">Burger menu</h3>
        {menu.map((item) => (
          <div className="admin-row" key={item.id}>
            <input
              className="admin-input"
              value={item.label}
              onChange={(e) => onUpdateMenuItem(item.id, { label: e.target.value })}
              placeholder="Label"
            />
            <input
              className="admin-input"
              value={item.url}
              onChange={(e) => onUpdateMenuItem(item.id, { url: e.target.value })}
              placeholder="https://… or /blog"
              aria-label="URL"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              type="button"
              className="admin-icon-btn"
              onClick={() => onDeleteMenuItem(item.id)}
              aria-label="Delete menu item"
            >
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="admin-btn" onClick={onAddMenuItem}>
          + menu item
        </button>
      </section>

      <section className="admin-group">
        <div className="admin-group-header">
          <h3 className="admin-group-title">Link list</h3>
          <button type="button" className="admin-btn admin-btn-primary" onClick={onAddLink}>
            + add link
          </button>
        </div>
        {links.map((link, i) => (
          <div className="admin-link-card" key={link.id}>
            <input
              className="admin-input"
              value={link.label}
              onChange={(e) => onUpdateLink(link.id, { label: e.target.value })}
              placeholder="Label"
            />
            <input
              className="admin-input"
              value={link.url}
              onChange={(e) => onUpdateLink(link.id, { url: e.target.value })}
              placeholder="https://… or /blog"
              aria-label="URL"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <input
              className="admin-input"
              value={link.tag}
              onChange={(e) => onUpdateLink(link.id, { tag: e.target.value })}
              placeholder="Tag"
            />
            <div className="admin-link-controls">
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => onMoveLink(link.id, -1)}
                disabled={i === 0}
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => onMoveLink(link.id, 1)}
                disabled={i === links.length - 1}
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => onDeleteLink(link.id)}
                aria-label="Delete link"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
