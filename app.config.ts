import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  ssr: true,
  server: {
    baseURL: "/practice-tests/",
    preset: "github_pages",
    prerender: {
      crawlLinks: true,
    },
  },
});
