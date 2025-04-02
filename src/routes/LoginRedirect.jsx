import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Login from "../pages/login/Login";
const LoginRedirect = () => {
    const { token, perfilId } = useSelector((state) => state.auth);
    const getDefaultRoute = (perfilId) => {
        switch (perfilId) {
          case 1: // Admin
            return "/administrador/";
          case 2: // Operador
            return "/operador/";
          case 3: // Cliente
            return "/cliente/";
          default:
            return "/";
        }
      };

    if (token && perfilId) {
     const perfil_id = parseInt(perfilId, 10);
      const route = getDefaultRoute(perfil_id);
      console.log("Token y perfilId disponibles. Redirigiendo a:", perfilId);
      console.log("Redirigiendo a la ruta por defecto:", route);
      return <Navigate to={route} replace />;
    }
    
    return <Login />;
  };


  export default LoginRedirect;