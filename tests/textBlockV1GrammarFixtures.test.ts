import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  buildRelationshipGraph,
  parseFlowDocPackageV2DocumentVNext,
  runVNextOperation,
  validateVNextTextBlockV1Grammar,
} from "../src/index.js"

const FIXTURES = [
  "product-report-vnext-baseline.flowdoc.json",
  "product-report-vnext-minimal.flowdoc.json",
  "product-report-vnext.flowdoc.json",
  "reorder-blocked-target-qa.flowdoc.json",
] as const

function auditFixture(name: string) {
  const raw = readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8")
  const pack = parseFlowDocPackageV2DocumentVNext(JSON.parse(raw))
  const graph = buildRelationshipGraph(pack.document)
  const validations = [...graph.nodesById.values()]
    .filter((node) => node.type === "text-block")
    .map((textBlock) => {
      const zoneId = graph.zoneByNodeId.get(textBlock.id)
      const zone = zoneId ? graph.zonesById.get(zoneId) : null
      if (!zone) throw new Error(`missing zone for ${textBlock.id}`)

      return validateVNextTextBlockV1Grammar(textBlock, {
        fieldRegistry: pack.fields,
        zoneRole: zone.role,
      })
    })

  return {
    blocked: validations.filter((validation) => validation.status === "blocked").length,
    normalizationRequired: validations.filter((validation) => validation.status === "normalization-required").length,
    textBlocks: validations.length,
    valid: validations.filter((validation) => validation.status === "valid").length,
  }
}

describe("Text-block v1 grammar fixture acceptance", () => {
  it("keeps current product fixtures valid without implicit normalization", () => {
    expect(Object.fromEntries(FIXTURES.map((name) => [name, auditFixture(name)]))).toEqual({
      "product-report-vnext-baseline.flowdoc.json": {
        blocked: 0,
        normalizationRequired: 0,
        textBlocks: 35,
        valid: 35,
      },
      "product-report-vnext-minimal.flowdoc.json": {
        blocked: 0,
        normalizationRequired: 0,
        textBlocks: 5,
        valid: 5,
      },
      "product-report-vnext.flowdoc.json": {
        blocked: 0,
        normalizationRequired: 0,
        textBlocks: 28,
        valid: 28,
      },
      "reorder-blocked-target-qa.flowdoc.json": {
        blocked: 0,
        normalizationRequired: 0,
        textBlocks: 4,
        valid: 4,
      },
    })
  })

  it("reports current table insert placeholders as explicit normalization debt", () => {
    const raw = readFileSync(new URL("../fixtures/product-report-vnext-minimal.flowdoc.json", import.meta.url), "utf8")
    const pack = parseFlowDocPackageV2DocumentVNext(JSON.parse(raw))
    const rowInsert = runVNextOperation(pack.document, {
      kind: "table.row.insert",
      index: 1,
      rowId: "grammar-audit-row",
      tableId: "detail-table",
    })
    const columnInsert = runVNextOperation(pack.document, {
      kind: "table.column.insert",
      index: 2,
      tableId: "detail-table",
    })

    expect(rowInsert.ok).toBe(true)
    expect(columnInsert.ok).toBe(true)
    if (!rowInsert.ok || !columnInsert.ok) throw new Error("expected table insert operations")

    const generatedTextBlockIds = [
      [rowInsert.document, "grammar-audit-row-cell-1-text"],
      [rowInsert.document, "grammar-audit-row-cell-2-text"],
      [columnInsert.document, "detail-header-row-cell-3-text"],
    ] as const

    for (const [document, textBlockId] of generatedTextBlockIds) {
      const graph = buildRelationshipGraph(document)
      const textBlock = graph.nodesById.get(textBlockId)
      if (textBlock?.type !== "text-block") throw new Error(`missing ${textBlockId}`)

      expect(validateVNextTextBlockV1Grammar(textBlock, {
        fieldRegistry: pack.fields,
        zoneRole: "body",
      })).toMatchObject({
        status: "normalization-required",
        issues: [{ code: "empty-text", inlineId: `${textBlockId}-inline-1` }],
      })
    }
  })
})
