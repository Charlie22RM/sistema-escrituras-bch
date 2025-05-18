import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

// API base URL desde las variables de entorno (.env)
const API_URL = import.meta.env.VITE_API_BASE_URL;

const ProyectoService = () => {
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
        toast.warning("No tienes permiso para acceder a esta sección.");

        // Esperar y luego redirigir (nota: dispatch y navigate no están definidos aquí, deberías mover esta lógica a otro lugar)
        setTimeout(() => {
          dispatch(clearLogout()); // <-- Esto fallará si no se pasa dispatch como parámetro o contexto
          navigate("/"); // <-- Igual que dispatch
        }, 5000);
      }
      return Promise.reject(error);
    }
  );

  // Obtener proyectos paginados
  const getProyectos = async (page = 1, limit = 10) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/proyectos?page=${page}&limit=${limit}`;
      const response = await secureAxios.get(url, { headers });
      return response.data; // Devuelve { data, total } o similar
    } catch (error) {
      console.error(
        "Error al obtener proyectos:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Error al obtener proyectos" };
    }
  };

  const find = async (qs = "") => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/proyectos/find${qs}`;
      const response = await secureAxios.get(url, { headers });
      return response.data; // Devuelve { data, total } o similar
    } catch (error) {
      console.error(
        "Error al obtener proyectos:",
        error.response?.data || error.message
      );
      throw (
        error.response?.data || { message: "Error al obtener proyectos" }
      );
    }
  };

  // Obtener todos los proyectos sin paginación
  const getAllProyectos = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/proyectos/all`; // Endpoint específico para todos los proyectos
      const response = await secureAxios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error(
        "Error al obtener todos los proyectos:",
        error.response?.data || error.message
      );
      throw (
        error.response?.data || {
          message: "Error al obtener todos los proyectos",
        }
      );
    }
  };

  // Crear nuevo proyecto
  const createProyecto = async (proyectoData) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/proyectos`;
      const response = await secureAxios.post(url, proyectoData, { headers });
      return response;
    } catch (error) {
      console.error(
        "Error al crear proyecto:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Error al crear proyecto" };
    }
  };

  // Actualizar proyecto por ID
  const updateProyecto = async (id, proyectoData) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/proyectos/${id}`;
      const response = await secureAxios.put(url, proyectoData, { headers });
      return response;
    } catch (error) {
      console.error(
        "Error al actualizar proyecto:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Error al actualizar proyecto" };
    }
  };

  // Eliminar proyecto por ID
  const deleteProyecto = async (id) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/proyectos/${id}`;
      const response = await secureAxios.delete(url, { headers });
      return response;
    } catch (error) {
      console.error(
        "Error al eliminar proyecto:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Error al eliminar proyecto" };
    }
  };

  // Buscar proyectos con filtro por texto (query), con paginación
  const searchProyectos = async (query, page = 1, limit = 10) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/proyectos/search?query=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`;
      const response = await secureAxios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error(
        "Error al buscar proyectos:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Error al buscar proyectos" };
    }
  };

  // Exportar todas las funciones del servicio
  return {
    getProyectos,
    find,
    getAllProyectos,
    createProyecto,
    updateProyecto,
    deleteProyecto,
    searchProyectos,
  };
};

export default ProyectoService;
