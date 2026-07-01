import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Keep paths relative so Hostico subfolder deploys work
  base: "./",
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 800,
  },
});
