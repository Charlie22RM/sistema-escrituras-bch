import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';

// API base URL desde las variables de entorno (.env)
const API_URL = import.meta.env.VITE_API_BASE_URL;

const CantonService = () => {
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

  // Obtener clientes paginados
  const getCantones = async (page = 1, limit = 10) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/cantones?page=${page}&limit=${limit}`;
      const response = await secureAxios.get(url, { headers });
      return response.data; // Devuelve { data, total } o similar
    } catch (error) {
      console.error("Error al obtener cantones:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al obtener cantones" };
    }
  };

  // Obtener todos los clientes sin paginación
  const getAllCantones = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/cantones/all`; // Endpoint específico para todos los clientes
      const response = await secureAxios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error("Error al obtener todos los cantones:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al obtener todos los cantones" };
    }
  };

  // Crear nuevo cliente
  const createCanton = async (cantonData) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/cantones`;
      const response = await secureAxios.post(url, cantonData, { headers });
      return response;
    } catch (error) {
      console.error("Error al crear canton:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al crear canton" };
    }
  };

  // Actualizar cliente por ID
  const updateCanton = async (id, cantonData) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/cantones/${id}`;
      const response = await secureAxios.put(url, cantonData, { headers });
      return response;
    } catch (error) {
      console.error("Error al actualizar canton:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al actualizar canton" };
    }
  };

  // Eliminar cliente por ID
  const deleteCanton = async (id) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/cantones/${id}`;
      const response = await secureAxios.delete(url, { headers });
      return response;
    } catch (error) {
      console.error("Error al eliminar canton:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al eliminar canton" };
    }
  };

  // Buscar clientes con filtro por texto (query), con paginación
  const searchCantones = async (query, page = 1, limit = 10) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/cantones/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
      const response = await secureAxios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error("Error al buscar cantones:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al buscar cantones" };
    }
  };

  // Exportar todas las funciones del servicio
  return {
    getCantones,
    getAllCantones,
    createCanton,
    updateCanton,
    deleteCanton,
    searchCantones,
  };
};

export default CantonService;

