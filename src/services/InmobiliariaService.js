import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';

// API base URL desde las variables de entorno (.env)
const API_URL = import.meta.env.VITE_API_BASE_URL;

const InmobiliariaService = () => {
  // Obtener el token desde Redux para autenticación
  const { token } = useSelector((state) => state.auth);

  // Crear una instancia de Axios para usar interceptores personalizados
  const secureAxios = axios.create();

  // Interceptor para manejar errores globales (como 401 Unauthorized)
  /*
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
  */
  // Obtener inmobiliarias paginados
  const getInmobiliarias = async (page = 1, limit = 10) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/inmobiliarias?page=${page}&limit=${limit}`;
      const response = await secureAxios.get(url, { headers });
      return response.data; // Devuelve { data, total } o similar
    } catch (error) {
      console.error("Error al obtener inmobiliarias:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al obtener inmobiliarias" };
    }
  };

    const find = async (qs="") => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/inmobiliarias/find${qs}`;
      const response = await secureAxios.get(url, { headers });
      return response.data; // Devuelve { data, total } o similar
    } catch (error) {
      console.error("Error al obtener inmobiliarias:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al obtener inmobiliarias" };
    }
  };

  // Obtener todas las inmobiliarias sin paginación
  const getAllInmobiliarias = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/inmobiliarias/all`; // Endpoint específico para todos los inmobiliarias
      const response = await secureAxios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error("Error al obtener todas las inmobiliarias:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al obtener todas las inmobiliarias" };
    }
  };

  // Crear nueva inmobiliaria
  const createInmobiliaria = async (inmobiliariaData) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/inmobiliarias`;
      const response = await secureAxios.post(url, inmobiliariaData, { headers });
      return response;
    } catch (error) {
      console.error("Error al crear inmobiliaria:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al crear inmobiliaria" };
    }
  };

  // Actualizar inmobiliaria por ID
  const updateInmobiliaria = async (id, inmobiliariaData) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/inmobiliarias/${id}`;
      const response = await secureAxios.put(url, inmobiliariaData, { headers });
      return response;
    } catch (error) {
      console.error("Error al actualizar inmobiliaria:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al actualizar inmobiliaria" };
    }
  };

  // Eliminar inmobiliaria por ID
  const deleteInmobiliaria = async (id) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/inmobiliarias/${id}`;
      const response = await secureAxios.delete(url, { headers });
      return response;
    } catch (error) {
      console.error("Error al eliminar inmobiliaria:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al eliminar inmobiliaria" };
    }
  };

  // Buscar inmobiliarias con filtro por texto (query), con paginación
  const searchInmobiliarias = async (query, page = 1, limit = 10) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/inmobiliarias/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
      const response = await secureAxios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error("Error al buscar inmobiliarias:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al buscar inmobiliarias" };
    }
  };

  const getByClienteId = async (cliente_id) =>{
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const url = `${API_URL}/inmobiliarias/byClienteId/${cliente_id}`;
      const response = await secureAxios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error("Error al obtener inmobiliarias por cliente:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al obtener inmobiliarias por cliente" };
      
    }
    
  }

    const getTags2 = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/inmobiliarias/tags`;
      const response = await secureAxios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error("Error al obtener todos los tags:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al obtener todos los tags" };
    }
  }


  // Exportar todas las funciones del servicio
  return {
    getInmobiliarias,
    find,
    getAllInmobiliarias,
    getByClienteId,
    createInmobiliaria,
    updateInmobiliaria,
    deleteInmobiliaria,
    searchInmobiliarias,
    getTags2
  };
};

export default InmobiliariaService;