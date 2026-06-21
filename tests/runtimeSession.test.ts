import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createVNextRuntimeSession,
  safeCreateVNextRuntimeSession,
} from "../src/index.js"

function fixtureValue(name: string): unknown {
  const fixtureUrl = new URL(`../fixtures/${name}`, import.meta.url)
  return JSON.parse(readFileSync(fixtureUrl, "utf8")) as unknown
}

describe("vNext runtime session", () => {
  it("creates a core runtime session from canonical package input", () => {
    const session = createVNextRuntimeSession(
      fixtureValue("product-report-vnext.flowdoc.json"),
      { source: "fixture" },
    )

    expect(session).toMatchObject({
      source: "vnext-runtime-session",
      sourceKind: "fixture",
      packageVersion: 2,
      documentVersion: 3,
    })
    expect(session.package.id).toBe(session.document.document.id)
    expect(session.fields.version).toBe(1)
    expect(session.graph.nodesById.size).toBeGreaterThan(0)
    expect(session.diagnostics.supportedOperationKinds).toEqual(expect.arrayContaining([
      "node.delete",
      "text-block.text.replace",
      "table.row.insert",
      "table.column.delete",
    ]))
  })

  it("rejects raw current-runtime-shaped documents before building a session", () => {
    const result = safeCreateVNextRuntimeSession({
      version: 3,
      document: {
        id: "raw-doc",
        meta: { title: "Raw Doc" },
        sections: [],
      },
    })

    expect(result).toMatchObject({
      ok: false,
      reason: "unsupported-version",
    })
  })

  it("keeps runtime session source independent from parent runtime and old names", () => {
    const sourceUrl = new URL("../src/runtime/session.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toContain("flow-row")
    expect(source).not.toContain("flow-stack")
    expect(source).not.toContain("paragraph.split")
  })
})

