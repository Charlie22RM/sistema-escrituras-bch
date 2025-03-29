import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ConsultarTramites from '../pages/operador/ConsultarTramites';
import CrearTramites from '../pages/operador/CrearTramites';
import EditarTramites from '../pages/operador/EditarTramites';

const OperadorRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ConsultarTramites />} />
            <Route path="crear-tramite" element={<CrearTramites />} />
            <Route path="editar-tramite" element={<EditarTramites />} />
        </Routes>
    );
};

export default OperadorRoutes;
