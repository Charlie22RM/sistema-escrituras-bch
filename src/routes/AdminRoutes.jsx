import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Principal from '../pages/administrador/Principal';
import ConsultarUsuarios from '../pages/administrador/usuarios/ConsultarUsuarios';
import CrearUsuarios from '../pages/administrador/usuarios/CrearUsuarios';
import EditarUsuarios from '../pages/administrador/usuarios/EditarUsuarios';
import ConsultarClientes from '../pages/administrador/clientes/ConsultarClientes';
import CrearClientes from '../pages/administrador/clientes/CrearClientes';
import EditarClientes from '../pages/administrador/clientes/EditarClientes';
import ConsultarCantones from '../pages/administrador/cantones/ConsultarCantones';
import CrearCantones from '../pages/administrador/cantones/CrearCantones';
import EditarCantones from '../pages/administrador/cantones/EditarCantones';
import ConsultarInmobiliarias from '../pages/administrador/inmobiliarias/ConsultarInmobiliarias';
import CrearInmobiliarias from '../pages/administrador/inmobiliarias/CrearInmobiliarias';
import EditarInmobiliarias from '../pages/administrador/inmobiliarias/EditarInmobiliarias';
import ConsultarCiudadelas from '../pages/administrador/ciudadelas/ConsultarCiudadelas';
import CrearCiudadelas from '../pages/administrador/ciudadelas/CrearCiudadelas';
import EditarCiudadelas from '../pages/administrador/ciudadelas/EditarCiudadelas';
import ConsultarTramites from '../pages/administrador/tramites/ConsultarTramites';
import CrearTramites from '../pages/administrador/tramites/CrearTramites';
import EditarTramites from '../pages/administrador/tramites/EditarTramites';
import Parametros from '../pages/administrador/Parametros';
import CambioContrasena from '../components/CambioContrasena';
import { Navigate } from 'react-router-dom';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Principal />}>
                <Route index element={<ConsultarTramites />} />
                <Route path="consultar-usuario" element={<ConsultarUsuarios />} />
                <Route path="crear-usuario" element={<CrearUsuarios />} />
                <Route path="editar-usuario" element={<EditarUsuarios />} />
                <Route path="consultar-cliente" element={<ConsultarClientes />} />
                <Route path="crear-cliente" element={<CrearClientes />} />
                <Route path="editar-cliente/:id" element={<EditarClientes />} />
                <Route path="consultar-canton" element={<ConsultarCantones />} />
                <Route path="crear-canton" element={<CrearCantones />} />
                <Route path="editar-canton" element={<EditarCantones />} />
                <Route path="consultar-inmobiliaria" element={<ConsultarInmobiliarias />} />
                <Route path="crear-inmobiliaria" element={<CrearInmobiliarias />} />
                <Route path="editar-inmobiliaria" element={<EditarInmobiliarias />} />
                <Route path="consultar-ciudadela" element={<ConsultarCiudadelas />} />
                <Route path="crear-ciudadela" element={<CrearCiudadelas />} />
                <Route path="editar-ciudadela" element={<EditarCiudadelas />} />
                <Route path="crear-tramite" element={<CrearTramites />} />
                <Route path="editar-tramite" element={<EditarTramites />} />
                <Route path="config" element={<Parametros />} />
                <Route path="cambio-contrasena" element={<CambioContrasena />} />
                <Route path="*" element={<Navigate to="/administrador/" replace />} />
            </Route>
        </Routes>
    );
};

export default AdminRoutes;
