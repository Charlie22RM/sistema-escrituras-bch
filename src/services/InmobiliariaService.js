import axios from "axios";
import { useSelector } from "react-redux";
const API_URL = import.meta.env.VITE_API_BASE_URL;

const InmobiliariaService = () => {
  const { token } = useSelector((state) => state.auth);

  const getInmobiliarias = async () => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const url = `${API_URL}/inmobiliarias`;
      const response = await axios.get(url, { headers });
      return response;
    } catch (error) {
      console.error(
        "Error al obtener inmobiliarias:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Error al obtener inmobiliarias" };
    }
  };

  return {
    getInmobiliarias,
  };
};

export default InmobiliariaService;
