import { resolve } from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@flowdoc/vnext-core": resolve(import.meta.dirname, "src/index.ts"),
      "@flowdoc/storage-file-json": resolve(import.meta.dirname, "packages/storage-file-json/src/index.ts"),
      "@flowdoc/internal-alpha-runner": resolve(import.meta.dirname, "packages/internal-alpha-runner/src/index.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
})
