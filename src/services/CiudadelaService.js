import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';

// API base URL desde las variables de entorno (.env)
const API_URL = import.meta.env.VITE_API_BASE_URL;

const CiudadelaService = () => {
  // Obtener el token desde Redux para autenticación
  const { token } = useSelector((state) => state.auth);

  // Crear una instancia de Axios para usar interceptores personalizados
  const secureAxios = axios.create();

  // Interceptor para manejar errores globales (como 401 Unauthorized)
  secureAxios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Mostrar advertencia de sesión inválida (requiere ajustar toast aquí, no es compatible con react-toastify tal como está)
        toast.warning('No tienes permiso para acceder a esta sección.');

        // Esperar y luego redirigir (nota: dispatch y navigate no están definidos aquí, deberías mover esta lógica a otro lugar)
        setTimeout(() => {
          dispatch(clearLogout()); // <-- Esto fallará si no se pasa dispatch como parámetro o contexto
          navigate('/');           // <-- Igual que dispatch
        }, 5000);
      }
      return Promise.reject(error);
    }
  );

  // Obtener ciudadelas paginados
  const getCiudadelas = async (page = 1, limit = 10) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/ciudadelas?page=${page}&limit=${limit}`;
      const response = await secureAxios.get(url, { headers });
      return response.data; // Devuelve { data, total } o similar
    } catch (error) {
      console.error("Error al obtener ciudadelas:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al obtener ciudadelas" };
    }
  };

  // Obtener todos los ciudadelas sin paginación
  const getAllCiudadelas = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/ciudadelas/all`; // Endpoint específico para todos los ciudadelas
      const response = await secureAxios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error("Error al obtener todos los ciudadelas:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al obtener todos los ciudadelas" };
    }
  };

  // Crear nuevo ciudadela
  const createCiudadela = async (ciudadelaData) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/ciudadelas`;
      const response = await secureAxios.post(url, ciudadelaData, { headers });
      return response;
    } catch (error) {
      console.error("Error al crear ciudadela:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al crear ciudadela" };
    }
  };

  // Actualizar ciudadela por ID
  const updateCiudadela = async (id, ciudadelaData) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/ciudadelas/${id}`;
      const response = await secureAxios.put(url, ciudadelaData, { headers });
      return response;
    } catch (error) {
      console.error("Error al actualizar ciudadela:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al actualizar ciudadela" };
    }
  };

  // Eliminar ciudadela por ID
  const deleteCiudadela = async (id) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/ciudadelas/${id}`;
      const response = await secureAxios.delete(url, { headers });
      return response;
    } catch (error) {
      console.error("Error al eliminar ciudadela:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al eliminar ciudadela" };
    }
  };

  // Buscar ciudadelas con filtro por texto (query), con paginación
  const searchCiudadelas = async (query, page = 1, limit = 10) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/ciudadelas/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
      const response = await secureAxios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error("Error al buscar ciudadelas:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al buscar ciudadelas" };
    }
  };

  // Exportar todas las funciones del servicio
  return {
    getCiudadelas,
    getAllCiudadelas,
    createCiudadela,
    updateCiudadela,
    deleteCiudadela,
    searchCiudadelas,
  };
};

export default CiudadelaService;

