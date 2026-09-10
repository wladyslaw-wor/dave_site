import { TrackedLink } from "./TrackedLink";
import type { TourDate } from "@/types";

export function TourDates({ dates }: { dates: TourDate[] }) {
  if (dates.length === 0) return null;

  return (
    <div>
      <div className="tour-label">Live dates</div>
      {dates.map((d) => (
        <div className="tour-row" key={d.id}>
          <span className="tour-date">{d.date}</span>
          <span className="tour-city">{d.city}</span>
          <span className="tour-venue">{d.venue}</span>
          <TrackedLink trackId={d.id} href={d.url} target="_blank" rel="noreferrer" className="tour-ticket">
            Tickets
          </TrackedLink>
        </div>
      ))}
    </div>
  );
}
