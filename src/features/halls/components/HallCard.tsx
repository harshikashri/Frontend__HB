import type { Hall, HallTimeSlot } from "../services/hallTypes";

type HallCardProps = {
  hall: Hall;
  isAdmin: boolean;
  isMutating: boolean;
  isFavorite?: boolean;
  onEdit: (hall: Hall) => void;
  onToggleStatus: (hall: Hall) => void;
  onAddFavorite?: (hall: Hall) => void;
  onRemoveFavorite?: (hall: Hall) => void;
  onSelect?: (hall: Hall) => void;
  isSelected?: boolean;
  availableSlots?: HallTimeSlot[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function HallCard({
  hall,
  isAdmin,
  isMutating,
  isFavorite = false,
  onEdit,
  onToggleStatus,
  onAddFavorite,
  onRemoveFavorite,
  onSelect,
  isSelected = false,
  availableSlots,
}: HallCardProps) {
  const visibleFacilities = isAdmin
    ? hall.facilities
    : hall.facilities.filter((facility) => facility.is_active);
  const activeFacilityCount = hall.facilities.filter((facility) => facility.is_active).length;

  return (
    <article
      className={`hall-card ${!isAdmin ? "hall-card-clickable" : ""} ${hall.is_active ? "" : "hall-card-disabled"} ${isSelected ? "hall-card-selected" : ""}`}
      role={!isAdmin ? "button" : undefined}
      tabIndex={!isAdmin ? 0 : undefined}
      onClick={!isAdmin ? () => onSelect?.(hall) : undefined}
      onKeyDown={
        !isAdmin
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect?.(hall);
              }
            }
          : undefined
      }
    >
      <div className="hall-card-header">
        <div>
          {isAdmin ? <span className={`status-dot ${hall.is_active ? "status-active" : "status-disabled"}`} /> : null}
          <h3>{hall.name}</h3>
        </div>
        {isAdmin ? (
          <span className={`status-pill ${hall.is_active ? "active" : "disabled"}`}>
            {hall.is_active ? "Active" : "Disabled"}
          </span>
        ) : null}
      </div>

      <dl className="hall-facts">
        <div>
          <dt>Floor</dt>
          <dd>{hall.floor}</dd>
        </div>
        <div>
          <dt>Capacity</dt>
          <dd>{hall.capacity}</dd>
        </div>
        <div>
          <dt>Facilities</dt>
          <dd>{isAdmin ? hall.facilities.length : activeFacilityCount}</dd>
        </div>
      </dl>

      {visibleFacilities.length > 0 ? (
        <div className="facility-list">
          {visibleFacilities.map(({ facility, is_active }) => (
            <span className={is_active ? "" : "facility-disabled"} key={facility.id}>
              {facility.name}
            </span>
          ))}
        </div>
      ) : null}

      {availableSlots ? (
        <div className="hall-availability-preview">
          <span>{availableSlots.length} available slot{availableSlots.length === 1 ? "" : "s"}</span>
          {availableSlots.length > 0 ? (
            <strong>
              {formatDate(availableSlots[0].start_time)} - {formatDate(availableSlots[0].end_time)}
            </strong>
          ) : (
            <strong>No open time in this window</strong>
          )}
        </div>
      ) : null}

      {isAdmin ? (
        <>
          <p className="timestamp">Updated {formatDate(hall.updated_at)}</p>
          <div className="hall-actions">
            <button className="button button-secondary" type="button" onClick={() => onEdit(hall)}>
              Edit
            </button>
            <button
              className={hall.is_active ? "button button-danger" : "button button-primary"}
              type="button"
              disabled={isMutating}
              onClick={() => onToggleStatus(hall)}
            >
              {hall.is_active ? "Disable" : "Enable"}
            </button>
          </div>
        </>
      ) : (
        <div className="hall-actions">
          <button
            aria-label={isFavorite ? `Remove ${hall.name} from favorites` : `Add ${hall.name} to favorites`}
            className={`favorite-star-button ${isFavorite ? "favorite-star-active" : ""}`}
            title={isFavorite ? "Remove favorite" : "Add favorite"}
            type="button"
            disabled={isMutating}
            onClick={(event) => {
              event.stopPropagation();
              if (isFavorite) {
                onRemoveFavorite?.(hall);
                return;
              }

              onAddFavorite?.(hall);
            }}
          >
            {isFavorite ? "★" : "☆"}
          </button>
        </div>
      )}
    </article>
  );
}
