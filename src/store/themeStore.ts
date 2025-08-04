import { create } from "zustand";

type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  isDarkMode: boolean;
  setMode: (mode: ThemeMode) => void;
}

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const applyTheme = (mode: ThemeMode) => {
  const effective = mode === "system" ? getSystemTheme() : mode;
  document.documentElement.classList.toggle("dark", effective === "dark");
  return effective === "dark";
};

export const useThemeStore = create<ThemeState>((set) => {
  let storedMode: ThemeMode = "light";
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("theme") as ThemeMode;
    if (["light", "dark", "system"].includes(saved)) storedMode = saved;
  }

  const initialIsDark =
    typeof window !== "undefined" ? applyTheme(storedMode) : false;

  return {
    mode: storedMode,
    isDarkMode: initialIsDark,
    setMode: (mode: ThemeMode) =>
      set(() => {
        localStorage.setItem("theme", mode);
        const isDark = applyTheme(mode);
        return { mode, isDarkMode: isDark };
      }),
  };
});
