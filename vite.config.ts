import { cloudflare } from "@cloudflare/vite-plugin"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"

export default defineConfig(({ mode }) => ({
  plugins:
    mode === "test"
      ? [react()]
      : [
          ...cloudflare({ viteEnvironment: { name: "ssr" } }),
          ...tanstackStart({
            prerender: {
              enabled: true,
              autoStaticPathsDiscovery: false,
              crawlLinks: false,
              failOnError: true,
            },
            pages: [{ path: "/", prerender: { enabled: true } }],
          }),
          react(),
        ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  lint: {
    plugins: ["react", "typescript", "unicorn", "jsx-a11y"],
    categories: { correctness: "error" },
    env: { browser: true, node: true, es2024: true },
    rules: {
      "no-console": "off",
      "react/no-unescaped-entities": "off",
      "react/react-in-jsx-scope": "off",
      // Browser capabilities and particles are initialized after hydration.
      "react/set-state-in-effect": "off",
    },
    ignorePatterns: ["cloudflare-env.d.ts", "src/routeTree.gen.ts", "dist/**", "public/**"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    ignorePatterns: ["cloudflare-env.d.ts", "src/routeTree.gen.ts"],
    semi: false,
    singleQuote: false,
  },
}))
