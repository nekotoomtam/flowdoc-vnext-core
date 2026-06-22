import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { AuthoredNode, DocumentNode, TextBlockNode, TextBlockRole } from "../src/schema/document.js"
import {
  createStructuralChangePacket,
  runVNextOperation,
  STRUCTURAL_PACKET_SOURCE,
  STRUCTURAL_PACKET_STAGE,
  validateStructuralChangePacket,
} from "../src/index.js"

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
      id: "structural-packet-doc",
      meta: { title: "Structural Packet Test" },
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

function columnsNodeSet(): Record<string, AuthoredNode> {
  return {
    columns: { id: "columns", type: "columns", props: { gap: 12 }, columnIds: ["left", "right"] },
    left: { id: "left", type: "column", props: { widthShare: 50 }, childIds: ["left-text"] },
    right: { id: "right", type: "column", props: { widthShare: 50 }, childIds: ["right-text"] },
    "left-text": textBlock("left-text", "Left"),
    "right-text": textBlock("right-text", "Right"),
  }
}

describe("structural packet contract", () => {
  it("creates an insert packet from an accepted core operation result", () => {
    const doc = docWithNodes({
      first: textBlock("first", "First"),
      second: textBlock("second", "Second"),
    }, ["first", "second"])
    const result = runVNextOperation(doc, {
      kind: "text-block.insert",
      parentNodeId: "body-zone",
      index: 1,
      node: textBlock("inserted", "Inserted", { role: "heading", level: 2 }),
    })
    const packet = createStructuralChangePacket({
      baseRevision: 12,
      beforeDocument: doc,
      result,
    })

    expect(packet).toMatchObject({
      action: "text-block.insert",
      baseRevision: 12,
      nextRevision: 13,
      packetVersion: 1,
      source: STRUCTURAL_PACKET_SOURCE,
      stage: STRUCTURAL_PACKET_STAGE,
      status: "applied",
    })
    expect(packet.nodesAdded.map((node) => node.id)).toEqual(["inserted"])
    expect(packet.nodesUpdated.map((node) => node.id)).toEqual(["body-zone"])
    expect(packet.nodeIdsRemoved).toEqual([])
    expect(packet.parentListPatches).toEqual([{
      after: ["first", "inserted", "second"],
      before: ["first", "second"],
      childField: "childIds",
      nodeId: "inserted",
      op: "insert",
      parentId: "body-zone",
      parentKind: "zone",
      sectionId: "section-main",
      toIndex: 1,
    }])
    expect(packet.changedNodeIds).toEqual(["inserted", "body-zone"])
    expect(packet.affectedParentNodeIds).toEqual(["body-zone"])
    expect(packet.dirtyScopes).toEqual([packet.operation?.scope])
    expect(packet.renderInvalidation).toMatchObject({ lane: "node-structure" })
    expect(validateStructuralChangePacket(packet)).toEqual({ ok: true, issues: [] })
  })

  it("creates a delete packet with removed subtree ids and parent-list removal", () => {
    const doc = docWithNodes({
      intro: textBlock("intro", "Intro"),
      ...columnsNodeSet(),
    }, ["intro", "columns"])
    const result = runVNextOperation(doc, { kind: "node.delete", nodeId: "columns" })
    const packet = createStructuralChangePacket({
      baseRevision: 4,
      beforeDocument: doc,
      nextRevision: 9,
      result,
    })

    expect(packet.nextRevision).toBe(9)
    expect(packet.nodesAdded).toEqual([])
    expect(packet.nodesUpdated.map((node) => node.id)).toEqual(["body-zone"])
    expect(packet.nodeIdsRemoved).toEqual(["columns", "left", "right", "left-text", "right-text"])
    expect(packet.parentListPatches).toEqual([{
      after: ["intro"],
      before: ["intro", "columns"],
      childField: "childIds",
      fromIndex: 1,
      nodeId: "columns",
      op: "remove",
      parentId: "body-zone",
      parentKind: "zone",
      sectionId: "section-main",
    }])
    expect(packet.changedNodeIds).toEqual([
      "body-zone",
      "columns",
      "left",
      "right",
      "left-text",
      "right-text",
    ])
    expect(packet.affectedParentNodeIds).toEqual(["body-zone"])
    expect(validateStructuralChangePacket(packet)).toEqual({ ok: true, issues: [] })
  })

  it("creates a move patch for node reorder results", () => {
    const doc = docWithNodes({
      first: textBlock("first", "First"),
      second: textBlock("second", "Second"),
      third: textBlock("third", "Third"),
    }, ["first", "second", "third"])
    const result = runVNextOperation(doc, { kind: "node.reorder", nodeId: "third", toIndex: 0 })
    const packet = createStructuralChangePacket({
      baseRevision: 20,
      beforeDocument: doc,
      result,
    })

    expect(packet.nodesAdded).toEqual([])
    expect(packet.nodeIdsRemoved).toEqual([])
    expect(packet.nodesUpdated.map((node) => node.id)).toEqual(["body-zone"])
    expect(packet.parentListPatches).toEqual([{
      after: ["third", "first", "second"],
      before: ["first", "second", "third"],
      childField: "childIds",
      fromIndex: 2,
      nodeId: "third",
      op: "move",
      parentId: "body-zone",
      parentKind: "zone",
      sectionId: "section-main",
      toIndex: 0,
    }])
    expect(packet.changedNodeIds).toEqual(["body-zone", "third"])
    expect(packet.operation?.historyPolicy.durableIntent).toBe("structure")
    expect(validateStructuralChangePacket(packet)).toEqual({ ok: true, issues: [] })
  })

  it("creates rejected packets without structural changes or revision advance", () => {
    const doc = docWithNodes({ title: textBlock("title", "Title") }, ["title"])
    const result = runVNextOperation(doc, { kind: "node.delete", nodeId: "body-zone" })
    const packet = createStructuralChangePacket({
      baseRevision: 7,
      beforeDocument: doc,
      nextRevision: 8,
      result,
    })

    expect(packet).toMatchObject({
      action: "node.delete",
      baseRevision: 7,
      failureReason: "unsupported-target",
      nextRevision: 7,
      operation: null,
      renderInvalidation: null,
      status: "rejected",
    })
    expect(packet.nodesAdded).toEqual([])
    expect(packet.nodesUpdated).toEqual([])
    expect(packet.nodeIdsRemoved).toEqual([])
    expect(packet.parentListPatches).toEqual([])
    expect(packet.changedNodeIds).toEqual([])
    expect(packet.affectedParentNodeIds).toEqual([])
    expect(packet.dirtyScopes).toEqual([])
    expect(packet.issues).toEqual([
      expect.objectContaining({ code: "cannot-delete", nodeId: "body-zone" }),
    ])
    expect(validateStructuralChangePacket(packet)).toEqual({ ok: true, issues: [] })
  })

  it("validates foundation packet shape before runtime-store apply phases consume it", () => {
    const doc = docWithNodes({ title: textBlock("title", "Title") }, ["title"])
    const result = runVNextOperation(doc, { kind: "node.delete", nodeId: "title" })
    const packet = createStructuralChangePacket({
      baseRevision: 2,
      beforeDocument: doc,
      result,
    })
    const invalid = {
      ...packet,
      nextRevision: 2,
      parentListPatches: [{
        ...packet.parentListPatches[0],
        nodeId: undefined,
      }],
    }
    const validation = validateStructuralChangePacket(invalid)

    expect(validation.ok).toBe(false)
    if (validation.ok) throw new Error("expected invalid packet")
    expect(validation.issues.map((issue) => issue.code)).toEqual([
      "invalid-applied-revision",
      "missing-patch-node",
    ])
  })

  it("documents packet v1 as a foundation bridge with a future growth warning", () => {
    const doc = readFileSync(new URL("../docs/TEMPLATE_BUILDER_STRUCTURAL_PACKET_CONTRACT_BOUNDARY.md", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")
    const roadmap = readFileSync(new URL("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md", import.meta.url), "utf8")

    expect(doc).toContain("Status: Phase 70 foundation boundary.")
    expect(doc).toContain("Design Rationale")
    expect(doc).toContain("Growth Warning")
    expect(doc).toContain("not a durable storage")
    expect(doc).toContain("multi-session editing")
    expect(doc).toContain("createStructuralChangePacket")
    expect(doc).toContain("validateStructuralChangePacket")
    expect(ledger).toContain("| 70 | Structural packet contract boundary | done |")
    expect(roadmap).toContain("## Phase 70: Structural Packet Contract Boundary")
  })
})
