import axios from "axios";
import { useSelector } from "react-redux";
const API_URL = import.meta.env.VITE_API_BASE_URL;

const TramiteService = () => {
  const token = useSelector((state) => state.auth.token);

  const createTramite = async (data) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(`${API_URL}/tramites`, data, { headers });
      return response.data;
    } catch (error) {
      console.error("Error al crear trámite:", error);
      throw error;
    }
  };

  return {
    createTramite,
  };
};

export default TramiteService;
