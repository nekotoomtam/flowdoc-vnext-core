import { describe, expect, it } from "vitest"
import type { AuthoredNode, DocumentNode, TextBlockNode, TextBlockRole } from "../src/schema/document.js"
import {
  createVNextOperationHistoryRecord,
  createVNextOperationRenderInvalidation,
  createVNextOperationScopeFromNodes,
  getSupportedVNextOperationKinds,
  replayVNextOperationHistoryWithRunner,
  runVNextOperation,
  VNEXT_OPERATION_KINDS,
  VNEXT_OPERATION_REGISTRY,
} from "../src/index.js"
import { buildRelationshipGraph } from "../src/graph/relationshipGraph.js"

function pt(value: number) {
  return { value, unit: "pt" as const }
}

function textBlock(id: string, text: string, role: TextBlockRole = { role: "paragraph" }): TextBlockNode {
  return {
    id,
    type: "text-block",
    role,
    props: {},
    children: [{ id: `${id}-text`, type: "text", text }],
  }
}

function docWithNodes(nodes: Record<string, AuthoredNode>, bodyChildIds: string[]): DocumentNode {
  return {
    version: 3,
    document: {
      id: "operation-kernel-doc",
      meta: { title: "Operation Kernel Test" },
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

describe("vNext operation kernel contracts", () => {
  it("keeps the operation registry aligned with supported command kinds", () => {
    expect(VNEXT_OPERATION_REGISTRY.map((entry) => entry.kind)).toEqual(VNEXT_OPERATION_KINDS)
    expect(getSupportedVNextOperationKinds()).toEqual(VNEXT_OPERATION_KINDS)
    expect(VNEXT_OPERATION_REGISTRY.find((entry) => entry.kind === "text-block.text.replace")).toMatchObject({
      group: "text-block",
      defaultHistoryIntent: "content",
      defaultInvalidationLane: "text-content",
    })
  })

  it("builds operation scope and render invalidation without the operation applier", () => {
    const doc = docWithNodes({
      title: textBlock("title", "Title", { role: "heading", level: 1 }),
    }, ["title"])
    const graph = buildRelationshipGraph(doc)
    const scope = createVNextOperationScopeFromNodes(graph, ["title"], ["body-zone"])
    const invalidation = createVNextOperationRenderInvalidation("text-content", scope)

    expect(scope).toMatchObject({
      sectionIds: ["section-main"],
      zoneIds: ["body-zone"],
      nodeIds: ["title"],
      parentNodeIds: ["body-zone"],
      textBlockIds: ["title"],
    })
    expect(invalidation).toMatchObject({
      lane: "text-content",
      affectedNodeIds: ["title"],
      affectedSectionIds: ["section-main"],
      pageScope: { kind: "unknown", reason: "pagination-not-integrated" },
    })
  })

  it("replays history through an injected operation runner", () => {
    const doc = docWithNodes({
      title: textBlock("title", "Title", { role: "heading", level: 1 }),
    }, ["title"])
    const result = runVNextOperation(doc, {
      kind: "text-block.text.replace",
      nodeId: "title",
      children: [{ id: "title-text", type: "text", text: "Updated" }],
    })

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.issues.map((issue) => issue.message).join("\n"))

    const historyRecord = createVNextOperationHistoryRecord(result)
    const replay = replayVNextOperationHistoryWithRunner(doc, [historyRecord], runVNextOperation)

    expect(replay).toMatchObject({
      ok: true,
      replayedCount: 1,
      skippedRejectedCount: 0,
    })
    if (!replay.ok) throw new Error(replay.issues.map((issue) => issue.message).join("\n"))
    const title = replay.document.document.sections[0].nodes.title
    expect(title?.type).toBe("text-block")
    if (title?.type !== "text-block") throw new Error("Expected text block.")
    expect(title.children[0]).toMatchObject({ type: "text", text: "Updated" })
  })
})

