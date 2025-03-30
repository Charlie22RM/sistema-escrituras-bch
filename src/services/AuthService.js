import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const login = async (email, password) => {
  try {
    const url = `${API_URL}/auth/login`;
    const response = await axios.post(url, { email, password });
    return response; 
  } catch (error) {
    console.error("Error en el login:", error.response?.data || error.message);
    throw error.response?.data || { message: "Error al iniciar sesión" };
  }
};
