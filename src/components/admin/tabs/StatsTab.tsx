"use client";

type StatEntry = { id: string; label: string; count: number };

export function StatsTab({
  stats,
  onReset,
}: {
  stats: { counts: StatEntry[]; max: number; total: number; topLabel: string };
  onReset: () => void;
}) {
  return (
    <div className="admin-tab-content">
      <div className="admin-stat-cards">
        <div className="admin-stat-card">
          <span className="admin-field-label">Total clicks</span>
          <span className="admin-stat-value">{stats.total}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-field-label">Top link</span>
          <span className="admin-stat-value admin-stat-value-sm">{stats.topLabel}</span>
        </div>
      </div>

      <div className="admin-bar-list">
        {stats.counts.map((c) => (
          <div className="admin-bar-row" key={c.id}>
            <span className="admin-bar-label">{c.label}</span>
            <div className="admin-bar-track">
              <div
                className="admin-bar-fill"
                style={{ width: `${Math.round((c.count / stats.max) * 100)}%` }}
              />
            </div>
            <span className="admin-bar-count">{c.count}</span>
          </div>
        ))}
      </div>

      <button type="button" className="admin-btn" onClick={onReset}>
        Reset counters
      </button>
    </div>
  );
}
