import React,{useRef} from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { Toast } from "primereact/toast";


const ProtectedRoute = ({ allowedRoles, redirectTo = "/" }) => {
  const { token, perfilId } = useSelector((state) => state.auth);
  const toast = useRef(null);
  const location = useLocation();
  const dispatch = useDispatch();

  const verifyToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      const isValid = decoded.exp > Date.now() / 1000;
      console.log("Token válido hasta:", new Date(decoded.exp * 1000));
      return isValid;
    } catch (error) {
      console.error("Error decodificando token:", error);
      return false;
    }
  };

  if (!token) {
    console.log("No hay token, redirigiendo a login");
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
/*
  if (!verifyToken(token)) {
    console.log("Token inválido o expirado, redirigiendo a login");
    dispatch(logout());
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
*/

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
