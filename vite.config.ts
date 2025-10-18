import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  envPrefix: "DRAMA_LLM",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    host: true, // or "0.0.0.0"
    port: 4173,
    allowedHosts: true, // for wider compatibility, only for dev
  },
});
