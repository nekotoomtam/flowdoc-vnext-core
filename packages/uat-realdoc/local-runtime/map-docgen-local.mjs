import { createServer } from "vite"
import { resolve } from "node:path"

let raw = ""
for await (const chunk of process.stdin) raw += chunk
const input = JSON.parse(raw)
const repoRoot = resolve(import.meta.dirname, "../../..")
const server = await createServer({
  root: repoRoot,
  appType: "custom",
  logLevel: "error",
  resolve: { alias: { "@flowdoc/vnext-core": resolve(repoRoot, "src/index.ts") } },
  server: { middlewareMode: true, hmr: false },
})

try {
  const uat = await server.ssrLoadModule("/packages/uat-realdoc/src/index.ts")
  const mapper = uat.createFlowDocUatGenerationMapperV1()
  process.stdout.write(JSON.stringify(mapper.map(input.payload, input.context)))
} finally {
  await server.close()
}
