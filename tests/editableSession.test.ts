import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createVNextEditableSession,
  safeCreateVNextEditableSession,
  serializeFlowDocPackageV2DocumentVNext,
} from "../src/index.js"

function fixtureValue(name: string): unknown {
  const fixtureUrl = new URL(`../fixtures/${name}`, import.meta.url)
  return JSON.parse(readFileSync(fixtureUrl, "utf8")) as unknown
}

describe("vNext editable authoring session", () => {
  it("creates a pure editable session from canonical package input", () => {
    const session = createVNextEditableSession(
      fixtureValue("product-report-vnext.flowdoc.json"),
      { source: "fixture" },
    )

    expect(session).toMatchObject({
      source: "vnext-editable-session",
      sourceKind: "fixture",
      packageVersion: 2,
      documentVersion: 3,
      selection: { kind: "none" },
      revisions: {
        document: 0,
        selection: 0,
        dirtyScopes: 0,
      },
    })
    expect(session.document).toBe(session.package.document)
    expect(session.graph.nodesById.size).toBeGreaterThan(0)
    expect(session.dirtyScopes.size).toBe(0)
    expect(session.diagnostics.graphIssueCount).toBe(0)
    expect(session.diagnostics.keyData.status).toBe("ready")
  })

  it("rejects raw current-runtime-shaped documents before creating a session", () => {
    const result = safeCreateVNextEditableSession({
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

  it("keeps selection, revisions, and dirty scopes outside serialized packages", () => {
    const session = createVNextEditableSession(fixtureValue("product-report-vnext-minimal.flowdoc.json"))
    const serialized = serializeFlowDocPackageV2DocumentVNext(session.package)
    const serializedJson = JSON.stringify(serialized)

    expect(serializedJson).not.toContain("vnext-editable-session")
    expect(serializedJson).not.toContain("selection")
    expect(serializedJson).not.toContain("dirtyScopes")
    expect(serializedJson).not.toContain("revisions")
    expect(serialized.document.document.id).toBe(session.document.document.id)
  })

  it("exposes session-only selection shapes without requiring DOM state", () => {
    const session = createVNextEditableSession(fixtureValue("product-report-vnext-minimal.flowdoc.json"))

    const textSelection = {
      kind: "text" as const,
      textBlockId: "title",
      anchorOffset: 0,
      focusOffset: 7,
    }

    expect(session.selection).toEqual({ kind: "none" })
    expect(textSelection).toMatchObject({
      kind: "text",
      textBlockId: "title",
    })
  })

  it("keeps editable session source independent from parent runtime, DOM, layout, and old names", () => {
    const sourceUrl = new URL("../src/authoring/editableSession.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toMatch(/\bReact\b/)
    expect(source).not.toMatch(/\bdocument\.querySelector\b/)
    expect(source).not.toMatch(/\bdocument\.createElement\b/)
    expect(source).not.toMatch(/\bHTMLElement\b/)
    expect(source).not.toMatch(/\bwindow\./)
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toContain("runVNextLayoutPipeline")
    expect(source).not.toContain("flow-row")
    expect(source).not.toContain("flow-stack")
  })
})
