import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    conditions: ["development"],
  },
  server: {
    proxy: {
      "/socket.io": {
        target: "http://127.0.0.1:3000",
        ws: true,
      },
    },
  },
});
