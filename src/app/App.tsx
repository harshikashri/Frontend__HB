import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/layout/AppLayout";
import { AdminRoute } from "./routes/AdminRoute";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { UserRoute } from "./routes/UserRoute";
import { LoginPage } from "../features/auth/components/LoginPage";
import { RegisterPage } from "../features/auth/components/RegisterPage";
import { AdminBookingsPage } from "../features/bookings/components/AdminBookingsPage";
import { UserBookingsPage } from "../features/bookings/components/UserBookingsPage";
import { FacilitiesPage } from "../features/facilities/components/FacilitiesPage";
import { HallsPage } from "../features/halls/components/HallsPage";
import { UserHallDetailPage } from "../features/halls/components/UserHallDetailPage";

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
          path="halls/:hallName"
          element={
            <UserRoute>
              <UserHallDetailPage />
            </UserRoute>
          }
        />
        <Route
          path="bookings"
          element={
            <UserRoute>
              <UserBookingsPage />
              
            </UserRoute>
          }
        />
        <Route
          path="admin/bookings"
          element={
            <AdminRoute>
              <AdminBookingsPage />
            </AdminRoute>
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
