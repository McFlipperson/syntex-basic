import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "SyntexWidget",
      formats: ["iife"],
      fileName: () => "syntex-widget.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    target: "es2020",
    sourcemap: true,
  },
});
