import axios from "axios";
import { useSelector } from "react-redux";
const API_URL = import.meta.env.VITE_API_BASE_URL;

const AuthService = () => {
  const { token } = useSelector((state) => state.auth);

  const login = async (email, password) => {
    try {
      const url = `${API_URL}/auth/login`;
      const response = await axios.post(url, { email, password });
      return response;
    } catch (error) {
      console.error(
        "Error en el login:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Error al iniciar sesión" };
    }
  };

  const changeMyPassword = async (values) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const url = `${API_URL}/auth/change-password`;
      const response = await axios.post(url, values, { headers });
      return response;
    } catch (error) {
      console.error(
        "Error al cambiar la contraseña:",
        error.response?.data || error.message
      );
      throw (
        error.response?.data || { message: "Error al cambiar la contraseña" }
      );
    }
  };

  return {
    login,
    changeMyPassword,
  };
};

export default AuthService;