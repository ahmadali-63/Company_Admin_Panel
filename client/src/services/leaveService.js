import API from "./api";

export const leaveService = {
  applyLeave: async (leaveData) => {
    const res = await API.post("/leave", leaveData);
    return res.data;
  },
  getMyLeaves: async (page = 1, limit = 20) => {
    const res = await API.get(`/leave/my-leaves?page=${page}&limit=${limit}`);
    return res.data;
  },
  getAllLeaves: async (params = {}) => {
    const res = await API.get("/leave/all", { params });
    return res.data;
  },
  updateLeaveStatus: async (id, statusData) => {
    const res = await API.put(`/leave/${id}/status`, statusData);
    return res.data;
  },
};
