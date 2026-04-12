import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: "../../node_modules/.vite/apps/client",
  server: {
    port: 3000,
    host: "localhost",
  },
  preview: {
    port: 3000,
    host: "localhost",
  },
  resolve: {
    conditions: ["@clinio/source"],
    alias: {
      "@api": path.resolve(__dirname, "src/api/index.ts"),
      "@components": path.resolve(__dirname, "src/components/index.ts"),
      "@form": path.resolve(__dirname, "src/form/index.ts"),
      "@hooks": path.resolve(__dirname, "src/hooks/index.ts"),
      "@layout": path.resolve(__dirname, "src/layout/index.ts"),
      "@pages": path.resolve(__dirname, "src/pages/index.ts"),
      "@router": path.resolve(__dirname, "src/router/index.ts"),
      "@utils": path.resolve(__dirname, "src/utils/index.ts"),
    },
  },
  plugins: [react()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: "./dist",
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
