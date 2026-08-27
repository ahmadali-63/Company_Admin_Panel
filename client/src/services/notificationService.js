import api from "./api";

export const notificationService = {
  getMyNotifications: () => api.get("/notifications"),
  sendNotification: (data) => api.post("/notifications", data),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};
