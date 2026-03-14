import { useAuthStore } from "../stores/authStore.ts";

export const useUser = () => useAuthStore((state) => state.user);
