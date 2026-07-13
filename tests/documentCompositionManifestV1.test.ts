import { describe, expect, it } from "vitest"
import {
  finalizeVNextDocumentCompositionDemandV1,
  finalizeVNextDocumentCompositionManifestV1,
  parseVNextDocumentCompositionDemandV1,
  parseVNextDocumentCompositionManifestV1,
  type VNextCompositionNodeFamilyV1,
  type VNextCompositionRootNodeTypeV1,
  type VNextDocumentCompositionManifestInputV1,
} from "../src/index.js"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"

const fp = (value: string) => createVNextCompactFingerprint(value)

function cursor(family: VNextCompositionNodeFamilyV1, rootNodeId: string, measurement: string) {
  return {
    contractVersion: 1 as const,
    kind: "composition-family-cursor-ref" as const,
    family,
    rootNodeId,
    ownerFingerprint: measurement,
    stateFingerprint: fp(`cursor:${rootNodeId}`),
    complete: false,
  }
}

const families: Array<[VNextCompositionNodeFamilyV1, VNextCompositionRootNodeTypeV1]> = [
  ["text-flow", "text-block"],
  ["columns-flow", "columns"],
  ["table-flow", "table"],
  ["generated-flow", "toc"],
  ["utility-flow", "divider"],
  ["media-flow", "image"],
]

function manifestInput(): VNextDocumentCompositionManifestInputV1 {
  const documentStructure = fp("document-structure")
  const resolvedProjection = fp("resolved-projection")
  return {
    source: "vnext-document-composition-manifest",
    contractVersion: 1,
    kind: "document-composition-manifest",
    documentId: "document-1",
    documentStructureFingerprint: documentStructure,
    resolvedProjectionFingerprint: resolvedProjection,
    sections: [{
      sectionIndex: 0,
      sectionId: "section-1",
      pageGeometry: {
        pageWidthPt: 600, pageHeightPt: 800,
        bodyOriginXPt: 50, bodyOriginYPt: 50, bodyWidthPt: 500, bodyHeightPt: 700,
      },
      staticZones: [
        { role: "header", zoneId: "header-1", evidenceFingerprint: fp("header") },
        { role: "footer", zoneId: "footer-1", evidenceFingerprint: fp("footer") },
      ],
    }],
    bodyItems: families.map(([family, rootNodeType], itemIndex) => {
      const rootNodeId = `root-${itemIndex}`
      const measurement = fp(`measurement:${itemIndex}`)
      return {
        itemIndex,
        sectionIndex: 0,
        sectionId: "section-1",
        zoneOrder: 0,
        zoneId: "body-1",
        sourceOrder: itemIndex,
        rootNodeId,
        rootNodeType,
        family,
        ownerPins: {
          documentStructure,
          resolvedProjection,
          familySource: fp(`source:${itemIndex}`),
          measurement,
        },
        initialCursor: cursor(family, rootNodeId, measurement),
      }
    }),
    limits: {
      maximumDocumentPageCount: 1_000,
      maximumDocumentPlacementCount: 10_000,
      maximumOpenPagePlacementCount: 1_000,
    },
  }
}

describe("document Composition manifest v1", () => {
  it("finalizes all six family roots deterministically without mutating input", () => {
    const input = manifestInput()
    const before = structuredClone(input)
    const first = finalizeVNextDocumentCompositionManifestV1(input)
    const second = finalizeVNextDocumentCompositionManifestV1(input)

    expect(first).toEqual(second)
    expect(input).toEqual(before)
    expect(first).toMatchObject({ status: "ready", manifest: { bodyItems: expect.any(Array) } })
    if (first.status !== "ready") throw new Error("manifest fixture blocked")
    expect(first.manifest.bodyItems.map((item) => item.family)).toEqual(families.map(([family]) => family))
    expect(parseVNextDocumentCompositionManifestV1(first.manifest)).toEqual(first)
  })

  it("blocks canonical order, family ownership, initial cursor, geometry, and static-zone drift", () => {
    const cases: Array<[string, (input: VNextDocumentCompositionManifestInputV1) => void, string]> = [
      ["order", (input) => { input.bodyItems[1].sourceOrder = 0 }, "composition-body-item-canonical-order-invalid"],
      ["family", (input) => { input.bodyItems[1].rootNodeType = "table" }, "composition-family-root-mismatch"],
      ["cursor", (input) => { input.bodyItems[0].initialCursor.complete = true }, "composition-initial-family-cursor-invalid"],
      ["geometry", (input) => { input.sections[0].pageGeometry.bodyHeightPt = 800 }, "composition-body-height-out-of-page"],
      ["static", (input) => { input.sections[0].staticZones[1].role = "header" }, "composition-static-zone-role-duplicate"],
      ["limit", (input) => { input.limits.maximumOpenPagePlacementCount = 20_000 }, "composition-open-page-limit-invalid"],
    ]
    for (const [, mutate, code] of cases) {
      const input = manifestInput()
      mutate(input)
      expect(finalizeVNextDocumentCompositionManifestV1(input)).toMatchObject({
        status: "blocked", issues: expect.arrayContaining([expect.objectContaining({ code })]),
      })
    }
  })

  it("rejects retained manifest tampering even when shape remains valid", () => {
    const result = finalizeVNextDocumentCompositionManifestV1(manifestInput())
    if (result.status !== "ready") throw new Error("manifest fixture blocked")
    const tampered = structuredClone(result.manifest)
    tampered.bodyItems[0].zoneId = "other-body"
    expect(parseVNextDocumentCompositionManifestV1(tampered)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "document-composition-fingerprint-mismatch" })],
    })
  })

  it("finalizes exact demand while keeping pagination out of stable owner pins", () => {
    const manifest = finalizeVNextDocumentCompositionManifestV1(manifestInput())
    if (manifest.status !== "ready") throw new Error("manifest fixture blocked")
    const item = manifest.manifest.bodyItems[0]
    const demand = finalizeVNextDocumentCompositionDemandV1({
      source: "vnext-document-composition-demand",
      contractVersion: 1,
      kind: "document-composition-demand",
      documentId: manifest.manifest.documentId,
      manifestFingerprint: manifest.manifest.fingerprint,
      itemIndex: item.itemIndex,
      sectionIndex: item.sectionIndex,
      sectionId: item.sectionId,
      zoneId: item.zoneId,
      sourceOrder: item.sourceOrder,
      rootNodeId: item.rootNodeId,
      rootNodeType: item.rootNodeType,
      family: item.family,
      ownerPins: item.ownerPins,
      cursorBefore: item.initialCursor,
      capacity: {
        pageBodyHeightPt: 700,
        firstPageAvailableHeightPt: 120,
        maximumPageCount: 5,
        maximumFragmentCount: 100,
      },
    })
    expect(demand).toMatchObject({ status: "ready", demand: { capacity: { firstPageAvailableHeightPt: 120 } } })
    if (demand.status !== "ready") throw new Error("demand fixture blocked")
    expect(Object.keys(demand.demand.ownerPins)).not.toContain("pagination")
    expect(parseVNextDocumentCompositionDemandV1(demand.demand)).toEqual(demand)

    const invalid = structuredClone(demand.demand)
    const { fingerprint: _fingerprint, ...facts } = invalid
    facts.capacity.firstPageAvailableHeightPt = 701
    expect(finalizeVNextDocumentCompositionDemandV1(facts)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "composition-demand-first-capacity-invalid" })],
    })
  })
})
