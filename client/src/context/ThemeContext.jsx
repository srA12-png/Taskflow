import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "taskflow:theme";
const THEMES = ["light", "dark", "system"];

const ThemeContext = createContext(null);

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(stored) ? stored : "system";
  } catch {
    // Private mode / storage disabled: fall back without crashing.
    return "system";
  }
}

function prefersDark() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readStoredTheme);
  const [systemDark, setSystemDark] = useState(prefersDark);

  // Follow OS changes while the user has chosen "system".
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event) => setSystemDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Persisting the preference is a nice-to-have; ignore storage errors.
    }
  }, [theme, resolvedTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const nextDark =
        current === "system" ? !prefersDark() : current !== "dark";
      return nextDark ? "dark" : "light";
    });
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }
  return context;
}
