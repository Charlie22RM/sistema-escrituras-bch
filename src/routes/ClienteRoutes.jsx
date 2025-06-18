import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ConsultarTramites from "../pages/cliente/tramites/ConsultarTramites";
import Principal from "../pages/administrador/Principal";
import ConsultarDocumentacion from "../pages/cliente/tramites/ConsultarDocumentacion";
import ConfiguracionService from "../services/ConfiguracionService";

const ClienteRoutes = () => {
  const configuracionService = ConfiguracionService();

  const [canViewDocuments, setCanViewDocuments] = useState(false);
  const [loading, setLoading] = useState(true); // nuevo estado

  useEffect(() => {
    const fetchConfiguracion = async () => {
      try {
        const response = await configuracionService.getAll();
        const configuraciones = response.data;

        configuraciones.forEach((config) => {
          if (config.codigo === "PERMITIR_VER_DOCUMENTOS") {
            setCanViewDocuments(config.valor === "true");
          }
        });
      } catch (error) {
        console.error("Error fetching configuration:", error);
      } finally {
        setLoading(false); // cuando termina, incluso si hay error
      }
    };

    fetchConfiguracion();
  }, []);

  if (loading) return <div>Cargando configuración...</div>; // o un spinner

  return (
    <Routes>
      <Route path="/" element={<Principal />}>
        <Route index element={<ConsultarTramites />} />
        {canViewDocuments && (
          <Route
            path="consultar-documentacion/:id"
            element={<ConsultarDocumentacion />}
          />
        )}
        <Route path="*" element={<Navigate to="/cliente/" replace />} />
      </Route>
    </Routes>
  );
};

export default ClienteRoutes;
