import { createServer } from "vite"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)))
const repoRoot = resolve(packageRoot, "../..")
const server = await createServer({
  root: repoRoot,
  appType: "custom",
  logLevel: "error",
  resolve: {
    alias: {
      "@flowdoc/vnext-core": resolve(repoRoot, "src/index.ts"),
    },
  },
  server: { middlewareMode: true },
})

try {
  const runtime = await server.ssrLoadModule(
    "/packages/pdf-renderer-pilot/scripts/build-canonical-report-display-formatting-runtime.ts",
  )
  const output = runtime.buildCanonicalReportDisplayFormatting()
  process.stdout.write(`${output.bundlePath}\n${output.qaPath}\n`)
} finally {
  await server.close()
}
