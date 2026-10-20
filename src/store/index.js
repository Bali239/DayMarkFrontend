import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/authSlice";
import dashboardReducer from "@/store/dashboardSlice";

export const makeStore = () =>
  configureStore({
    reducer: { auth: authReducer, dashboard: dashboardReducer },
  });
