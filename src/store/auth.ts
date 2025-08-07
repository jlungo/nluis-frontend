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
  modules: ModuleTypes[];
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  user: null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await api.post("/login", { email, password });
      const { access, refresh, ...userData } = res.data;

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      set({
        accessToken: access,
        refreshToken: refresh,
        user: userData,
      });
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ accessToken: null, refreshToken: null, user: null });
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
