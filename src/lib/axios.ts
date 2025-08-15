import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

// In development, we use the proxy configured in vite.config.ts
const API_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000, // 15 seconds
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 - Unauthorized error
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      localStorage.getItem("refreshToken")
    ) {
      originalRequest._retry = true;
      try {
        // Try to refresh the token
        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: localStorage.getItem("refreshToken"),
        });

        const newAccessToken = response.data.access;
        localStorage.setItem("accessToken", newAccessToken);

        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear everything and redirect to login
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        ...error,
        response: {
          data: {
            detail: 'Network error. Please check your internet connection.'
          }
        }
      });
    }

    // Return other errors as is
    return Promise.reject(error);
  }
);

export default api;
