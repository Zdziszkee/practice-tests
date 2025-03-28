import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  ssr: true,
  server: {
    baseURL: "",
    preset: "static",
    prerender: {
      crawlLinks: true,
    },
  },
});
