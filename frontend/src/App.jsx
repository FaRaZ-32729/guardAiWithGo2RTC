import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

import Login from "./pages/login";
import Home from "./pages/home";
import Cameras from "./pages/camera";
import Students from "./pages/students";
import Violations from "./pages/violations";
import PageNotFound from "./pages/PageNotFound";
import AppLayout from "./layout/AppLayout";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user } = useAuth  ();
  return (
    <Routes>

      {/* Public Route */}
      <Route
        path="/login"
        element={
          user
            ? <Navigate to="/home" replace />
            : <Login />
        }
      />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>

        {/* Admin Only */}
        <Route element={<AdminRoute />}>

          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="cameras" element={<Cameras />} />
            <Route path="students" element={<Students />} />
            <Route path="violations" element={<Violations />} />
          </Route>

        </Route>

      </Route>


      {/* 404 */}
      <Route path="*" element={<PageNotFound />} />

    </Routes>
  );
}