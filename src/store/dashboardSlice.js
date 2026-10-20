import { createSlice } from "@reduxjs/toolkit";

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: { filter: "Overview", query: "", page: 1, pageSize: 8 },
  reducers: {
    setFilter(state, action) {
      state.filter = action.payload;
      state.page = 1;
    },
    setQuery(state, action) {
      state.query = action.payload;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
    setPageSize(state, action) {
      state.pageSize = action.payload;
      state.page = 1;
    },
  },
});

export const { setFilter, setQuery, setPage, setPageSize } = dashboardSlice.actions;
export default dashboardSlice.reducer;
