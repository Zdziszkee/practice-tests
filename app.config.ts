import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    preset: "github_pages",
    prerender: {
      crawlLinks: true,
    },
  },
});
