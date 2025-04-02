// AppRouter.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/login/Login";
import AdminRoutes from "./AdminRoutes";
import OperadorRoutes from "./OperadorRoutes";
import ClienteRoutes from "./ClienteRoutes";
import ProtectedRoute from "./ProtectedRoute";
import LoginRedirect from "./LoginRedirect";


const AppRouter = () => {
  return (
    <Routes>
      {/* Ruta pública (login) con redirección automática */}
      <Route path="/" element={<LoginRedirect />} />

      {/* Rutas protegidas por rol */}
      <Route element={<ProtectedRoute allowedRoles={[1]} />}>
        <Route path="/administrador/*" element={<AdminRoutes />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[2]} />}>
        <Route path="/operador/*" element={<OperadorRoutes />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[3]} />}>
        <Route path="/cliente/*" element={<ClienteRoutes />} />
      </Route>

      {/* Ruta por defecto si no coincide (opcional) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
