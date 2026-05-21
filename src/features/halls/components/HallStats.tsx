type HallStatsProps = {
  total: number;
  active: number;
  disabled: number;
  isAdmin: boolean;
};

export function HallStats({ total, active, disabled, isAdmin }: HallStatsProps) {
  return (
    <section className="stats-grid" aria-label="Hall summary">
      <div className="stat-card">
        <span>Total halls</span>
        <strong>{total}</strong>
      </div>
      {isAdmin ? (
        <>
          <div className="stat-card">
            <span>Active</span>
            <strong>{active}</strong>
          </div>
          <div className="stat-card">
            <span>Disabled</span>
            <strong>{disabled}</strong>
          </div>
        </>
      ) : null}
    </section>
  );
}
