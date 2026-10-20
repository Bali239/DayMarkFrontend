import { createSlice } from "@reduxjs/toolkit";

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: { filter: "Upcoming", query: "" },
  reducers: {
    setFilter(state, action) { state.filter = action.payload; },
    setQuery(state, action) { state.query = action.payload; },
  },
});

export const { setFilter, setQuery } = dashboardSlice.actions;
export default dashboardSlice.reducer;
