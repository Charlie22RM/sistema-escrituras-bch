import { createSlice } from "@reduxjs/toolkit";

const storedCanDeleteTramite =
  localStorage.getItem("canDeleteTramite") === "true" || null;

const initialState = {
  canDeleteTramite: storedCanDeleteTramite,
};

const configuracionSlice = createSlice({
  name: "configuracion",
  initialState,
  reducers: {
    setConfiguracion: (state, action) => {
      state.canDeleteTramite = action.payload.canDeleteTramite;
      localStorage.setItem("canDeleteTramite", action.payload.canDeleteTramite);
    },
    clearConfiguracion: (state) => {
      state.canDeleteTramite = null;
      localStorage.removeItem("canDeleteTramite");
    },
  },
});
export const { setConfiguracion, clearConfiguracion } =
  configuracionSlice.actions;
export default configuracionSlice.reducer;
