import { resolve } from "path";
// eslint-disable-next-line import/namespace
import { defineConfig } from "vite";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  root: "src/",
  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        week: resolve(__dirname, "src/pages/weather.html"),
        detailed: resolve(__dirname, "src/pages/detailed.html"),
        today: resolve(__dirname, "src/pages/today.html"),
        pollution: resolve(__dirname, "src/pages/pollution.html"),
      },
    },
  },
  define: {
    "import.meta.env": {
      VITE_OPENWEATHER_KEY: process.env.VITE_OPENWEATHER_KEY,
    },
  },
});