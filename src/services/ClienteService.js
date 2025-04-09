import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';

// API base URL desde las variables de entorno (.env)
const API_URL = import.meta.env.VITE_API_BASE_URL;

const ClienteService = () => {
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
  const getClientes = async (page = 1, limit = 10) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/clientes?page=${page}&limit=${limit}`;
      const response = await secureAxios.get(url, { headers });
      return response.data; // Devuelve { data, total } o similar
    } catch (error) {
      console.error("Error al obtener clientes:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al obtener clientes" };
    }
  };

  // Obtener todos los clientes sin paginación
  const getAllClientes = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/clientes/all`; // Endpoint específico para todos los clientes
      const response = await secureAxios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error("Error al obtener todos los clientes:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al obtener todos los clientes" };
    }
  };

  // Crear nuevo cliente
  const createCliente = async (clienteData) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/clientes`;
      const response = await secureAxios.post(url, clienteData, { headers });
      return response;
    } catch (error) {
      console.error("Error al crear cliente:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al crear cliente" };
    }
  };

  // Actualizar cliente por ID
  const updateCliente = async (id, clienteData) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/clientes/${id}`;
      const response = await secureAxios.put(url, clienteData, { headers });
      return response;
    } catch (error) {
      console.error("Error al actualizar cliente:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al actualizar cliente" };
    }
  };

  // Eliminar cliente por ID
  const deleteCliente = async (id) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/clientes/${id}`;
      const response = await secureAxios.delete(url, { headers });
      return response;
    } catch (error) {
      console.error("Error al eliminar cliente:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al eliminar cliente" };
    }
  };

  // Buscar clientes con filtro por texto (query), con paginación
  const searchClientes = async (query, page = 1, limit = 10) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const url = `${API_URL}/clientes/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
      const response = await secureAxios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error("Error al buscar clientes:", error.response?.data || error.message);
      throw error.response?.data || { message: "Error al buscar clientes" };
    }
  };

  // Exportar todas las funciones del servicio
  return {
    getClientes,
    getAllClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    searchClientes,
  };
};

export default ClienteService;


// import axios from "axios";
// import { useSelector } from "react-redux";
// import { toast } from 'react-toastify';

// // API_URL directamente desde tus variables de entorno
// const API_URL = import.meta.env.VITE_API_BASE_URL;

// const ClienteService = () => {
//   const { token } = useSelector((state) => state.auth);

//   // Crear una instancia de axios con interceptor para manejar el error 401
//   const secureAxios = axios.create();

//   secureAxios.interceptors.response.use(
//     (response) => response,
//     (error) => {
//       if (error.response && error.response.status === 401) {
//         // Mostrar la advertencia de 401
//         toast.show({
//           severity: 'warn',
//           summary: 'Advertencia',
//           detail: 'No tienes permiso para acceder a esta sección.',
//           life: 5000,
//         });

//         setTimeout(() => {
//           dispatch(clearLogout());
//           navigate('/'); // Redirigir al login después de 1 segundo
//         }, 5000);
//       }
//       return Promise.reject(error);
//     }
//   );
//   // Agregar dentro del return del ClienteService
// const searchClientes = async (query, page = 1, limit = 10) => {
//   const headers = {
//     Authorization: `Bearer ${token}`,
//   };
//   try {
//     const url = `${API_URL}/clientes/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
//     const response = await secureAxios.get(url, { headers });
//     return response.data;
//   } catch (error) {
//     console.error(
//       "Error al buscar clientes:",
//       error.response?.data || error.message
//     );
//     throw error.response?.data || { message: "Error al buscar clientes" };
//   }
// };


//   const getClientes = async (page = 1, limit = 10) => {
//     const headers = {
//       Authorization: `Bearer ${token}`,
//     };
//     try {
//       const url = `${API_URL}/clientes?page=${page}&limit=${limit}`;
//       const response = await secureAxios.get(url, { headers });
//       return response.data; // Asumiendo que el backend devuelve { data, total }
//     } catch (error) {
//       console.error(
//         "Error al obtener clientes:",
//         error.response?.data || error.message
//       );
//       throw error.response?.data || { message: "Error al obtener clientes" };
//     }
//   };

//   const getAllClientes = async () => {
//     const headers = {
//       Authorization: `Bearer ${token}`,
//     };
//     try {
//       const url = `${API_URL}/clientes/all`; // Asume que tienes un endpoint para todos los clientes
//       const response = await secureAxios.get(url, { headers });
//       return response.data;
//     } catch (error) {
//       console.error(
//         "Error al obtener todos los clientes:",
//         error.response?.data || error.message
//       );
//       throw error.response?.data || { message: "Error al obtener todos los clientes" };
//     }
//   };

//   const createCliente = async (clienteData) => {
//     const headers = {
//       Authorization: `Bearer ${token}`,
//     };
//     try {
//       const url = `${API_URL}/clientes`;
//       const response = await secureAxios.post(url, clienteData, { headers });
//       return response;
//     } catch (error) {
//       console.error(
//         "Error al crear cliente:",
//         error.response?.data || error.message
//       );
//       throw error.response?.data || { message: "Error al crear cliente" };
//     }
//   };

//   const updateCliente = async (id, clienteData) => {
//     const headers = {
//       Authorization: `Bearer ${token}`,
//     };
//     try {
//       const url = `${API_URL}/clientes/${id}`;
//       const response = await secureAxios.put(url, clienteData, { headers });
//       return response;
//     } catch (error) {
//       console.error(
//         "Error al actualizar cliente:",
//         error.response?.data || error.message
//       );
//       throw error.response?.data || { message: "Error al actualizar cliente" };
//     }
//   };

//   const deleteCliente = async (id) => {
//     const headers = {
//       Authorization: `Bearer ${token}`,
//     };
//     try {
//       const url = `${API_URL}/clientes/${id}`;
//       const response = await secureAxios.delete(url, { headers });
//       return response;
//     } catch (error) {
//       console.error(
//         "Error al eliminar cliente:",
//         error.response?.data || error.message
//       );
//       throw error.response?.data || { message: "Error al eliminar cliente" };
//     }
//   };

//   return {
//     getClientes,
//     getAllClientes,
//     createCliente,
//     updateCliente,
//     deleteCliente,
//     searchClientes
//   };
// };

// export default ClienteService;