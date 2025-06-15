import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Outlet } from "react-router-dom";
import { clearLogout } from "../../redux/authSlice";
import "./styles.css";

import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";

const Principal = () => {
  const { perfilId } = useSelector((state) => state.auth);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true); // Sidebar visible por defecto

  // Refs
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const userButtonRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handlers
  const toggleDropdown = () => setIsDropdownVisible((prev) => !prev);
  const toggleSidebar = () => setIsSidebarVisible((prev) => !prev);

  const handleNavigation = (path) => {
    navigate(path);
    setIsDropdownVisible(false);
  };

  const handleLogout = () => {
    dispatch(clearLogout());
    navigate("/");
  };

  // Effect para cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (
          userButtonRef.current &&
          !userButtonRef.current.contains(event.target)
        ) {
          setIsDropdownVisible(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="principal-container">
      {/* Sidebar */}
      <div
        className={`principal-sidebar ${isSidebarVisible ? "visible" : ""}`}
        ref={sidebarRef}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <i className="pi pi-building" style={{ fontSize: "1.5rem" }} />
            <span>BCHASESORES</span>
          </div>
          <Button
            icon="pi pi-times"
            className="sidebar-close-btn p-button-text p-button-rounded"
            onClick={toggleSidebar}
          />
        </div>

        <div className="sidebar-menu">
          <div
            className="menu-item"
            onClick={() => handleNavigation("/administrador")}
          >
            <i className="pi pi-clipboard"></i>
            <span>Trámites</span>
          </div>
          {perfilId == 1 && (
            <>
              <div
                className="menu-item"
                onClick={() => handleNavigation("./consultar-cliente")}
              >
                <i className="pi pi-building-columns"></i>
                <span>Clientes</span>
              </div>
              <div
                className="menu-item"
                onClick={() => handleNavigation("./consultar-inmobiliaria")}
              >
                <i className="pi pi-building"></i>
                <span>Inmobiliarias</span>
              </div>
              <div
                className="menu-item"
                onClick={() => handleNavigation("./consultar-canton")}
              >
                <i className="pi pi-map"></i>
                <span>Cantones</span>
              </div>
              <div
                className="menu-item"
                onClick={() => handleNavigation("./consultar-proyecto")}
              >
                <i className="pi pi-home"></i>
                <span>Proyectos</span>
              </div>
              <div
                className="menu-item"
                onClick={() => handleNavigation("./consultar-usuario")}
              >
                <i className="pi pi-users"></i>
                <span>Usuarios</span>
              </div>
            </>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <Avatar
              icon="pi pi-user"
              shape="circle"
              size="large"
              className="bg-indigo-500 text-black"
            />
            <div className="user-details">
              <span className="username">Usuario</span>
              <span className="user-role">Administrador</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`principal-content ${isSidebarVisible ? "" : "full-width"}`}
      >
        {/* Navbar */}
        <div className="principal-navbar">
          <div className="navbar-left">
            <Button
              icon={isSidebarVisible ? "pi pi-bars" : "pi pi-align-justify"}
              className="p-button-text p-button-rounded sidebar-toggle"
              onClick={toggleSidebar}
              ref={toggleButtonRef}
            />
            <div className="navbar-title">Sistema de Escrituras</div>
          </div>

          <div className="navbar-right">
            <div className="user-menu" ref={userButtonRef}>
              <Button
                icon="pi pi-user"
                className="p-button-rounded user-btn"
                onClick={toggleDropdown}
                aria-haspopup="true"
                aria-expanded={isDropdownVisible}
                aria-label="Menú de usuario"
              />
              {isDropdownVisible && (
                <div className="user-dropdown" ref={dropdownRef}>
                  {/* <div className="dropdown-header">
                    <Avatar icon="pi pi-user" shape="circle" size="xlarge" className="bg-indigo-100 text-indigo-600" />
                    <div className="user-info">
                      <span className="username">Usuario Administrador</span>
                      <span className="user-email">admin@bchasesores.com</span>
                    </div>
                  </div> */}

                  <div className="dropdown-body">
                    <button
                      className="dropdown-item"
                      onClick={() => handleNavigation("./config")}
                      aria-label="Configuración"
                    >
                      <i className="pi pi-cog"></i>
                      <span>Configuración</span>
                      <i className="pi pi-chevron-right dropdown-arrow"></i>
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => handleNavigation("./cambio-contrasena")}
                      aria-label="Cambiar contraseña"
                    >
                      <i className="pi pi-lock"></i>
                      <span>Cambiar Contraseña</span>
                      <i className="pi pi-chevron-right dropdown-arrow"></i>
                    </button>
                  </div>

                  <div className="dropdown-footer">
                    <button
                      className="dropdown-item logout"
                      onClick={handleLogout}
                      aria-label="Cerrar sesión"
                    >
                      <i className="pi pi-sign-out"></i>
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="principal-footer dark">
          <div className="footer-content">
            <div className="footer-left">
              <span>
                © {new Date().getFullYear()} BCHASESORES S.A. Todos los derechos
                reservados.
              </span>
            </div>
            <div className="footer-right">
              <span>Versión 1.0.0</span>
              <span className="footer-separator">|</span>
              <a href="#" className="footer-link">
                Aviso Legal
              </a>
              <span className="footer-separator">|</span>
              <a href="#" className="footer-link">
                Preguntas Frecuentes (FAQ)
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Principal;
