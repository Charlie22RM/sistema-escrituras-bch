import React from "react";
import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import ConsultarTramites from "../pages/administrador/tramites/ConsultarTramites";
import CrearTramites from "../pages/administrador/tramites/CrearTramites";
import EditarTramites from "../pages/administrador/tramites/EditarTramites";
import Principal from "../pages/administrador/Principal";
import CambioContrasena from '../components/CambioContrasena';

const OperadorRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Principal />}>
        <Route index element={<ConsultarTramites />} />
        <Route path="crear-tramite" element={<CrearTramites />} />
        <Route path="editar-tramite/:id" element={<EditarTramites />} />
        <Route path="cambio-contrasena" element={<CambioContrasena />} />
        <Route path="*" element={<Navigate to="/operador/" replace />} />
      </Route>
    </Routes>
  );
};

export default OperadorRoutes;
