import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    proxy: {
      // 開発環境：Viteがbackend:8000へ転送してくれる
      "/api": { target: "http://backend:8000", changeOrigin: true }
    },
  },
  // 本番環境
  build: {
    outDir: 'dist',
    base: '/', // 本番でCloudFront等から配信する際の標準設定
  }
});