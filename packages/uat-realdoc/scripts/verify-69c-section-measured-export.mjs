import { spawnSync } from "node:child_process"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createServer } from "vite"

function option(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? null : process.argv[index + 1] ?? null
}

const scriptPath = fileURLToPath(import.meta.url)
const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)))
const repoRoot = resolve(packageRoot, "../..")

async function loadRuntime() {
  const server = await createServer({
    root: repoRoot,
    appType: "custom",
    logLevel: "error",
    resolve: { alias: { "@flowdoc/vnext-core": resolve(repoRoot, "src/index.ts") } },
    server: { middlewareMode: true, hmr: false },
  })
  const runtime = await server.ssrLoadModule(
    "/packages/uat-realdoc/scripts/verify-69c-section-measured-export-runtime.ts",
  )
  return { server, runtime }
}

const restartProbe = option("--restart-probe")
if (restartProbe != null) {
  const { server, runtime } = await loadRuntime()
  try {
    const result = await runtime.render69cUatRestartProbe({ probePath: restartProbe })
    process.stdout.write(`${JSON.stringify(result)}\n`)
  } finally {
    await server.close()
  }
} else {
  const semanticDirectory = option("--semantic-dir")
  if (semanticDirectory == null) {
    throw new Error("usage: node packages/uat-realdoc/scripts/verify-69c-section-measured-export.mjs --semantic-dir <semantic-directory> [--print-only] [--update-fixture] [--output <pdf-path>]")
  }
  const { server, runtime } = await loadRuntime()
  try {
    const result = await runtime.verify69cUatSectionMeasuredExport({ semanticDirectory })
    const restarted = spawnSync(process.execPath, [scriptPath, "--restart-probe", result.restartProbePath], {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 4 * 1024 * 1024,
    })
    if (restarted.status !== 0) {
      throw new Error(`69C fresh-process restart probe failed:\n${restarted.stderr || restarted.stdout}`)
    }
    const restartEvidence = JSON.parse(restarted.stdout)
    if (JSON.stringify(restartEvidence) !== JSON.stringify(result.restartExpected)) {
      throw new Error(`69C fresh-process restart evidence drifted: ${JSON.stringify(restartEvidence)}`)
    }
    const evidence = {
      ...result.evidence,
      restart: {
        freshProcessRenderEqual: true,
        ...restartEvidence,
      },
    }
    const fixturePath = resolve(packageRoot, "fixtures/69c-section-2-1-measured-export-evidence.v1.json")
    if (process.argv.includes("--update-fixture")) {
      await mkdir(dirname(fixturePath), { recursive: true })
      await writeFile(fixturePath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8")
    } else if (!process.argv.includes("--print-only")) {
      const retained = JSON.parse(await readFile(fixturePath, "utf8"))
      if (JSON.stringify(evidence) !== JSON.stringify(retained)) {
        throw new Error("69C section 2.1 measured export evidence drifted from the retained fixture")
      }
    }
    const outputPath = resolve(option("--output") ?? resolve(repoRoot, "output/pdf/flowdoc-69c-uat-section-2-1-realdoc-d.pdf"))
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, Buffer.from(result.pdfBytes))
    process.stdout.write(`${JSON.stringify({ ...evidence, output: { pdfPath: outputPath } }, null, 2)}\n`)
  } finally {
    await server.close()
  }
}
