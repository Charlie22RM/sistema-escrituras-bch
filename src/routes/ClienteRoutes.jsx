import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ConsultarTramites from '../pages/cliente/ConsultarTramites';

const ClienteRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ConsultarTramites />} />
        </Routes>
    );
};

export default ClienteRoutes;
