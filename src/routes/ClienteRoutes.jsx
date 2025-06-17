import React from "react";
import { Routes, Route } from "react-router-dom";
import ConsultarTramites from "../pages/cliente/tramites/ConsultarTramites";
import { Navigate } from "react-router-dom";
import Principal from "../pages/administrador/Principal";
import ConsultarDocumentacion from "../pages/cliente/tramites/ConsultarDocumentacion";

const ClienteRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Principal />}>
        <Route index element={<ConsultarTramites />} />
        <Route path="consultar-documentacion/:id" element={<ConsultarDocumentacion />} />
        <Route path="*" element={<Navigate to="/cliente/" replace />} />
      </Route>
    </Routes>
  );
};

export default ClienteRoutes;
