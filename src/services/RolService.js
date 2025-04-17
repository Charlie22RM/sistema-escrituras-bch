import axios from "axios";
import { useSelector } from "react-redux";
const API_URL = import.meta.env.VITE_API_BASE_URL;

const RolService = () => {
  const { token } = useSelector((state) => state.auth);

  const getAll = () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const url = `${API_URL}/rol`;
      const response = axios.get(url, { headers });
      return response;
    } catch (error) {
      throw error;
    }
  };
  return {
    getAll,
  }
};

export default RolService;
