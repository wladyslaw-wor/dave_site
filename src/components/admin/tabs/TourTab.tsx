"use client";

import type { TourDate } from "@/types";

export function TourTab({
  dates,
  showTour,
  onAddDate,
  onUpdateDate,
  onDeleteDate,
  onToggleTour,
}: {
  dates: TourDate[];
  showTour: boolean;
  onAddDate: () => void;
  onUpdateDate: (id: string, patch: Partial<TourDate>) => void;
  onDeleteDate: (id: string) => void;
  onToggleTour: () => void;
}) {
  return (
    <div className="admin-tab-content">
      <div className="admin-btn-row">
        <button type="button" className="admin-btn admin-btn-primary" onClick={onAddDate}>
          + add date
        </button>
        <button type="button" className="admin-btn" onClick={onToggleTour}>
          {showTour ? "Hide tour block" : "Show tour block"}
        </button>
      </div>
      {dates.map((d) => (
        <div className="admin-link-card" key={d.id}>
          <input
            className="admin-input"
            value={d.date}
            onChange={(e) => onUpdateDate(d.id, { date: e.target.value })}
            placeholder="Date"
          />
          <input
            className="admin-input"
            value={d.city}
            onChange={(e) => onUpdateDate(d.id, { city: e.target.value })}
            placeholder="City"
          />
          <input
            className="admin-input"
            value={d.venue}
            onChange={(e) => onUpdateDate(d.id, { venue: e.target.value })}
            placeholder="Venue"
          />
          <input
            className="admin-input"
            value={d.url}
            onChange={(e) => onUpdateDate(d.id, { url: e.target.value })}
            placeholder="Ticket URL"
          />
          <button
            type="button"
            className="admin-icon-btn"
            onClick={() => onDeleteDate(d.id)}
            aria-label="Delete date"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
