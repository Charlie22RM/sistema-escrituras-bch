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

    const searchTramites = async (query, page = 1, limit = 10) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/tramites/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
      const response = await secureAxios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error("Error al buscar tramites:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al buscar tramites" };
    }
  };

    const getTramites = async (page = 1, limit = 10) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/tramites?page=${page}&limit=${limit}`;
      const response = await secureAxios.get(url, { headers });
      return response.data; // Devuelve { data, total } o similar
    } catch (error) {
      console.error("Error al obtener trámites:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al obtener trámites" };
    }
  };

    const deleteTramite = async (id) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/tramites/${id}`;
      const response = await secureAxios.delete(url, { headers });
      return response;
    } catch (error) {
      console.error("Error al eliminar trámite:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al eliminar trámite" };
    }
  };

  const findOne = async (id) =>{
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/tramites/${id}`, { headers });
      return response.data;
    } catch (error) {
      console.error("Error al obtener trámite:", error);
      throw error;
    }
  }

    const update = async (id, data) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.put(`${API_URL}/tramites/${id}`, data, { headers });
      return response.data;
    } catch (error) {
      console.error("Error al actualizar trámite:", error);
      throw error;
    }
  };
  return {
    createTramite,
    searchTramites,
    getTramites,
    deleteTramite,
    findOne,
    update,
  };
};




export default TramiteService;
