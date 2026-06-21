import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8")) as unknown
}

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("template builder sandbox boundary", () => {
  it("keeps the sandbox as an extractable package outside root core scripts", () => {
    const rootPackage = readJson("../package.json") as {
      scripts: Record<string, string>
      dependencies: Record<string, string>
      devDependencies: Record<string, string>
      files: string[]
    }
    const sandboxPackage = readJson("../examples/template-builder-sandbox/package.json") as {
      scripts: Record<string, string>
      dependencies: Record<string, string>
      devDependencies: Record<string, string>
    }

    expect(sandboxPackage.dependencies["@flowdoc/vnext-core"]).toBe("file:../..")
    expect(sandboxPackage.scripts).toMatchObject({
      build: expect.stringContaining("build-snapshot"),
      check: expect.stringContaining("tsc"),
      dev: expect.stringContaining("serve"),
    })
    expect(rootPackage.files).not.toContain("examples")
    expect(rootPackage.dependencies).not.toHaveProperty("react")
    expect(rootPackage.devDependencies).not.toHaveProperty("vite")
    expect(rootPackage.scripts).not.toHaveProperty("dev")
  })

  it("imports core only through the public package boundary", () => {
    const bridge = readText("../examples/template-builder-sandbox/src/coreBoundary.ts")
    const tsconfig = readText("../examples/template-builder-sandbox/tsconfig.json")

    expect(bridge).toContain('from "@flowdoc/vnext-core"')
    expect(bridge).not.toMatch(/from\s+["']\.\.\/\.\.\/src/)
    expect(bridge).not.toMatch(/from\s+["']\.\.\/\.\.\/\.\.\/src/)
    expect(tsconfig).toContain('"@flowdoc/vnext-core"')
  })

  it("keeps the sandbox free of parent editor and route dependencies", () => {
    const files = [
      "../examples/template-builder-sandbox/src/coreBoundary.ts",
      "../examples/template-builder-sandbox/scripts/build-snapshot.ts",
      "../examples/template-builder-sandbox/public/app.js",
      "../examples/template-builder-sandbox/public/styles.css",
    ].map(readText).join("\n")

    expect(files).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(files).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(files).not.toContain("/api/paginate")
    expect(files).not.toContain("/api/export")
    expect(files).not.toContain("FlowDocEditor")
  })

  it("carries core-derived relationship facts in the generated snapshot", () => {
    const snapshot = readJson("../examples/template-builder-sandbox/public/sandbox-snapshot.json") as {
      sections: Array<{ zones: Array<Record<string, unknown> & { children: Array<Record<string, unknown>> }> }>
      actionLanes: Array<{ status: string }>
    }
    const coverZone = snapshot.sections[0].zones[0]
    const coverText = coverZone.children[0]

    expect(coverZone).toMatchObject({
      id: "cover-first-header",
      type: "zone",
      sectionId: "section-cover",
      zoneId: "cover-first-header",
      parentId: "section-cover",
      parentKind: "section",
      depth: 0,
      path: ["cover-first-header"],
      canBeDeleted: false,
      canBeDuplicated: false,
      canBeReordered: false,
    })
    expect(coverText).toMatchObject({
      id: "cover-header-label",
      type: "text-block",
      sectionId: "section-cover",
      zoneId: "cover-first-header",
      parentId: "cover-first-header",
      parentKind: "zone",
      depth: 1,
      path: ["cover-first-header", "cover-header-label"],
      canContainText: true,
      canBeDeleted: true,
      canBeDuplicated: true,
      canBeReordered: true,
    })
    expect(new Set(snapshot.actionLanes.map((action) => action.status))).toEqual(
      new Set(["wired", "planned", "blocked"]),
    )
  })

  it("keeps selected node state browser-only", () => {
    const snapshotText = readText("../examples/template-builder-sandbox/public/sandbox-snapshot.json")
    const appSource = readText("../examples/template-builder-sandbox/public/app.js")

    expect(snapshotText).not.toContain("selectedId")
    expect(snapshotText).not.toContain("selectionSource")
    expect(appSource).toContain("selectedId")
    expect(appSource).toContain("selectionSource")
    expect(appSource).toContain('closest("[data-node-id]")')
  })
})
