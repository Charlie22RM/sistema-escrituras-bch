import axios from "axios";
import { useSelector } from "react-redux";

// API_URL directamente desde tus variables de entorno
const API_URL = import.meta.env.VITE_API_BASE_URL;

const ClienteService = () => {
  const { token } = useSelector((state) => state.auth);

  // Crear una instancia de axios con interceptor para manejar el error 401
  const secureAxios = axios.create();

  secureAxios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Mostrar la advertencia de 401
        toast.current.show({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No tienes permiso para acceder a esta sección.',
          life: 5000,
        });

        setTimeout(() => {
          dispatch(clearLogout());
          navigate('/'); // Redirigir al login después de 1 segundo
        }, 5000);
      }
      return Promise.reject(error);
    }
  );

  const getClientes = async () => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const url = `${API_URL}/clientes`;
      const response = await secureAxios.get(url, { headers });
      return response;
    } catch (error) {
      console.error(
        "Error al obtener clientes:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Error al obtener clientes" };
    }
  };

  const createCliente = async (clienteData) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const url = `${API_URL}/clientes`;
      const response = await secureAxios.post(url, clienteData, { headers });
      return response;
    } catch (error) {
      console.error(
        "Error al crear cliente:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Error al crear cliente" };
    }
  };

  const updateCliente = async (id, clienteData) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const url = `${API_URL}/clientes/${id}`;
      const response = await secureAxios.put(url, clienteData, { headers });
      return response;
    } catch (error) {
      console.error(
        "Error al actualizar cliente:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Error al actualizar cliente" };
    }
  };

  const deleteCliente = async (id) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const url = `${API_URL}/clientes/${id}`;
      const response = await secureAxios.delete(url, { headers });
      return response;
    } catch (error) {
      console.error(
        "Error al eliminar cliente:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Error al eliminar cliente" };
    }
  };

  return {
    getClientes,
    createCliente,
    updateCliente,
    deleteCliente,
  };
};

export default ClienteService;

// import axios from "axios";
// import { useSelector } from "react-redux";

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
//         toast.current.show({
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

//   const getClientes = async () => {
//     const headers = {
//       Authorization: `Bearer ${token}`,
//     };
//     try {
//       const url = `${API_URL}/clientes`;
//       const response = await secureAxios.get(url, { headers });
//       return response;
//     } catch (error) {
//       console.error(
//         "Error al obtener clientes:",
//         error.response?.data || error.message
//       );
//       throw error.response?.data || { message: "Error al obtener clientes" };
//     }
//   };

//   // Nueva función para obtener un cliente por su ID
//   const getClienteById = async (id) => {
//     const headers = {
//       Authorization: `Bearer ${token}`,
//     };
//     try {
//       const url = `${API_URL}/clientes/${id}`;
//       const response = await secureAxios.get(url, { headers });
//       return response;
//     } catch (error) {
//       console.error(
//         "Error al obtener cliente por ID:",
//         error.response?.data || error.message
//       );
//       throw error.response?.data || { message: "Error al obtener cliente" };
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
//     getClienteById,  // Asegúrate de devolver la función
//     createCliente,
//     updateCliente,
//     deleteCliente,
//   };
// };

// export default ClienteService;

