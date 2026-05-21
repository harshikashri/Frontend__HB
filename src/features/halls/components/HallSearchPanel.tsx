import { useState } from "react";
import type { FormEvent } from "react";

import type { Facility } from "../../facilities/services/facilityTypes";
import type { Hall, HallSearchFilters } from "../services/hallTypes";

type HallSearchPanelProps = {
  halls: Hall[];
  facilities: Facility[];
  isSearching: boolean;
  isActive: boolean;
  onSearch: (filters: HallSearchFilters, refinements: HallSearchRefinements) => Promise<void>;
  onClear: () => void;
};

export type HallSearchRefinements = {
  query: string;
  minCapacity: number | null;
};

export function HallSearchPanel({
  halls,
  facilities,
  isSearching,
  isActive,
  onSearch,
  onClear,
}: HallSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [hallId, setHallId] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [minCapacity, setMinCapacity] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const selectedHall = halls.find((hall) => hall.id === hallId);

    await onSearch(
      {
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        ...(selectedHall ? { hall_id: selectedHall.id } : {}),
        ...(facilityName ? { facility_name: facilityName } : {}),
      },
      {
        query: query.trim(),
        minCapacity: minCapacity ? Number(minCapacity) : null,
      },
    );
  }

  function handleClear() {
    setQuery("");
    setHallId("");
    setFacilityName("");
    setMinCapacity("");
    setStartDateTime("");
    setEndDateTime("");
    onClear();
  }

  return (
    <section className="search-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Search and filter</p>
          <h2>Find an available hall</h2>
        </div>
        {isActive ? <span className="status-pill active">Filtered</span> : null}
      </div>

      <form className="search-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <label htmlFor="hall-search-start">Start date and time</label>
            <input
              id="hall-search-start"
              type="datetime-local"
              value={startDateTime}
              onChange={(event) => setStartDateTime(event.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="hall-search-end">End date and time</label>
            <input
              id="hall-search-end"
              type="datetime-local"
              value={endDateTime}
              onChange={(event) => setEndDateTime(event.target.value)}
              required
            />
          </div>
        </div>

        <div className="search-filter-grid">
          <div>
            <label htmlFor="hall-search-query">Search halls</label>
            <input
              id="hall-search-query"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Hall name"
            />
          </div>
          <div>
            <label htmlFor="hall-search-hall">Hall</label>
            <select
              id="hall-search-hall"
              value={hallId}
              onChange={(event) => setHallId(event.target.value)}
            >
              <option value="">Any hall</option>
              {halls.map((hall) => (
                <option key={hall.id} value={hall.id}>
                  {hall.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="hall-search-capacity">Minimum capacity</label>
            <input
              id="hall-search-capacity"
              min="1"
              type="number"
              value={minCapacity}
              onChange={(event) => setMinCapacity(event.target.value)}
              placeholder="Seats"
            />
          </div>
          <div>
            <label htmlFor="hall-search-facility">Facility</label>
            <select
              id="hall-search-facility"
              value={facilityName}
              onChange={(event) => setFacilityName(event.target.value)}
            >
              <option value="">Any facility</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.name}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="search-actions">
          <button className="button button-primary" type="submit" disabled={isSearching}>
            {isSearching ? "Searching..." : "Search availability"}
          </button>
          <button className="button button-secondary" type="button" onClick={handleClear}>
            Clear
          </button>
        </div>
      </form>
    </section>
  );
}
