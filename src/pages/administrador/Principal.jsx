import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import './styles.css';
import ConsultarTramites from './tramites/ConsultarTramites';
import { useDispatch } from 'react-redux';
import { clearLogout } from '../../redux/authSlice';

const Principal = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null); 
  const userButtonRef = useRef(null);  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleDropdown = () => {
    setIsDropdownVisible(prev => !prev); 
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
  };

  const handleOptionConfig = (option) => {
    if (option === 'config') {
      navigate('./config');
    }
    setIsDropdownVisible(false);
  };

  const handleOptionLogout = (option) => {
    if (option === 'logout') {
      dispatch(clearLogout());
      navigate('/');
    }
    setIsDropdownVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !userButtonRef.current.contains(event.target) 
      ) {
        setIsDropdownVisible(false);
      }

      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !toggleButtonRef.current.contains(event.target)
      ) {
        setIsSidebarVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="main-container">
      {/* Sidebar */}
      {isSidebarVisible && (
        <div className="sidebar" ref={sidebarRef}>
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
      )}

      <div className={`content ${isSidebarVisible ? 'content-shifted' : ''}`}>
        {/* Navbar */}
        <div className="navbar">
          <div className="navbar-left">
            <div
              className="navbar-item"
              onClick={toggleSidebar}
              ref={toggleButtonRef}
            >
              <i className="pi pi-bars"></i>
            </div>
          </div>
          <div className="navbar-right">
            <div
              className="navbar-item"
              onClick={toggleDropdown}
              ref={userButtonRef} 
            >
              <i className="pi pi-user"></i>
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isDropdownVisible && (
          <div className="dropdown-menu" ref={dropdownRef}>
            <div className="dropdown-item" onClick={() => handleOptionConfig('config')}>
              <i className="pi pi-cog"></i> Configuración
            </div>
            <div className="dropdown-item" onClick={() => handleOptionConfig('cambCont')}>
              <i className="pi pi-lock"></i> Cambio de Contraseña
            </div>
            <div className="dropdown-item" onClick={() => handleOptionLogout('logout')}>
              <i className="pi pi-sign-out"></i> Cerrar Sesión
            </div>
          </div>
        )}

        {/* Contenido principal - muestra ConsultarTramites por defecto */}
        <div className="main-content">
          <Outlet />
          {window.location.pathname === '/administrador' && <ConsultarTramites />}
        </div>
      </div>
    </div>
  );
};

export default Principal;