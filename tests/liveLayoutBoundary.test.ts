import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { AuthoredNode, DocumentNode, InlineNode, TextBlockNode } from "../src/schema/document.js"
import {
  appendVNextAuthoringIntentHistoryResult,
  resolveVNextLiveLayoutBoundary,
  runVNextTextTransaction,
} from "../src/index.js"

function pt(value: number) {
  return { value, unit: "pt" as const }
}

function textBlock(id: string, children: string | InlineNode[]): TextBlockNode {
  return {
    id,
    type: "text-block",
    role: { role: "paragraph" },
    props: {},
    children: typeof children === "string" ? [{ id: `${id}-text`, type: "text", text: children }] : children,
  }
}

function docWithNodes(nodes: Record<string, AuthoredNode>, bodyChildIds: string[]): DocumentNode {
  return {
    version: 3,
    document: {
      id: "live-layout-boundary-doc",
      meta: { title: "Live Layout Boundary Test" },
      sections: [{
        id: "section-main",
        type: "section",
        page: {
          size: "A4",
          orientation: "portrait",
          margin: { top: pt(72), right: pt(72), bottom: pt(72), left: pt(72) },
        },
        zoneIds: ["body-zone"],
        nodes: {
          "body-zone": { id: "body-zone", type: "zone", role: "body", childIds: bodyChildIds },
          ...nodes,
        },
      }],
    },
  }
}

function liveLayoutDoc(children: string | InlineNode[]): DocumentNode {
  return docWithNodes({ body: textBlock("body", children) }, ["body"])
}

describe("vNext live layout boundary", () => {
  it("creates no layout request for selection-only impact", () => {
    const result = resolveVNextLiveLayoutBoundary({
      kind: "selection",
      selection: { kind: "text", textBlockId: "body", anchorOffset: 0, focusOffset: 5 },
      visibleRange: {
        kind: "section-window",
        sectionId: "section-main",
        zoneId: "body-zone",
        startNodeId: "body",
        endNodeId: "body",
        overscanBefore: 1,
        overscanAfter: 1,
      },
    })

    expect(result).toEqual({
      kind: "no-layout-request",
      reason: "selection-only",
      visibleRange: {
        kind: "section-window",
        sectionId: "section-main",
        zoneId: "body-zone",
        startNodeId: "body",
        endNodeId: "body",
        overscanBefore: 1,
        overscanAfter: 1,
      },
      dirtyScopes: [],
      affected: {
        sectionIds: [],
        zoneIds: [],
        nodeIds: [],
        parentNodeIds: [],
        textBlockIds: [],
        tableIds: [],
      },
      freshness: {
        liveLayout: "fresh",
        exactGeneration: {
          status: "unchanged",
          reason: "selection-only",
          finalTruth: "measured-pagination",
        },
      },
      request: null,
    })
  })

  it("scopes text impact to the affected text-block and parent", () => {
    const doc = liveLayoutDoc("Hello")
    const tx = runVNextTextTransaction(doc, {
      kind: "text.insert",
      position: { textBlockId: "body", offset: 5 },
      text: "!",
      inlineId: "body-exclamation",
    })

    expect(tx.ok).toBe(true)
    if (!tx.ok) throw new Error(tx.issues.map((issue) => issue.message).join("\n"))

    const records = appendVNextAuthoringIntentHistoryResult([], tx)
    const result = resolveVNextLiveLayoutBoundary({
      kind: "authoring-history",
      records,
      visibleRange: {
        kind: "section-window",
        sectionId: "section-main",
        zoneId: "body-zone",
        startNodeId: "body",
        endNodeId: "body",
      },
    })

    expect(result.kind).toBe("layout-request")
    if (result.kind !== "layout-request") throw new Error("expected layout request")
    expect(result.reason).toBe("text-content")
    expect(result.affected).toEqual({
      sectionIds: ["section-main"],
      zoneIds: ["body-zone"],
      nodeIds: ["body"],
      parentNodeIds: ["body-zone"],
      textBlockIds: ["body"],
      tableIds: [],
    })
    expect(result.request).toMatchObject({
      kind: "live-layout-request",
      requestId: "live-layout:text-content:text:body,node:body,section:section-main",
      reason: "text-content",
      dirtyScopes: [{ kind: "text-block", textBlockId: "body", parentNodeIds: ["body-zone"] }],
      freshness: {
        liveLayout: "stale",
        exactGeneration: {
          status: "stale",
          reason: "text-content",
          finalTruth: "measured-pagination",
        },
      },
    })
  })

  it("scopes table impact to the affected table region", () => {
    const result = resolveVNextLiveLayoutBoundary({
      kind: "dirty-scopes",
      dirtyScopes: [{
        kind: "table",
        sectionId: "section-main",
        zoneId: "body-zone",
        tableId: "line-items",
        parentNodeIds: ["body-zone"],
      }],
    })

    expect(result.kind).toBe("layout-request")
    if (result.kind !== "layout-request") throw new Error("expected layout request")
    expect(result).toMatchObject({
      reason: "table-region",
      affected: {
        sectionIds: ["section-main"],
        zoneIds: ["body-zone"],
        nodeIds: ["line-items"],
        parentNodeIds: ["body-zone"],
        textBlockIds: [],
        tableIds: ["line-items"],
      },
      request: {
        kind: "live-layout-request",
        requestId: "live-layout:table-region:table:line-items,node:line-items,section:section-main",
        reason: "table-region",
      },
      freshness: {
        liveLayout: "stale",
        exactGeneration: {
          status: "stale",
          reason: "table-region",
          finalTruth: "measured-pagination",
        },
      },
    })
  })

  it("keeps exact generation stale status explicit and measured-pagination-owned", () => {
    const stale = resolveVNextLiveLayoutBoundary({
      kind: "dirty-scopes",
      dirtyScopes: [{
        kind: "node",
        sectionId: "section-main",
        zoneId: "body-zone",
        nodeId: "summary",
        parentNodeIds: ["body-zone"],
      }],
    })
    const unchanged = resolveVNextLiveLayoutBoundary({
      kind: "authoring-history",
      records: [],
    })

    expect(stale.freshness.exactGeneration).toEqual({
      status: "stale",
      reason: "node-structure",
      finalTruth: "measured-pagination",
    })
    expect(unchanged).toMatchObject({
      kind: "no-layout-request",
      reason: "no-dirty-scope",
      freshness: {
        liveLayout: "fresh",
        exactGeneration: {
          status: "unchanged",
          reason: "no-dirty-scope",
          finalTruth: "measured-pagination",
        },
      },
    })
  })

  it("keeps live layout independent from exact layout and export readiness", () => {
    const sourceUrl = new URL("../src/authoring/liveLayoutBoundary.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toContain("runVNextLayoutPipeline")
    expect(source).not.toContain("assessVNextMeasuredPaginationExportReadiness")
    expect(source).not.toContain("buildVNextExportPlan")
    expect(source).not.toContain("rendererConsumption")
  })
})
