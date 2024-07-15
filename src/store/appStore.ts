import { create } from "zustand";

type AppStore = {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  authenticated: boolean;
  setAuthenticated: (authenticated: boolean) => void;
};
export const useAppStore = create<AppStore>((set) => ({
  theme: "light",
  setTheme: (theme) => {
    set({ theme });
  },
  authenticated: false,
  setAuthenticated: (authenticated) => {
    set({ authenticated });
  },
}));
