// lib/axios.ts
import axios from "axios";
import { API_URL } from "./env";

const api = axios.create({ baseURL: API_URL });

// Attach access token
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Export helpers so Mapbox flow can reuse same logic
export const getAccessToken = () => localStorage.getItem("accessToken");

export const refreshAccessToken = async () => {
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) throw new Error("No refresh token");
  const res = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh });
  const newAccess = res.data.access;
  localStorage.setItem("accessToken", newAccess);
  return newAccess;
};

// Auto-refresh on 401 for *Axios* calls
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry && localStorage.getItem("refreshToken")) {
      originalRequest._retry = true;
      try {
        const newAccess = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
