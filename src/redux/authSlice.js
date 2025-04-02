import { createSlice } from '@reduxjs/toolkit';

const storedToken = localStorage.getItem("token") || null;
const storedUserId = localStorage.getItem("userId") || null;
const storedPerfilId = localStorage.getItem("perfil") || null;

const initialState = {
    token: storedToken,
    userId: storedUserId,
    perfilId: storedPerfilId,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLogin:(state,action)=>{
            state.token = action.payload.token;
            state.userId = action.payload.userId;
            state.perfilId = action.payload.perfilId;
            localStorage.setItem("token", action.payload.token);
            localStorage.setItem("userId", action.payload.userId);
            localStorage.setItem("perfil", action.payload.perfilId);
        },
        clearToken: (state) => {
            state.token = null;
        },
        clearLogout:(state)=>{
            state.token = null;
            state.userId = null;
            state.perfilId = null;
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("perfil");
        }
    },
});

export const {setLogin,clearToken,clearLogout} = authSlice.actions;

export default authSlice.reducer;