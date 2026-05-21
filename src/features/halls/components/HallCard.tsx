import type { Hall } from "../services/hallTypes";

type HallCardProps = {
  hall: Hall;
  isAdmin: boolean;
  isMutating: boolean;
  isFavorite?: boolean;
  onEdit: (hall: Hall) => void;
  onToggleStatus: (hall: Hall) => void;
  onAddFavorite?: (hall: Hall) => void;
  onRemoveFavorite?: (hall: Hall) => void;
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
}: HallCardProps) {
  const visibleFacilities = isAdmin
    ? hall.facilities
    : hall.facilities.filter((facility) => facility.is_active);
  const activeFacilityCount = hall.facilities.filter((facility) => facility.is_active).length;

  return (
    <article className={`hall-card ${hall.is_active ? "" : "hall-card-disabled"}`}>
      <div className="hall-card-header">
        <div>
          <span className={`status-dot ${hall.is_active ? "status-active" : "status-disabled"}`} />
          <h3>{hall.name}</h3>
        </div>
        <span className={`status-pill ${hall.is_active ? "active" : "disabled"}`}>
          {hall.is_active ? "Active" : "Disabled"}
        </span>
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
            className={isFavorite ? "button button-danger" : "button button-primary"}
            type="button"
            disabled={isMutating}
            onClick={() => (isFavorite ? onRemoveFavorite?.(hall) : onAddFavorite?.(hall))}
          >
            {isFavorite ? "Remove favorite" : "Add favorite"}
          </button>
        </div>
      )}
    </article>
  );
}
