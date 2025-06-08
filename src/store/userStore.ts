import { create } from "zustand";

interface UserTypeState {
  userType: "guest" | "buyer";
  setUserType: (userType: "guest" | "buyer") => void;
}

export const useUserTypeStore = create<UserTypeState>((set) => ({
  userType: "buyer",
  setUserType: (userType) => set(() => ({ userType: userType })),
}));
