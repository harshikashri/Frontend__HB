import { useAuth } from "../hooks/useAuth";

export function RoleHomePage() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return (
      <section className="home-panel">
        <p className="eyebrow">Signed in as {user.username}</p>
        <h2>Admin dashboard</h2>
        <p>
          Authentication is connected. Admin hall and booking controls can be added here
          against the booking service.
        </p>
      </section>
    );
  }

  return (
    <section className="home-panel">
      <p className="eyebrow">Signed in as {user?.username}</p>
      <h2>User dashboard</h2>
      <p>
        Authentication is connected. User hall discovery and booking flows can be added
        here against the booking service.
      </p>
    </section>
  );
}
