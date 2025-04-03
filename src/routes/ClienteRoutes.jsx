import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ConsultarTramites from '../pages/cliente/ConsultarTramites';
import { Navigate } from 'react-router-dom';

const ClienteRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ConsultarTramites />} />
            <Route path="*" element={<Navigate to="/cliente/" replace />} />
        </Routes>
    );
};

export default ClienteRoutes;
