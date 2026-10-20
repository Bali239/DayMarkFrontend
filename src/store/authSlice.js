import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { token: "", user: null, status: "checking" },
  reducers: {
    setSession(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.status = "authenticated";
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    clearSession(state) {
      state.token = "";
      state.user = null;
      state.status = "unauthenticated";
    },
  },
});

export const { setSession, setUser, clearSession } = authSlice.actions;
export default authSlice.reducer;
