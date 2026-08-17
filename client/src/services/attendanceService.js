import API from "./api";

export const attendanceService = {
  checkIn: async (notes = "") => {
    const res = await API.post("/attendance/check-in", { notes });
    return res.data;
  },
  checkOut: async () => {
    const res = await API.post("/attendance/check-out");
    return res.data;
  },
  getTodayStatus: async () => {
    const res = await API.get("/attendance/today");
    return res.data;
  },
  getMyAttendance: async (page = 1, limit = 20) => {
    const res = await API.get(`/attendance/my-attendance?page=${page}&limit=${limit}`);
    return res.data;
  },
  getAllAttendance: async (params = {}) => {
    const res = await API.get("/attendance/all", { params });
    return res.data;
  },
};
