import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

type ExportInventory = {
  counts: Map<string, number>
  namedExportBlocks: number
  starExportLines: number
  totalExportDeclarations: number
}

function sourceArea(sourcePath: string): string {
  return sourcePath.includes("/") ? sourcePath.slice(0, sourcePath.indexOf("/")) : sourcePath.replace(/\.js$/, "")
}

function addCount(counts: Map<string, number>, area: string): void {
  counts.set(area, (counts.get(area) ?? 0) + 1)
}

function collectExportInventory(source: string): ExportInventory {
  const counts = new Map<string, number>()
  let namedExportBlocks = 0
  let starExportLines = 0

  for (const line of source.split(/\r?\n/)) {
    const starMatch = /^export \* from "\.\/([^"]+)"/.exec(line)
    if (starMatch) {
      starExportLines += 1
      addCount(counts, sourceArea(starMatch[1]))
      continue
    }

    const namedBlockMatch = /^} from "\.\/([^"]+)"/.exec(line)
    if (namedBlockMatch) {
      namedExportBlocks += 1
      addCount(counts, sourceArea(namedBlockMatch[1]))
    }
  }

  return {
    counts,
    namedExportBlocks,
    starExportLines,
    totalExportDeclarations: starExportLines + namedExportBlocks,
  }
}

describe("core public export boundary review", () => {
  it("keeps the package metadata facts visible in the review", () => {
    const doc = readText("../docs/CORE_PUBLIC_EXPORT_BOUNDARY_REVIEW.md")
    const packageJson = JSON.parse(readText("../package.json")) as {
      exports: Record<string, string>
      name: string
      private: boolean
      types: string
      version: string
    }

    expect(packageJson.name).toBe("@flowdoc/vnext-core")
    expect(packageJson.version).toBe("0.0.0")
    expect(packageJson.private).toBe(true)
    expect(packageJson.types).toBe("./src/index.ts")
    expect(packageJson.exports["."]).toBe("./src/index.ts")
    expect(packageJson.exports["./fixtures/*"]).toBe("./fixtures/*")

    expect(doc).toContain("Status: Project Control remediation evidence for")
    expect(doc).toContain("`core-public-export-boundary-review`")
    expect(doc).toContain("- package name: `@flowdoc/vnext-core`")
    expect(doc).toContain("- version: `0.0.0`")
    expect(doc).toContain("- private: `true`")
    expect(doc).toContain('- root export: `"." -> "./src/index.ts"`')
    expect(doc).toContain('- fixture export: `"./fixtures/*" -> "./fixtures/*"`')
    expect(doc).toContain('- type entrypoint: `"./src/index.ts"`')
  })

  it("keeps the export inventory synchronized with src/index.ts", () => {
    const doc = readText("../docs/CORE_PUBLIC_EXPORT_BOUNDARY_REVIEW.md")
    const inventory = collectExportInventory(readText("../src/index.ts"))

    expect(doc).toContain(`STAR_EXPORT_LINES=${inventory.starExportLines}`)
    expect(doc).toContain(`NAMED_EXPORT_BLOCKS=${inventory.namedExportBlocks}`)
    expect(doc).toContain(`TOTAL_EXPORT_DECLARATIONS=${inventory.totalExportDeclarations}`)

    for (const [area, count] of Array.from(inventory.counts.entries()).sort(([left], [right]) => left.localeCompare(right))) {
      expect(doc).toContain(`| ${area} | ${count} |`)
    }
  })

  it("records the no-go decision without promoting release readiness", () => {
    const doc = readText("../docs/CORE_PUBLIC_EXPORT_BOUNDARY_REVIEW.md")

    expect(doc).toContain("Editor production source keeps the package behind one facade:")
    expect(doc).toContain("`flowdoc-vnext-editor/src/core/coreAdapter.ts`")
    expect(doc).toContain("Backend production source imports `@flowdoc/vnext-core` directly across")
    expect(doc).toContain("NO-GO: do not remove, rename, or narrow the root public entrypoint in this")
    expect(doc).toContain("The next safe public-boundary step is additive, not destructive:")
    expect(doc).toContain("Core, Editor, Backend, and FlowDoc release readiness remain unpromoted.")
    expect(doc).toContain("- No package export changed.")
    expect(doc).toContain("- Release composition")
    expect(doc).toContain("- Project Control system map truth")
  })
})
