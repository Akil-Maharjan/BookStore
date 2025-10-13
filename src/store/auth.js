import { create } from "zustand";

export const useAuth = create((set, get) => ({
  user: (() => {
    try {
      return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
      return null;
    }
  })(),
  token: (() => {
    try {
      return localStorage.getItem("auth_token") || null;
    } catch {
      return null;
    }
  })(),
  loading: true, // start loading until AuthBootstrap finishes

  setAuth: ({ user, token }) => {
    try {
      if (user) localStorage.setItem("auth_user", JSON.stringify(user));
      if (token != null) localStorage.setItem("auth_token", token);
    } catch (e) {
      if (e) {
        /* ignore persist errors */
      }
    }
    set({ user, token });
  },
  clearAuth: () => {
    try {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    } catch (e) {
      if (e) {
        /* ignore persist errors */
      }
    }
    set({ user: null, token: null });
  },
  setLoading: (loading) => set({ loading }),

  isAdmin: () => get().user?.role === "admin",
}));
