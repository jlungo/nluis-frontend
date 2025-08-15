import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Attach access token to requests
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Add response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error?.response?.data || error);
  }
);

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
