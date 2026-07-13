import { describe, expect, it } from "vitest"
import {
  createVNextAtomicBlockCompositionWindowV1,
  createVNextAtomicBlockV4Evidence,
  paginateVNextAtomicBlockV4,
  parseVNextCompositionFragmentWindowV1,
  type AuthoredNodeV4Target,
  type VNextAtomicBlockCompositionWindowContextV1,
  type VNextResolvedImageBindingV1,
} from "../src/index.js"

const pin = (value: string) => `sha256:${value.repeat(64).slice(0, 64)}`

function divider(): Extract<AuthoredNodeV4Target, { type: "divider" }> {
  return {
    id: "divider-1",
    type: "divider",
    props: {
      color: "CBD5E1",
      thickness: { value: 1, unit: "mm" },
      marginBefore: { value: 2, unit: "mm" },
      marginAfter: { value: 3, unit: "mm" },
      style: "solid",
    },
  }
}

function spacer(height = 24): Extract<AuthoredNodeV4Target, { type: "spacer" }> {
  return { id: "spacer-1", type: "spacer", props: { height } }
}

function pageBreak(): Extract<AuthoredNodeV4Target, { type: "page-break" }> {
  return { id: "break-1", type: "page-break", props: {} }
}

function image(height = 120, width = 200): Extract<AuthoredNodeV4Target, { type: "image" }> {
  return {
    id: "image-1",
    type: "image",
    source: { kind: "image-field-ref", fieldKey: "customer.logo", fallbackAssetId: "logo-fallback" },
    accessibility: { kind: "described", altText: "Customer logo" },
    props: {
      frame: { width: { value: width, unit: "pt" }, height: { value: height, unit: "pt" }, fit: "contain" },
      align: "center",
    },
  }
}

function binding(assetId: string | null = "logo-instance"): VNextResolvedImageBindingV1 {
  return {
    placementId: "image-1",
    fieldKey: "customer.logo",
    assetId,
    assetOwner: assetId == null ? "none" : "instance-media",
    valueSource: assetId == null ? "empty" : "data-snapshot",
  }
}

function context(): VNextAtomicBlockCompositionWindowContextV1 {
  return {
    documentId: "document-1",
    sectionId: "section-1",
    zoneId: "body-1",
    sourceOrder: 4,
    documentStructureFingerprint: pin("a"),
    resolvedProjectionFingerprint: pin("b"),
    familySourceFingerprint: pin("c"),
  }
}

function evidence(node: Parameters<typeof createVNextAtomicBlockV4Evidence>[0]["node"], imageBinding?: VNextResolvedImageBindingV1) {
  const result = createVNextAtomicBlockV4Evidence({ node, availableWidthPt: 400, imageBinding })
  if (result.status === "blocked") throw new Error(result.issues.map((item) => item.message).join("; "))
  return result.evidence
}

describe("Utility and Media v4 atomic composition", () => {
  it("prepares exact utility geometry and resolved image ownership without decode", () => {
    const dividerResult = createVNextAtomicBlockV4Evidence({ node: divider(), availableWidthPt: 400 })
    const imageInput = { node: image(), availableWidthPt: 400, imageBinding: binding() }
    const before = JSON.stringify(imageInput)
    const imageResult = createVNextAtomicBlockV4Evidence(imageInput)

    expect(dividerResult).toMatchObject({
      status: "ready",
      evidence: {
        nodeType: "divider",
        family: "utility-flow",
        extentPt: 17.007874,
        details: { marginBeforePt: 5.669291, thicknessPt: 2.834646, marginAfterPt: 8.503937 },
        fingerprint: expect.stringMatching(/^sha256:[a-f0-9]{64}$/u),
      },
    })
    expect(imageResult).toMatchObject({
      status: "ready",
      evidence: {
        nodeType: "image",
        family: "media-flow",
        extentPt: 120,
        details: {
          widthPt: 200,
          assetId: "logo-instance",
          assetOwner: "instance-media",
          valueSource: "data-snapshot",
          decodeExecution: false,
        },
      },
    })
    expect(JSON.stringify(imageInput)).toBe(before)
  })

  it("blocks empty, mismatched, and horizontally oversized block-image evidence", () => {
    expect(createVNextAtomicBlockV4Evidence({ node: image(), availableWidthPt: 400 })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "resolved-block-image-binding-missing" })],
    })
    expect(createVNextAtomicBlockV4Evidence({ node: image(), availableWidthPt: 400, imageBinding: binding(null) })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "resolved-block-image-empty" })],
    })
    expect(createVNextAtomicBlockV4Evidence({ node: image(120, 500), availableWidthPt: 400, imageBinding: binding() })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "block-image-frame-exceeds-available-width" })],
    })
  })

  it("moves an atomic image whole to a fresh page and blocks instead of scaling when too tall", () => {
    const imageEvidence = evidence(image(300), binding())
    const fresh = paginateVNextAtomicBlockV4({
      evidence: imageEvidence,
      pageBodyHeightPt: 700,
      firstPageAvailableHeightPt: 200,
    })
    expect(fresh).toMatchObject({
      status: "fresh-page-required",
      pages: [],
      cursorAfter: { complete: false },
      work: { pageAttemptCount: 0, fragmentCount: 0, cursorCommitCount: 0 },
    })
    if (fresh.status !== "fresh-page-required") throw new Error("expected fresh page")
    expect(fresh.cursorAfter).toEqual(fresh.cursorBefore)
    expect(paginateVNextAtomicBlockV4({
      evidence: imageEvidence,
      pageBodyHeightPt: 700,
      cursor: fresh.cursorAfter,
    })).toMatchObject({
      status: "complete",
      pages: [{ usedHeightPt: 300, fragment: { extentPt: 300 } }],
    })

    expect(paginateVNextAtomicBlockV4({
      evidence: evidence(image(701), binding()),
      pageBodyHeightPt: 700,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({
        code: "atomic-block-exceeds-page-body",
        message: expect.stringContaining("does not scale or split"),
      })],
    })
  })

  it("emits page-break as a complete forced-page directive even on an empty remainder", () => {
    const result = paginateVNextAtomicBlockV4({
      evidence: evidence(pageBreak()),
      pageBodyHeightPt: 700,
      firstPageAvailableHeightPt: 0,
    })
    expect(result).toMatchObject({
      status: "complete",
      pages: [{
        flowEffect: "force-page-advance",
        availableHeightPt: 0,
        usedHeightPt: 0,
        remainingHeightPt: 0,
        fragment: null,
      }],
      cursorAfter: { complete: true },
      work: { pageAttemptCount: 1, fragmentCount: 0, cursorCommitCount: 1 },
    })
    const window = createVNextAtomicBlockCompositionWindowV1({ pagination: result, context: context() })
    expect(window).toMatchObject({
      status: "ready",
      window: {
        status: "complete",
        family: "utility-flow",
        rootNodeType: "page-break",
        pages: [{ flowEffect: "force-page-advance", fragments: [] }],
      },
    })
  })

  it("projects placed utility/media evidence into strict common windows", () => {
    for (const atomicEvidence of [evidence(divider()), evidence(spacer()), evidence(image(), binding())]) {
      const pagination = paginateVNextAtomicBlockV4({ evidence: atomicEvidence, pageBodyHeightPt: 700 })
      const result = createVNextAtomicBlockCompositionWindowV1({ pagination, context: context() })
      expect(result).toMatchObject({
        status: "ready",
        window: {
          status: "complete",
          family: atomicEvidence.family,
          rootNodeType: atomicEvidence.nodeType,
          pages: [{ flowEffect: "place-content", fragments: [{ blockExtentPt: atomicEvidence.extentPt }] }],
        },
      })
      if (result.status === "blocked") throw new Error("common window blocked")
      expect(parseVNextCompositionFragmentWindowV1(result.window)).toEqual(result)
    }
  })

  it("rejects stale/tampered pagination before common finalization", () => {
    const pagination = paginateVNextAtomicBlockV4({ evidence: evidence(spacer()), pageBodyHeightPt: 700 })
    const tampered = JSON.parse(JSON.stringify(pagination))
    tampered.pages[0].usedHeightPt += 1
    expect(createVNextAtomicBlockCompositionWindowV1({ pagination: tampered, context: context() })).toMatchObject({
      status: "blocked",
      window: null,
      issues: [expect.objectContaining({ code: "atomic-pagination-fingerprint-mismatch" })],
    })

    const stale = JSON.parse(JSON.stringify(pagination))
    stale.cursorBefore.evidenceFingerprint = pin("9")
    expect(createVNextAtomicBlockCompositionWindowV1({ pagination: stale, context: context() })).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "atomic-pagination-fingerprint-mismatch" }),
        expect.objectContaining({ code: "atomic-pagination-cursor-owner-mismatch" }),
      ]),
    })
  })

  it("keeps 1,000 independent spacer windows deterministic and bounded", () => {
    const outputs = Array.from({ length: 1_000 }, (_, index) => {
      const node = { ...spacer(12), id: `spacer-${index}` }
      const atomicEvidence = evidence(node)
      const pagination = paginateVNextAtomicBlockV4({ evidence: atomicEvidence, pageBodyHeightPt: 700 })
      return createVNextAtomicBlockCompositionWindowV1({
        pagination,
        context: { ...context(), sourceOrder: index },
      })
    })
    expect(outputs.every((item) => item.status === "ready" && item.window.status === "complete")).toBe(true)
    expect(new Set(outputs.map((item) => item.status === "ready" ? item.window.fingerprint : "blocked")).size).toBe(1_000)
  })
})
