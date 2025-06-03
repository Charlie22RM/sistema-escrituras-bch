import axios from "axios";
import { useSelector } from "react-redux";
const API_URL = import.meta.env.VITE_API_BASE_URL;

const PdfService = () => {
  const { token } = useSelector((state) => state.auth);

  const uploadPdf = async (file, data) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };
      const formData = new FormData();
      console.log("Datos a enviar:", data);
      formData.append("file", file);
      //formData.append("tramite_id", data.tramiteId);
      // Convertir explícitamente booleanos a strings "true"/"false"
      Object.keys(data).forEach((key) => {
        const value = data[key];
        console.log(`Agregando ${key}:`, value);
        formData.append(key, value.toString()); // "true" o "false"
      });
      const url = `${API_URL}/pdf/upload`;
      const response = await axios.post(url, formData, { headers });
      return response;
    } catch (error) {
      console.error(
        "Error al subir el PDF:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Error al subir el PDF" };
    }
  };

  const getPdf = async (id) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const url = `${API_URL}/pdf/${id}/url`;
      const response = await axios.get(url, { headers });
      return response;
    } catch (error) {
      console.error(
        "Error al obtener el PDF:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Error al obtener el PDF" };
    }
  };

  const deletePdf = async (id) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const url = `${API_URL}/pdf/${id}`;
      const response = await axios.delete(url, { headers });
      return response;
    } catch (error) {
      console.error(
        "Error al eliminar el PDF:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Error al eliminar el PDF" };
    }
  };

  return {
    uploadPdf,
    getPdf,
    deletePdf,
  };
};

export default PdfService;
