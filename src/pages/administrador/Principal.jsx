import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Outlet } from 'react-router-dom';
import { clearLogout } from '../../redux/authSlice';
import './styles.css';

const Principal = () => {
  // Estados para manejar visibilidad del dropdown y sidebar
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  // Refs para detectar clics fuera de los componentes
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const userButtonRef = useRef(null);

  const navigate = useNavigate(); // Hook para redirección
  const dispatch = useDispatch(); // Hook para acciones Redux

  // Alternar visibilidad del menú desplegable (dropdown)
  const toggleDropdown = () => {
    setIsDropdownVisible(prev => !prev);
  };

  // Alternar visibilidad del menú lateral (sidebar)
  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
  };

  // Manejar opción de configuración
  const handleOptionConfig = (option) => {
    if (option === 'config') {
      navigate('./config');
    }
    setIsDropdownVisible(false);
  };

  // Manejar opción de cambio de contraseña
  const handleOptionCambCont = (option) => {
    if (option === 'cambCont') {
      navigate('./cambio-contrasena');
    }
    setIsDropdownVisible(false);
  };

  // Manejar opción de cerrar sesión
  const handleOptionLogout = (option) => {
    if (option === 'logout') {
      dispatch(clearLogout()); // Limpia el estado de autenticación
      navigate('/'); // Redirige al login
    }
    setIsDropdownVisible(false);
  };

  // Efecto para cerrar el dropdown o sidebar si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Cierra el dropdown si se hace clic fuera de él
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !userButtonRef.current.contains(event.target)
      ) {
        setIsDropdownVisible(false);
      }

      // Cierra el sidebar si se hace clic fuera de él
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !toggleButtonRef.current.contains(event.target)
      ) {
        setIsSidebarVisible(false);
      }
    };

    // Agrega el evento al montar el componente
    document.addEventListener('mousedown', handleClickOutside);

    // Limpia el evento al desmontar
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="main-container">
      {/* Sidebar con navegación - visible solo si isSidebarVisible es true */}
      <div className={`sidebar ${isSidebarVisible ? 'sidebar-visible' : ''}`} ref={sidebarRef}>
        <div className="sidebar-item" onClick={() => navigate('/administrador')}>
          <i className="pi pi-clipboard"></i> Trámites
        </div>
        <div className="sidebar-item" onClick={() => navigate('./consultar-cliente')}>
          <i className="pi pi-building-columns"></i> Clientes
        </div>
        <div className="sidebar-item" onClick={() => navigate('./consultar-inmobiliaria')}>
          <i className="pi pi-building"></i> Inmobiliarias
        </div>
        <div className="sidebar-item" onClick={() => navigate('./consultar-canton')}>
          <i className="pi pi-map"></i> Cantones
        </div>
        <div className="sidebar-item" onClick={() => navigate('./consultar-ciudadela')}>
          <i className="pi pi-home"></i> Proyectos
        </div>
        <div className="sidebar-item" onClick={() => navigate('./consultar-usuario')}>
          <i className="pi pi-users"></i> Usuarios
        </div>
      </div>

      {/* Contenedor principal del contenido */}
      <div className={`content ${isSidebarVisible ? 'content-shifted' : ''}`}>
        {/* Navbar superior */}
        <div className="navbar">
          <div className="navbar-left">
            <div
              className="navbar-item"
              onClick={toggleSidebar}
              ref={toggleButtonRef}
            >
              <i className="pi pi-bars"></i> {/* Icono de menú */}
            </div>
          </div>
          <div className="navbar-right">
            <div
              className="navbar-item"
              onClick={toggleDropdown}
              ref={userButtonRef}
            >
              <i className="pi pi-user"></i> {/* Icono de usuario */}
            </div>
          </div>
        </div>

        {/* Menú desplegable del usuario (Configuración, Cambio de contraseña, Logout) */}
        {isDropdownVisible && (
          <div className="dropdown-menu" ref={dropdownRef}>
            <div className="dropdown-item" onClick={() => handleOptionConfig('config')}>
              <i className="pi pi-cog"></i> Configuración
            </div>
            <div className="dropdown-item" onClick={() => handleOptionCambCont('cambCont')}>
              <i className="pi pi-lock"></i> Cambio de Contraseña
            </div>
            <div className="dropdown-item" onClick={() => handleOptionLogout('logout')}>
              <i className="pi pi-sign-out"></i> Cerrar Sesión
            </div>
          </div>
        )}

        {/* Aquí se renderiza el contenido hijo usando Outlet de React Router */}
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Principal;
