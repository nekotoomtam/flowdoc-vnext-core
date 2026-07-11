import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { runVNextDocumentV4Operation } from "../src/index.js"

function fixture(): unknown {
  return JSON.parse(readFileSync(
    new URL("../fixtures/product-report-v4-migrated-minimal.flowdoc.json", import.meta.url),
    "utf8",
  ))
}

describe("document v4 operation kernel", () => {
  it("reorders a block within its existing parent and returns retained operation facts", () => {
    const source = fixture()
    const before = JSON.stringify(source)
    const result = runVNextDocumentV4Operation(source, {
      kind: "node.reorder",
      nodeId: "title",
      source: "user",
      toIndex: 2,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.issues.map((item) => item.message).join("\n"))
    const section = result.package.document.document.sections[0]
    expect(section.nodes["zone-cover-body"]).toMatchObject({
      childIds: ["summary-columns", "detail-table", "title"],
    })
    expect(result.operation).toMatchObject({
      historyPolicy: { durableIntent: "structure", kind: "single-entry" },
      kind: "node.reorder",
      renderInvalidation: { lane: "node-structure" },
      scope: {
        nodeIds: ["title"],
        parentNodeIds: ["zone-cover-body"],
        sectionIds: ["section-cover"],
        zoneIds: ["zone-cover-body"],
      },
      targetNodeIds: ["title"],
      validationPolicy: "full",
    })
    expect(JSON.stringify(source)).toBe(before)
  })

  it("rejects internal structural nodes and out-of-range sibling indexes", () => {
    expect(runVNextDocumentV4Operation(fixture(), {
      kind: "node.reorder",
      nodeId: "detail-header-row",
      toIndex: 0,
    })).toMatchObject({ ok: false, reason: "unsupported-target" })
    expect(runVNextDocumentV4Operation(fixture(), {
      kind: "node.reorder",
      nodeId: "title",
      toIndex: 3,
    })).toMatchObject({ ok: false, reason: "invalid-command" })
  })

  it("rejects non-v4 packages without routing through the active operation kernel", () => {
    const active = JSON.parse(readFileSync(
      new URL("../fixtures/product-report-vnext-minimal.flowdoc.json", import.meta.url),
      "utf8",
    ))
    expect(runVNextDocumentV4Operation(active, {
      kind: "node.reorder",
      nodeId: "title",
      toIndex: 1,
    })).toMatchObject({ ok: false, reason: "invalid-document", package: null })
  })
})
