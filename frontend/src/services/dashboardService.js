import api from "./api";

const dashboardService = {
  // الحصول على إحصائيات Dashboard
  getStats: async () => {
    const response = await api.get("/dashboard/stats");
    return response.data;
  },

  // الحصول على النشاطات الأخيرة
  getRecentActivity: async () => {
    const response = await api.get("/dashboard/recent-activity");
    return response.data;
  },

  // الحصول على سجل النشاطات (admin only)
  getActivityLogs: async (params = {}) => {
    const response = await api.get("/activity-logs", { params });
    return response.data;
  },
};

export default dashboardService;
