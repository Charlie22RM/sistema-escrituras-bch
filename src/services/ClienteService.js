import axios from "axios";
import { useSelector } from "react-redux";
const API_URL = import.meta.env.VITE_API_BASE_URL;

const ClienteService = () => {
  const { token } = useSelector((state) => state.auth);

  const getClientes = async () => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const url = `${API_URL}/clientes`;
      const response = await axios.get(url, { headers });
      return response;
    } catch (error) {
      console.error(
        "Error al obtener clientes:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Error al obtener clientes" };
    }
  };

  return {
    getClientes,
  };
};

export default ClienteService;
