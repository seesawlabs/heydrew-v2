"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  isAuthenticated: boolean;
  email: string;
  token: string;
  login: (email: string, token: string) => void;
  logout: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      email: "",
      token: "",
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      login: (email, token) =>
        set({ isAuthenticated: true, email, token }),
      logout: () =>
        set({ isAuthenticated: false, email: "", token: "" }),
    }),
    {
      name: "heydrew_auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
