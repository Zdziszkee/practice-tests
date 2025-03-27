import { defineConfig } from "@solidjs/start/config";
const BASE_PATH = "/your-repo-name";

// https://docs.solidjs.com/solid-start/building-your-application/route-prerendering
export default defineConfig({
  server: {
    preset: "static",
    prerender: {
      crawlLinks: true,
    },
  },
});
