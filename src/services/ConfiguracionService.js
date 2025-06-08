import axios from "axios";
import { useSelector } from "react-redux";
const API_URL = import.meta.env.VITE_API_BASE_URL;

const ConfiguracionService = () => {
  const token = useSelector((state) => state.auth.token);

  const getAll = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/configuracion`, { headers });
      return response.data;
    } catch (error) {
      console.error("Error al obtener configuraciones:", error);
      throw error;
    }
  };

  const update = async (configuracion) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.put(
        `${API_URL}/configuracion`,
        configuracion,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error al actualizar configuración:", error);
      throw error;
    }
  };

  return {
    getAll,
    update,
  };
};

export default ConfiguracionService;
