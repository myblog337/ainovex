import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Keep the first render deterministic so pre-rendered HTML hydrates without
  // a theme mismatch. The saved preference is applied immediately after mount.
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ainovex-theme") as Theme | null;
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.style.colorScheme = "dark";
      document.body.className =
        "bg-[#060d1b] text-slate-100 antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200";
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.colorScheme = "light";
      document.body.className =
        "bg-[#f8fafc] text-slate-900 antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200";
    }

    try {
      localStorage.setItem("ainovex-theme", theme);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
