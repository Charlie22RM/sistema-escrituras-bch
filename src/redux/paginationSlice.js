// redux/paginationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  page: 1,  // Página actual
  limit: 10, // Límites de resultados por página
  totalRecords: 0, // Total de registros, puedes actualizarlo al obtener la respuesta de la API
};

const paginationSlice = createSlice({
  name: 'pagination',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload; // Cambiar la página
    },
    setLimit: (state, action) => {
      state.limit = action.payload; // Cambiar el límite de resultados por página
    },
    setTotalRecords: (state, action) => {
      state.totalRecords = action.payload; // Establecer el total de registros
    },
  },
});

export const { setPage, setLimit, setTotalRecords } = paginationSlice.actions;

export default paginationSlice.reducer;
