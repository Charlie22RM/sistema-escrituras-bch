import axios from "axios";
import { useSelector } from "react-redux";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const InformeService = () => {
  const { token } = useSelector((state) => state.auth);

  const getInformeTramite = async () => {
    try {
      const response = await axios.get(`${API_URL}/informe/tramites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener el informe del trámite:", error);
      throw error;
    }
  };
  return {
    getInformeTramite,
  };
};

export default InformeService;