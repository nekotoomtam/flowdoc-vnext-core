import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { createTemplateBuilderSnapshot } from "../src/coreBoundary.js"

const fixtureUrl = new URL("../../../fixtures/product-report-vnext.flowdoc.json", import.meta.url)
const outputUrl = new URL("../public/sandbox-snapshot.json", import.meta.url)

const fixture = JSON.parse(await readFile(fixtureUrl, "utf8")) as unknown
const snapshot = createTemplateBuilderSnapshot(fixture, {
  fixturePath: "fixtures/product-report-vnext.flowdoc.json",
})

await mkdir(dirname(fileURLToPath(outputUrl)), { recursive: true })
await writeFile(outputUrl, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8")

console.log(`Built sandbox snapshot: ${fileURLToPath(outputUrl)}`)
