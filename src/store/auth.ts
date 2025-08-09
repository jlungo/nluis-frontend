import { create } from "zustand";
import api from "@/lib/axios";
import type { ModuleTypes } from "@/types/modules";

export interface UserProps {
  id: string;
  email: string;
  user_type: number;
  first_name: string;
  last_name: string;
  organization: {
    id: string;
    name: string;
  } | null;
  role: {
    id: string;
    name: string;
  } | null;
  modules: ModuleTypes[] | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProps | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await api.post("/auth/login/", { email, password });
      const { access, refresh, ...userData } = res.data;

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("user", JSON.stringify(userData));

      set({
        accessToken: access,
        refreshToken: refresh,
        user: userData,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      throw error.response?.data || { detail: "Network error!" };
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await api.post("/auth/logout/", {
        refresh: localStorage.getItem("refreshToken"),
      });

      set({ accessToken: null, refreshToken: null, user: null });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      throw error.response?.data || { detail: "Network error!" };
    } finally {
      set({ loading: false });
    }
  },

  refreshAccessToken: async () => {
    try {
      const refresh = get().refreshToken;
      const res = await api.post("/refresh", { refresh });
      const newAccess = res.data.access;
      localStorage.setItem("accessToken", newAccess);
      set({ accessToken: newAccess });
    } catch {
      get().logout();
    }
  },
}));
