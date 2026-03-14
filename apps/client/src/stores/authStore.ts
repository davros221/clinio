import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthData } from "@clinio/api";
import { STORE_KEYS } from "./storeKeys.ts";

interface AuthState {
  accessToken: string | null;
  user: AuthData | null;
  login: (accessToken: string, user: AuthData) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,

      login: (accessToken, user) => set({ accessToken, user }),

      logout: () => set({ accessToken: null, user: null }),
    }),
    {
      name: STORE_KEYS.AUTH,
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    }
  )
);
