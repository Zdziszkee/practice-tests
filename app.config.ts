import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  ssr: true,
  server: {
    baseURL: "/",
    preset: "github-pages",
    prerender: {
      crawlLinks: true,
      autoSubfolderIndex: true,
    },
  },
});
