import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import configuracionSlice from "./configuracionSlice";
const store = configureStore({
  reducer: {
    // Aquí agregas tus reducers
    auth: authSlice,
    configuracion: configuracionSlice,
  },
});

export default store;
