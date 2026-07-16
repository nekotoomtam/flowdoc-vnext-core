import { createServer } from "vite"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)))
const repoRoot = resolve(packageRoot, "../..")
const server = await createServer({
  root: repoRoot,
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
})

try {
  const runtime = await server.ssrLoadModule(
    "/packages/pdf-renderer-pilot/scripts/build-canonical-report-proof-runtime.ts",
  )
  const output = await runtime.buildCanonicalReportSourceDataProof()
  process.stdout.write(`${output.pdfPath}\n${output.summaryPath}\n`)
} finally {
  await server.close()
}
