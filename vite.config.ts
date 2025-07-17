import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  // This root is for the Vite dev server and build process, keep it as is.
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  test: {
    // Add this root to make Vitest scan the entire project for tests.
    root: path.resolve(import.meta.dirname),
    globals: true,
    environment: 'jsdom',
    // Update setupFiles path to be relative to the new test root.
    setupFiles: './client/src/test/setup.ts',
  },
});