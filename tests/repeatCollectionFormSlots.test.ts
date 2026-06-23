import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { DataSnapshot, DocumentNode, FieldRegistry } from "../src/index.js"
import {
  assessVNextRepeatCollectionFormSlotReadiness,
  parseFlowDocPackageV2DocumentVNext,
  VNEXT_REPEAT_COLLECTION_FORM_SLOT_MODE,
  VNEXT_REPEAT_COLLECTION_FORM_SLOT_SOURCE,
} from "../src/index.js"

function fixturePackage(name: string) {
  const fixtureUrl = new URL(`../fixtures/${name}`, import.meta.url)
  return parseFlowDocPackageV2DocumentVNext(JSON.parse(readFileSync(fixtureUrl, "utf8")) as unknown)
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

describe("vNext repeat collection form-slot boundary", () => {
  it("reports no collection work for scalar-only packages while keeping repeat and form slots not modeled", () => {
    const pack = fixturePackage("product-report-vnext-minimal.flowdoc.json")
    const beforeDocument = JSON.stringify(pack.document)
    const beforeRegistry = JSON.stringify(pack.fields)
    const beforeData = JSON.stringify(pack.data)

    const readiness = assessVNextRepeatCollectionFormSlotReadiness({
      document: pack.document,
      registry: pack.fields,
      data: pack.data,
    })

    expect(readiness).toEqual({
      source: VNEXT_REPEAT_COLLECTION_FORM_SLOT_SOURCE,
      mode: VNEXT_REPEAT_COLLECTION_FORM_SLOT_MODE,
      status: "ready",
      collectionFields: [],
      repeatRegions: {
        status: "not-modeled",
        regionCount: 0,
        expansionStatus: "not-run",
      },
      formSlots: {
        status: "not-modeled",
        slotCount: 0,
        submissionState: "not-modeled",
      },
      issues: [],
      usages: expect.any(Array),
      application: {
        status: "not-applied",
        repeatExpansion: "not-run",
        collectionBinding: "not-run",
        formSlotMaterialization: "not-run",
        submissionState: "not-run",
        documentMutation: "not-run",
        packageVersionChange: false,
      },
      summary: {
        collectionFieldCount: 0,
        collectionInlineUsageCount: 0,
        collectionDataKeyCount: 0,
        repeatRegionCount: 0,
        formSlotCount: 0,
        errorCount: 0,
        warningCount: 0,
      },
    })
    expect(readiness.usages.length).toBeGreaterThan(0)
    expect(JSON.stringify(pack.document)).toBe(beforeDocument)
    expect(JSON.stringify(pack.fields)).toBe(beforeRegistry)
    expect(JSON.stringify(pack.data)).toBe(beforeData)
  })

  it("blocks collection inline usage and scalar data snapshots before repeat expansion exists", () => {
    const pack = fixturePackage("product-report-vnext-minimal.flowdoc.json")
    const document = cloneJson(pack.document) as DocumentNode
    const title = document.document.sections[0].nodes.title
    if (title.type !== "text-block") throw new Error("expected title text block")
    title.children.push({
      id: "title-line-items",
      type: "field-ref",
      key: "line.items",
      fallback: "Line items",
    })
    const registry: FieldRegistry = {
      version: 1,
      fields: {
        ...pack.fields.fields,
        "line.items": {
          key: "line.items",
          label: "Line Items",
          type: "collection",
        },
      },
    }
    const data: DataSnapshot = {
      version: 1,
      values: {
        ...(pack.data?.values ?? {}),
        "line.items": "not-a-collection-payload",
      },
    }

    const readiness = assessVNextRepeatCollectionFormSlotReadiness({
      document,
      registry,
      data,
    })

    expect(readiness.status).toBe("blocked")
    expect(readiness.collectionFields).toEqual([{
      key: "line.items",
      label: "Line Items",
      type: "collection",
      usageCount: 1,
      fieldRefIds: ["title-line-items"],
      dataKeyPresent: true,
      repeatRegionStatus: "not-modeled",
      expansionStatus: "not-run",
      formSlotStatus: "not-modeled",
    }])
    expect(readiness.summary).toMatchObject({
      collectionFieldCount: 1,
      collectionInlineUsageCount: 1,
      collectionDataKeyCount: 1,
      repeatRegionCount: 0,
      formSlotCount: 0,
      errorCount: 2,
      warningCount: 1,
    })
    expect(readiness.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        severity: "warning",
        code: "collection-repeat-not-modeled",
        key: "line.items",
      }),
      expect.objectContaining({
        severity: "error",
        code: "collection-field-used-inline",
        key: "line.items",
        fieldRefIds: ["title-line-items"],
      }),
      expect.objectContaining({
        severity: "error",
        code: "collection-data-snapshot-not-supported",
        key: "line.items",
        path: "data.values.line.items",
      }),
    ]))
    expect(readiness.application).toMatchObject({
      repeatExpansion: "not-run",
      collectionBinding: "not-run",
      formSlotMaterialization: "not-run",
      submissionState: "not-run",
      documentMutation: "not-run",
      packageVersionChange: false,
    })
    expect(JSON.parse(JSON.stringify(readiness))).toEqual(readiness)
  })

  it("keeps the boundary independent from storage, DOM, routes, layout, and package schema changes", () => {
    const sourceUrl = new URL("../src/binding/repeatCollectionFormSlots.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).toContain("collectVNextDocumentFieldRefUsages")
    expect(source).toContain('repeatExpansion: "not-run"')
    expect(source).toContain('packageVersionChange: false')
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("localStorage")
    expect(source).not.toContain("sessionStorage")
    expect(source).not.toContain("indexedDB")
    expect(source).not.toMatch(/\bdocument\.(querySelector|createElement|body|addEventListener)/)
    expect(source).not.toContain("HTMLElement")
    expect(source).not.toContain("window.")
    expect(source).not.toContain("/api/")
    expect(source).not.toContain("parseFlowDocPackage")
    expect(source).not.toContain("serializeFlowDocPackage")
    expect(source).not.toContain("runVNextTextTransaction")
    expect(source).not.toContain("runVNextOperation")
    expect(source).not.toContain("runVNextLayoutPipeline")
    expect(source).not.toContain("paginateVNextDocument")
  })

  it("documents the repeat collection form-slot boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/REPEAT_COLLECTION_FORM_SLOT_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 90 implementation boundary.")
    expect(boundaryDoc).toContain("src/binding/repeatCollectionFormSlots.ts")
    expect(boundaryDoc).toContain("This is a repeat / collection / form-slot boundary.")
    expect(boundaryDoc).toContain("It is not a repeat expansion engine.")
    expect(boundaryDoc).toContain("packageVersionChange = `false`")
    expect(readme).toContain("Repeat / collection / form-slot boundary")
    expect(readme).toContain("docs/REPEAT_COLLECTION_FORM_SLOT_BOUNDARY.md")
    expect(ledger).toContain("| 90 | Repeat / collection / form-slot boundary | done |")
    expect(roadmap).toContain("## Phase 90: Repeat / Collection / Form-slot Boundary")
  })
})
