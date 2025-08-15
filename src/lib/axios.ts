import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

// Mock interceptor for development
api.interceptors.request.use((config) => {
  // Mock login endpoint
  if (config.url === '/auth/login/') {
    return Promise.reject({
      response: {
        data: {
          access: "mock_access_token",
          refresh: "mock_refresh_token",
          id: "mock_user_id",
          email: "test@example.com",
          user_type: 1,
          first_name: "Test",
          last_name: "User",
          organization: {
            id: "org_id",
            name: "Test Organization"
          },
          role: {
            id: "role_id",
            name: "Admin"
          },
          modules: ["SWITCH", "BOARD"],
          company: "Test Company",
          phone_number: "1234567890"
        }
      }
    });
  }
  return config;
});

// Attach access token to requests
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Auto-refresh on 401 error
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refreshToken")
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: localStorage.getItem("refreshToken"),
        });

        const newAccess = res.data.access;
        localStorage.setItem("accessToken", newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(err);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
