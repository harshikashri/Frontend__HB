import type { Hall } from "../../halls/services/hallTypes";

type HallFacilityMatrixProps = {
  halls: Hall[];
  mutatingKey: string | null;
  onToggle: (hallName: string, facilityName: string, isActive: boolean) => void;
};

export function HallFacilityMatrix({ halls, mutatingKey, onToggle }: HallFacilityMatrixProps) {
  return (
    <section className="facility-matrix">
      {halls.map((hall) => (
        <article className={`hall-card ${hall.is_active ? "" : "hall-card-disabled"}`} key={hall.id}>
          <div className="hall-card-header">
            <div>
              <span className={`status-dot ${hall.is_active ? "status-active" : "status-disabled"}`} />
              <h3>{hall.name}</h3>
            </div>
            <span className={`status-pill ${hall.is_active ? "active" : "disabled"}`}>
              {hall.is_active ? "Active hall" : "Disabled hall"}
            </span>
          </div>

          {hall.facilities.length > 0 ? (
            <div className="facility-control-list">
              {hall.facilities.map(({ facility, is_active }) => {
                const key = `${hall.name}-${facility.name}`;

                return (
                  <div className="facility-control-row" key={key}>
                    <div>
                      <strong>{facility.name}</strong>
                      <span>{is_active ? "Available for this hall" : "Temporarily disabled"}</span>
                    </div>
                    <button
                      className={is_active ? "button button-danger" : "button button-primary"}
                      type="button"
                      disabled={mutatingKey === key}
                      onClick={() => onToggle(hall.name, facility.name, !is_active)}
                    >
                      {is_active ? "Disable" : "Enable"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="muted-text">No facilities attached.</p>
          )}
        </article>
      ))}
    </section>
  );
}
