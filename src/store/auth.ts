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
  company: string | null;
  phone_number: string | null;
}

export interface RegisterDataState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string | null;
  gender?: number;
  password: string;
  confirmPassword: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProps | null;
  loading: boolean;
  signup: (data: RegisterDataState) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  verifyPasswordResetToken: (uidb64: string, token: string) => Promise<{
    success: boolean;
    message: string;
    uid64: string;
    token: string;
  }>;
}

export const useAuth = create<AuthState>((set, get) => ({
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null,
  loading: false,

  signup: async (data) => {
    set({ loading: true });

    try {
      const missingFields: string[] = [];

      if (!data?.firstName) missingFields.push("First Name");
      if (!data?.lastName) missingFields.push("Last Name");
      if (!data?.email) missingFields.push("Email");
      if (!data?.phone) missingFields.push("Phone Number");
      if (!data?.gender) missingFields.push("Gender");
      if (!data?.password) missingFields.push("Password");
      if (!data?.confirmPassword) missingFields.push("Confirm Password");

      if (missingFields.length > 0) {
        const formattedFields =
          missingFields.length > 1
            ? missingFields.slice(0, -1).join(", ") +
              " and " +
              missingFields.slice(-1)
            : missingFields[0];
        throw `${formattedFields} ${
          missingFields.length === 1 ? "is" : "are"
        } required!`;
      }

      if (data?.password !== data?.confirmPassword)
        throw "Passwords do not match.";

      // Strong password regex: at least 8 chars, one uppercase, one lowercase, one number, one special char
      const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;

      if (!strongPasswordRegex.test(data.password))
        throw "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.";

      const res = await api.post("/auth/register/", {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data?.company || null,
        gender: Number(data.gender),
        password: data.password,
        user_type: 4,
      });

      // auto-login after signup
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
      if (typeof error === "string") throw { detail: error };
      throw error.response?.data || { detail: "Network error!" };
    } finally {
      set({ loading: false });
    }
  },

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
      if (typeof error === "string") throw { detail: error };
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
      if (typeof error === "string") throw { detail: error };
      throw error.response?.data || { detail: "Network error!" };
    } finally {
      set({ loading: false });
    }
  },

  refreshAccessToken: async () => {
    try {
      const refresh = get().refreshToken;
      const res = await api.post("/auth/token/refresh/", { refresh });
      const newAccess = res.data.access;
      localStorage.setItem("accessToken", newAccess);
      set({ accessToken: newAccess });
    } catch {
      set({ accessToken: null, refreshToken: null, user: null });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  },

  requestPasswordReset: async (email: string) => {
    set({ loading: true });
    try {
      await api.post("/auth/request-password-reset-email/", { email });
    } catch (error: any) {
      console.error("Password reset request failed:", error);
      if (error.response?.status === 404) {
        throw { detail: "Email not found. Please check your email address." };
      }
      throw error.response?.data || { detail: "Failed to send reset email. Please try again." };
    } finally {
      set({ loading: false });
    }
  },

  verifyPasswordResetToken: async (uidb64: string, token: string) => {
    try {
      const response = await api.get(`/auth/password-reset/${uidb64}/${token}/`);
      return response.data;
    } catch (error: any) {
      console.error("Token verification failed:", error);
      if (error.response?.status === 400) {
        throw { detail: "Invalid or expired token. Please request a new password reset link." };
      }
      throw error.response?.data || { detail: "Failed to verify token. Please try again." };
    }
  },

}));
