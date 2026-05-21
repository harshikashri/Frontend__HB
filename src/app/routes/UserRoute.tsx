import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "../../features/auth/hooks/useAuth";

type UserRouteProps = {
  children: ReactNode;
};

export function UserRoute({ children }: UserRouteProps) {
  const { user } = useAuth();

  if (user?.role !== "user") {
    return <Navigate to="/halls" replace />;
  }

  return children;
}
