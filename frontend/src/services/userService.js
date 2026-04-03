import api from "./api";

const userService = {
  // الحصول على قائمة المستخدمين
  getUsers: async (params = {}) => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  // الحصول على مستخدم محدد
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // تحديث مستخدم
  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // حذف مستخدم
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // تغيير حالة المستخدم
  toggleUserStatus: async (id) => {
    const response = await api.patch(`/users/${id}/toggle-status`);
    return response.data;
  },
};

export default userService;
