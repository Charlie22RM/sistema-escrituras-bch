import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/login/Login'; 
import AdminRoutes from './AdminRoutes';
import OperadorRoutes from './OperadorRoutes';
import ClienteRoutes from './ClienteRoutes';

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />

            {/* Rutas para Admin */}
            <Route path="/admininstrador/*" element={<AdminRoutes />} />

            {/* Rutas para Usuario Normal */}
            <Route path="/operador/*" element={<OperadorRoutes />} />

            {/* Rutas para Banco */}
            <Route path="/cliente/*" element={<ClienteRoutes />} />
        </Routes>
    );
};

export default AppRouter;
