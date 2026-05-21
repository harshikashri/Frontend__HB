import { Outlet } from "react-router-dom";

import { useAuth } from "../../../features/auth/hooks/useAuth";

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Hall Booking Management</p>
          <h1>{user?.role === "admin" ? "Admin Workspace" : "User Workspace"}</h1>
        </div>
        <div className="topbar-actions">
          <span className="role-pill">{user?.role ?? "user"}</span>
          <button className="button button-secondary" type="button" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>
      <main className="workspace">
        <Outlet />
      </main>
    </div>
  );
}
