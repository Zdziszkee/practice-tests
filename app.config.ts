import { defineConfig } from "@solidjs/start/config";

// Replace with your actual repository name
const REPO_NAME = "practice-tests";

// Check if we're in production without using process.env
const isProduction =
  import.meta.env?.MODE === "production" ||
  process.env.NODE_ENV === "production";

// Base path to use in production
const basePath = isProduction ? `/${REPO_NAME}/` : "/";

export default defineConfig({
  server: {
    preset: "static",
    prerender: {
      crawlLinks: true,
    },
    // Set the base path for routing (if supported in your version)
    baseURL: basePath,
  },

  // Use type assertion for Vite config
  vite: {
    // @ts-ignore - Add base path for assets
    base: basePath,
  } as any,
});
