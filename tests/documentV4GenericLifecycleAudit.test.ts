import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  runVNextDocumentV4Operation,
  safeParseFlowDocPackageV3DocumentV4,
  type AuthoredNodeV4Target,
  type AuthoredNodeV4TargetType,
  type FlowDocPackageV3DocumentV4,
} from "../src/index.js"

type ParentKind = "column" | "table-cell" | "zone"
type LifecycleBlockType = Extract<AuthoredNodeV4TargetType,
  "columns" | "divider" | "image" | "page-break" | "spacer" | "table" | "text-block" | "toc">

const CASES: ReadonlyArray<{ parent: ParentKind; type: LifecycleBlockType }> = [
  ...(["text-block", "columns", "table", "toc", "page-break", "divider", "spacer", "image"] as const)
    .map((type) => ({ parent: "zone" as const, type })),
  ...(["text-block", "columns", "table", "toc", "divider", "spacer", "image"] as const)
    .map((type) => ({ parent: "column" as const, type })),
  ...(["text-block", "toc", "divider", "spacer", "image"] as const)
    .map((type) => ({ parent: "table-cell" as const, type })),
]

function fixture(): FlowDocPackageV3DocumentV4 {
  const value = JSON.parse(readFileSync(
    new URL("../fixtures/product-report-v4-migrated-minimal.flowdoc.json", import.meta.url),
    "utf8",
  ))
  const parsed = safeParseFlowDocPackageV3DocumentV4(value)
  if (!parsed.ok) throw new Error("audit fixture did not parse")
  return structuredClone(parsed.package)
}

function auditNodes(type: LifecycleBlockType): AuthoredNodeV4Target[] {
  const text = (id: string): Extract<AuthoredNodeV4Target, { type: "text-block" }> => ({
    id,
    type: "text-block",
    role: { role: "paragraph" },
    props: {},
    children: [{ id: `${id}-run`, type: "text", text: "Audit" }],
  })

  if (type === "text-block") return [text("audit-text")]
  if (type === "columns") return [
    { id: "audit-columns", type: "columns", props: {}, columnIds: ["audit-column"] },
    { id: "audit-column", type: "column", props: { widthShare: 100 }, childIds: ["audit-column-text"] },
    text("audit-column-text"),
  ]
  if (type === "table") return [
    { id: "audit-table", type: "table", props: {}, columns: [{ width: { value: 100, unit: "pt" } }], rowIds: ["audit-row"] },
    { id: "audit-row", type: "table-row", props: {}, cellIds: ["audit-cell"] },
    { id: "audit-cell", type: "table-cell", props: {}, childIds: ["audit-cell-text"] },
    text("audit-cell-text"),
  ]
  if (type === "toc") return [{ id: "audit-toc", type: "toc", props: {} }]
  if (type === "page-break") return [{ id: "audit-page-break", type: "page-break", props: {} }]
  if (type === "divider") return [{
    id: "audit-divider",
    type: "divider",
    props: {
      color: "CBD5E1",
      thickness: { value: 1, unit: "pt" },
      marginBefore: { value: 6, unit: "pt" },
      marginAfter: { value: 6, unit: "pt" },
      style: "solid",
    },
  }]
  if (type === "spacer") return [{ id: "audit-spacer", type: "spacer", props: { height: 12 } }]
  return [{
    id: "audit-image",
    type: "image",
    source: { kind: "asset-ref", assetId: "audit-asset" },
    accessibility: { kind: "decorative" },
    props: {
      align: "left",
      frame: {
        width: { value: 100, unit: "pt" },
        height: { value: 50, unit: "pt" },
        fit: "contain",
      },
    },
  }]
}

function parentFacts(pack: FlowDocPackageV3DocumentV4, parent: ParentKind): { id: string; childIds: string[] } {
  const nodes = pack.document.document.sections[0].nodes
  const id = parent === "zone"
    ? "zone-cover-body"
    : parent === "column"
      ? "summary-left"
      : "detail-cell-a"
  const node = nodes[id]
  if (!node || !(node.type === "zone" || node.type === "column" || node.type === "table-cell")) {
    throw new Error(`missing audit parent ${id}`)
  }
  return { id, childIds: node.childIds }
}

function install(type: LifecycleBlockType, parent: ParentKind): { pack: FlowDocPackageV3DocumentV4; rootId: string } {
  const pack = fixture()
  pack.assets.images["audit-asset"] = {
    id: "audit-asset",
    kind: "image",
    mediaType: "image/png",
    byteLength: 1,
    digest: { algorithm: "sha256", value: "a".repeat(64) },
    intrinsic: { widthPx: 1, heightPx: 1 },
  }
  const nodes = auditNodes(type)
  const sectionNodes = pack.document.document.sections[0].nodes
  nodes.forEach((node) => { sectionNodes[node.id] = node })
  parentFacts(pack, parent).childIds.push(nodes[0].id)
  const parsed = safeParseFlowDocPackageV3DocumentV4(pack)
  if (!parsed.ok) throw new Error(parsed.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n"))
  return { pack: parsed.package, rootId: nodes[0].id }
}

describe("document v4 generic lifecycle close audit", () => {
  it.each(CASES)("applies lifecycle operations to $type under $parent", ({ parent, type }) => {
    const { pack, rootId } = install(type, parent)
    const before = JSON.stringify(pack)
    const sourceIndex = parentFacts(pack, parent).childIds.indexOf(rootId)

    const deleted = runVNextDocumentV4Operation(pack, { kind: "node.delete", nodeId: rootId })
    expect(deleted.ok).toBe(true)
    if (!deleted.ok) throw new Error(`delete failed for ${parent}/${type}`)
    expect(deleted.package.document.document.sections[0].nodes[rootId]).toBeUndefined()
    expect(parentFacts(deleted.package, parent).childIds).not.toContain(rootId)

    const duplicated = runVNextDocumentV4Operation(pack, { kind: "node.duplicate", nodeId: rootId })
    expect(duplicated.ok).toBe(true)
    if (!duplicated.ok) throw new Error(`duplicate failed for ${parent}/${type}`)
    expect(parentFacts(duplicated.package, parent).childIds.slice(sourceIndex, sourceIndex + 2)).toEqual([
      rootId,
      `${rootId}-copy`,
    ])

    const reordered = runVNextDocumentV4Operation(pack, { kind: "node.reorder", nodeId: rootId, toIndex: 0 })
    expect(reordered.ok).toBe(true)
    if (!reordered.ok) throw new Error(`reorder failed for ${parent}/${type}`)
    expect(parentFacts(reordered.package, parent).childIds[0]).toBe(rootId)
    expect(JSON.stringify(pack)).toBe(before)
  })

  it.each(["body", "header", "footer", "first-page-header", "first-page-footer"] as const)(
    "keeps text-block lifecycle valid in a %s zone",
    (role) => {
      const pack = fixture()
      const zone = pack.document.document.sections[0].nodes["zone-cover-body"]
      if (!zone || zone.type !== "zone") throw new Error("body zone missing")
      zone.role = role
      expect(runVNextDocumentV4Operation(pack, {
        kind: "node.duplicate",
        nodeId: "title",
      })).toMatchObject({ ok: true })
    },
  )

  it("rejects page-break lifecycle when the authored package violates zone-role policy", () => {
    const { pack, rootId } = install("page-break", "zone")
    const zone = pack.document.document.sections[0].nodes["zone-cover-body"]
    if (!zone || zone.type !== "zone") throw new Error("body zone missing")
    zone.role = "header"

    expect(runVNextDocumentV4Operation(pack, {
      kind: "node.delete",
      nodeId: rootId,
    })).toMatchObject({ ok: false, reason: "invalid-document", package: null })
  })

  it.each([
    ["zone-cover-body", "zone"],
    ["summary-left", "column"],
    ["detail-header-row", "table-row"],
    ["detail-cell-a", "table-cell"],
  ] as const)("rejects internal %s lifecycle targets", (nodeId, _type) => {
    for (const command of [
      { kind: "node.delete" as const, nodeId },
      { kind: "node.duplicate" as const, nodeId },
      { kind: "node.reorder" as const, nodeId, toIndex: 0 },
    ]) {
      expect(runVNextDocumentV4Operation(fixture(), command)).toMatchObject({
        ok: false,
        reason: "unsupported-target",
      })
    }
  })

  it("rejects same-index reorder as a non-operation", () => {
    expect(runVNextDocumentV4Operation(fixture(), {
      kind: "node.reorder",
      nodeId: "title",
      toIndex: 0,
    })).toMatchObject({
      issues: [expect.objectContaining({ code: "no-op-index" })],
      ok: false,
      reason: "invalid-command",
    })
  })

  it("publishes the lifecycle matrix and retained boundaries", () => {
    const doc = readFileSync(
      new URL("../docs/DOCUMENT_V4_GENERIC_LIFECYCLE_CLOSE_AUDIT.md", import.meta.url),
      "utf8",
    )
    for (const section of [
      "## Audited Parent Matrix",
      "## Structural Target Policy",
      "## Zone Role Policy",
      "## No-Operation Policy",
      "## Media Surface",
      "## Cross-Repo Apply Policy",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)
    expect(doc).toMatch(/All 20 valid block\/parent combinations pass all three lifecycle operations/)
    expect(doc).toMatch(/Future insert\/move operations must inspect parent and zone-role context/)
  })
})
