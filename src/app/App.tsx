import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/layout/AppLayout";
import { AdminRoute } from "./routes/AdminRoute";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { UserRoute } from "./routes/UserRoute";
import { LoginPage } from "../features/auth/components/LoginPage";
import { RegisterPage } from "../features/auth/components/RegisterPage";
import { FacilitiesPage } from "../features/facilities/components/FacilitiesPage";
import { FavoritesPage } from "../features/favorites/components/FavoritesPage";
import { HallsPage } from "../features/halls/components/HallsPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/halls" replace />} />
        <Route path="halls" element={<HallsPage />} />
        <Route
          path="favorites"
          element={
            <UserRoute>
              <FavoritesPage />
            </UserRoute>
          }
        />
        <Route
          path="facilities"
          element={
            <AdminRoute>
              <FacilitiesPage />
            </AdminRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
