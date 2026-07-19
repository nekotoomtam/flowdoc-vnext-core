import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createServer } from "vite"

function option(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? null : process.argv[index + 1] ?? null
}

const semanticDirectory = option("--semantic-dir")
if (semanticDirectory == null) {
  throw new Error("usage: node packages/uat-realdoc/scripts/verify-69c-section-resolution.mjs --semantic-dir <semantic-directory> [--print-only]")
}

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)))
const repoRoot = resolve(packageRoot, "../..")
const server = await createServer({
  root: repoRoot,
  appType: "custom",
  logLevel: "error",
  resolve: { alias: { "@flowdoc/vnext-core": resolve(repoRoot, "src/index.ts") } },
  server: { middlewareMode: true, hmr: false },
})

try {
  const runtime = await server.ssrLoadModule(
    "/packages/uat-realdoc/scripts/verify-69c-section-resolution-runtime.ts",
  )
  const evidence = await runtime.verify69cUatSectionResolution({ semanticDirectory })
  const fixturePath = resolve(packageRoot, "fixtures/69c-section-2-1-resolution-evidence.v1.json")
  if (process.argv.includes("--update-fixture")) {
    await writeFile(fixturePath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8")
  } else if (!process.argv.includes("--print-only")) {
    const retained = JSON.parse(await readFile(resolve(
      packageRoot,
      "fixtures/69c-section-2-1-resolution-evidence.v1.json",
    ), "utf8"))
    if (JSON.stringify(evidence) !== JSON.stringify(retained)) {
      throw new Error("69C section 2.1 resolution evidence drifted from the retained fixture")
    }
  }
  process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`)
} finally {
  await server.close()
}
