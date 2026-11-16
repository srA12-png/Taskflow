import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // The session lives in an HttpOnly cookie, so the only way to know whether
  // someone is signed in is to ask the API once on load.
  useEffect(() => {
    let active = true;

    api
      .get("/auth/me")
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch((error) => {
        if (error.status !== 401 && error.status !== 0) {
          console.warn("[auth] session check failed:", error.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await api.post("/auth/login", credentials);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (details) => {
    const data = await api.post("/auth/register", details);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (name) => {
    const data = await api.patch("/users/me", { name });
    setUser(data.user);
    return data.user;
  }, []);

  const changePassword = useCallback(
    (payload) => api.patch("/users/me/password", payload),
    [],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, login, register, logout, updateProfile, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}
