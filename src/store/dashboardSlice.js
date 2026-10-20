import { createSlice } from "@reduxjs/toolkit";

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: { filter: "Overview", query: "", page: 1, pageSize: 8 },
  reducers: {
    restoreDashboard(state, action) {
      const saved = action.payload || {};
      const filters = ["Overview", "Upcoming", "All reminders", "Completed", "Overdue"];
      const pageSizes = [8, 16, 32];
      state.filter = filters.includes(saved.filter) ? saved.filter : "Overview";
      state.query = "";
      state.page = Number.isInteger(saved.page) && saved.page > 0 ? saved.page : 1;
      state.pageSize = pageSizes.includes(saved.pageSize) ? saved.pageSize : 8;
    },
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

export const { restoreDashboard, setFilter, setQuery, setPage, setPageSize } =
  dashboardSlice.actions;
export default dashboardSlice.reducer;
