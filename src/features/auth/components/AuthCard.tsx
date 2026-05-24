import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <main className="auth-page">
      <section className="auth-panel" aria-label={title}>
        <div className="auth-copy">
          <p className="eyebrow">Hall Booking Management</p>
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <div className="auth-card">{children}</div>
      </section>
    </main>
  );
}
