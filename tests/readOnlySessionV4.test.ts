import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  safeCreateVNextReadOnlyRuntimeSessionV4,
  safeCreateVNextRuntimeSession,
} from "../src/index.js"

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8"))
}

describe("document v4 read-only runtime session", () => {
  it("builds normalized read indexes without exposing operation capabilities", () => {
    const source = fixture("product-report-v4-migrated-minimal.flowdoc.json")
    const sourceBefore = JSON.stringify(source)
    const result = safeCreateVNextReadOnlyRuntimeSessionV4(source)

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.session).toMatchObject({
      packageVersion: 3,
      documentVersion: 4,
      readOnly: true,
      diagnostics: { graphIssueCount: 0, supportedOperationKinds: [] },
    })
    expect(result.session.graph.childrenByNodeId.get("zone-cover-body")).toEqual([
      "title",
      "summary-columns",
      "detail-table",
    ])
    expect(result.session.graph.nearestByNodeId.get("detail-cell-a-text")).toMatchObject({
      sectionId: "section-cover",
      tableId: "detail-table",
      tableCellId: "detail-cell-a",
      textBlockId: "detail-cell-a-text",
      zoneId: "zone-cover-body",
    })
    expect(result.session.graph.capabilitiesByType["text-block"]).toMatchObject({
      canBeDeleted: true,
      canBeDuplicated: true,
      canBeReordered: true,
      canContainText: false,
    })
    expect(JSON.stringify(source)).toBe(sourceBefore)
  })

  it("indexes block and inline image target packages without enabling mutation", () => {
    const result = safeCreateVNextReadOnlyRuntimeSessionV4(
      fixture("product-report-v4-image-target.flowdoc.json"),
    )

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error("target fixture did not parse")
    expect(result.session.graph.nodesById.get("body-image")).toMatchObject({ type: "image" })
    expect(result.session.graph.capabilitiesByType.image).toMatchObject({
      operationSurface: "utility",
      canBeDeleted: true,
      canBeDuplicated: true,
    })
  })

  it("keeps active v3 and named v4 sessions isolated", () => {
    const target = fixture("product-report-v4-migrated-minimal.flowdoc.json")
    const active = fixture("product-report-vnext-minimal.flowdoc.json")

    expect(safeCreateVNextRuntimeSession(target)).toMatchObject({ ok: false, reason: "unsupported-version" })
    expect(safeCreateVNextReadOnlyRuntimeSessionV4(active)).toMatchObject({ ok: false, reason: "unsupported-version" })
  })
})
