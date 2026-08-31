import { access, readdir, readFile } from "node:fs/promises"
import { join, relative } from "node:path"
import { describe, expect, it } from "vitest"

const projectRoot = process.cwd()
const retiredSuperpowersMarkdown = [
  "docs/superpowers/plans/2026-07-21-text-block-complete-geometry-boundary.md",
  "docs/superpowers/specs/2026-07-21-persistent-text-block-spatial-flow-design.md",
  "docs/superpowers/specs/2026-07-27-initial-text-block-authored-box-geometry-design.md",
  "docs/superpowers/specs/2026-07-27-inline-image-line-box-geometry-design.md",
] as const
const activeReferenceFiles = [
  "docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md",
  "tests/liveDraftMr1CompleteGeometryBoundary.test.ts",
  "tests/liveDraftMr1AuthoredBoxGeometry4a.test.ts",
  "tests/liveDraftMr1InlineImageGeometry4b.test.ts",
] as const

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function listFiles(root: string): Promise<string[]> {
  if (!(await pathExists(root))) return []
  const entries = await readdir(root, { withFileTypes: true })
  const children = await Promise.all(entries.map(async (entry) => {
    const path = join(root, entry.name)
    if (entry.isDirectory()) return listFiles(path)
    return entry.isFile() ? [path] : []
  }))
  return children.flat().sort()
}

async function listMarkdownFiles(relativeDir: string): Promise<string[]> {
  const files = await listFiles(join(projectRoot, relativeDir))
  return files
    .filter((path) => path.endsWith(".md"))
    .map((path) => relative(projectRoot, path).replaceAll("\\", "/"))
}

function normalize(value: string): string {
  return value.replace(/\s+/gu, " ")
}

describe("Core documentation authority", () => {
  it("keeps FlowDoc-wide plans in Project Control instead of Core docs/superpowers", async () => {
    for (const path of retiredSuperpowersMarkdown) {
      await expect(pathExists(join(projectRoot, path)), path).resolves.toBe(false)
    }
    await expect(listMarkdownFiles("docs/superpowers")).resolves.toEqual([])

    const agents = normalize(await readFile(join(projectRoot, "AGENTS.md"), "utf8"))
    expect(agents).toContain("Documentation Authority")
    expect(agents).toContain("flowdoc-documentation-authority-policy.md")
    expect(agents).toContain(
      "Do not create product-repository `docs/superpowers/plans` or `docs/superpowers/specs` files for FlowDoc-wide truth",
    )

    const staleReferences = []
    for (const relativePath of activeReferenceFiles) {
      const text = await readFile(join(projectRoot, relativePath), "utf8")
      if (text.includes("docs/superpowers/")) {
        staleReferences.push(relativePath)
      }
    }
    expect(staleReferences).toEqual([])

    const handoff = normalize(await readFile(
      join(projectRoot, "docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md"),
      "utf8",
    ))
    expect(handoff).toContain("Project Control")
    expect(handoff).toContain("text-block/OVERVIEW.md")
    expect(handoff).toContain("live-draft/geometry-and-scene-projection.md")
    expect(handoff).toContain("historical superpowers sources are retired")
  })
})
