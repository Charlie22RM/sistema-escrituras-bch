import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";

const store = configureStore({
  reducer: {
    // Aquí agregas tus reducers
    auth: authSlice,
  },
});

export default store;
