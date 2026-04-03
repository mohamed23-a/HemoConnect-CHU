import api from "./api";

const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post("/login", credentials);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  },

  logout: async () => {
    try {
      await api.post("/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get("/me");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to get user" };
    }
  },

  changePassword: async (data) => {
    const response = await api.post("/change-password", data);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/register", userData);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
};

export default authService;
