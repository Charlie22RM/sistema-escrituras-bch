import axios from "axios";
import { useSelector } from "react-redux";
const API_URL = import.meta.env.VITE_API_BASE_URL;

const UserService = () => {
  const { token } = useSelector((state) => state.auth);

  const getUsuarios = async (qs = "") => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const url = `${API_URL}/usuarios${qs}`;
      const response = await axios.get(url, { headers });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const store = async (values) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const url = `${API_URL}/usuarios`;
      const response = await axios.post(url, values, { headers });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const getById = async (id) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const url = `${API_URL}/usuarios/${id}`;
      const response = await axios.get(url, { headers });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const update = async (id,values) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const url = `${API_URL}/usuarios/${id}`;
      const response = await axios.put(url, values, { headers });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const deleteValue=(id) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const url = `${API_URL}/usuarios/${id}`;
      const response = axios.delete(url, { headers });
      return response;
    } catch (error) {
      throw error;
    }
  }
  return {
    getUsuarios,
    store,
    getById,
    update,
    deleteValue,
  };
};

export default UserService;
