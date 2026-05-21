import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "../../features/auth/hooks/useAuth";

type AdminRouteProps = {
  children: ReactNode;
};

export function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <Navigate to="/halls" replace />;
  }

  return children;
}
