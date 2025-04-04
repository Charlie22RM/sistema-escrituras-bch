import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, redirectTo = "/" }) => {
  const { token, perfilId } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!token) {
    console.log("No hay token, redirigiendo a login");
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(Number(perfilId))) {
    const perfil_id = parseInt(perfilId, 10);
    const defaultRoute = getDefaultRoute(perfil_id);
    console.log(`Rol no permitido. Redirigiendo a ${defaultRoute}`);
    return <Navigate to={defaultRoute} replace />;
  }

  console.log("Acceso permitido");
  return <Outlet />;
};

// Función auxiliar para redirigir a la ruta por defecto según el rol
const getDefaultRoute = (perfilId) => {
  switch (perfilId) {
    case 1: // Admin
      return "/administrador/";
    case 2: // Operador
      return "/operador/";
    case 3: // Cliente
      return "/cliente/";
    default:
      return "/";
  }
};

export default ProtectedRoute;
