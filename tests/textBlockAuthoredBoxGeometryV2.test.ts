import { describe, expect, it } from "vitest"
import {
  createVNextTextBlockSpatialIndexUpdateV2,
  inspectVNextTextBlockAuthoredBoxGeometryV2,
  layoutVNextTextBlockAuthoredBoxGeometryV2,
  layoutVNextTextBlockSpatialWrappingV2,
} from "../src/index.js"
import {
  acceptedInlineImageSpatialFixture,
} from "./helpers/textBlockInlineImageFlowV2.js"

function acceptedFixture() {
  return acceptedInlineImageSpatialFixture({ content: "text-image-text" })
}

function spatialEntry(input: {
  objectId: string
  topLayoutUnit?: number
  bottomLayoutUnit: number
  wrapPolicy?: "rectangular-exclusion" | "overlay"
}) {
  return {
    objectId: input.objectId,
    geometryOwnerFingerprint: `sha256:${"a".repeat(64)}`,
    xLayoutUnit: 0,
    yLayoutUnit: input.topLayoutUnit ?? 0,
    widthLayoutUnit: 20_000_000,
    heightLayoutUnit: input.bottomLayoutUnit - (input.topLayoutUnit ?? 0),
    clearance: {
      topLayoutUnit: 0,
      rightLayoutUnit: 0,
      bottomLayoutUnit: 0,
      leftLayoutUnit: 0,
    },
    wrapPolicy: input.wrapPolicy ?? "rectangular-exclusion",
  } as const
}

describe("TextBlock authored box geometry v2", () => {
  it("projects mixed text and image fragments from content-local geometry into the authored box", () => {
    const fixture = acceptedFixture()
    const content = layoutVNextTextBlockSpatialWrappingV2({
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      spatialIndex: fixture.spatialIndex,
      startYLayoutUnit: 0,
    })
    const result = layoutVNextTextBlockAuthoredBoxGeometryV2({
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      spatialIndex: fixture.spatialIndex,
    })
    if (content.status !== "accepted" || result.status !== "accepted") {
      throw new Error("V2 authored-box fixture blocked")
    }
    const contentImage = content.lines.flatMap((line) => line.fragments)
      .find((fragment) => fragment.kind === "inline-image")
    const image = result.lines.flatMap((line) => line.fragments)
      .find((fragment) => fragment.kind === "inline-image")
    if (contentImage == null || image == null) throw new Error("mixed image fragment missing")

    expect(image).toMatchObject({
      kind: "inline-image",
      contentXLayoutUnit: contentImage.xLayoutUnit,
      contentYLayoutUnit: contentImage.yLayoutUnit,
      xLayoutUnit: contentImage.xLayoutUnit + result.geometry.contentOriginXLayoutUnit,
      yLayoutUnit: contentImage.yLayoutUnit + result.geometry.contentOriginYLayoutUnit,
      widthLayoutUnit: contentImage.widthLayoutUnit,
      heightLayoutUnit: contentImage.heightLayoutUnit,
    })
    expect(result.geometry.outerHeightLayoutUnit).toBe(
      result.geometry.contentInsetsLayoutUnit.top
      + Math.max(
        result.geometry.contentFlowHeightLayoutUnit,
        result.geometry.spatialMaximumBottomLayoutUnit,
      )
      + result.geometry.contentInsetsLayoutUnit.bottom,
    )
    expect(inspectVNextTextBlockAuthoredBoxGeometryV2(result)).toEqual({
      status: "valid",
      fingerprint: result.fingerprint,
    })
  })

  it.each(["fixedHeight", "overflow", "clip"]) (
    "rejects unsupported %s policy at the strict root",
    (key) => {
      const fixture = acceptedFixture()
      const result = layoutVNextTextBlockAuthoredBoxGeometryV2({
        initialFlow: fixture.initialFlow,
        evidence: fixture.evidence,
        persistentFlowTree: fixture.tree,
        spatialIndex: fixture.spatialIndex,
        [key]: true,
      })
      expect(result).toMatchObject({
        status: "blocked",
        geometry: null,
        lines: null,
        summary: null,
        fingerprint: null,
        issues: [{ code: "invalid-input", path: "input" }],
      })
    },
  )

  it("fails closed for stale, cloned, accessor-shaped, mutable, and re-fingerprinted authorities", () => {
    const fixture = acceptedFixture()
    const foreign = acceptedFixture()
    const accessorEnvelope = Object.create(null) as Record<string, unknown>
    Object.defineProperties(accessorEnvelope, {
      initialFlow: { enumerable: true, get: () => fixture.initialFlow },
      evidence: { enumerable: true, value: fixture.evidence },
      persistentFlowTree: { enumerable: true, value: fixture.tree },
      spatialIndex: { enumerable: true, value: fixture.spatialIndex },
    })
    const mutableInitialFlow = { ...fixture.initialFlow }
    const refingerprintedEvidence = structuredClone(fixture.evidence)
    refingerprintedEvidence.fingerprint = fixture.evidence.fingerprint
    const rejected = [
      layoutVNextTextBlockAuthoredBoxGeometryV2({
        initialFlow: fixture.initialFlow,
        evidence: foreign.evidence,
        persistentFlowTree: fixture.tree,
        spatialIndex: fixture.spatialIndex,
      }),
      layoutVNextTextBlockAuthoredBoxGeometryV2({
        initialFlow: structuredClone(fixture.initialFlow),
        evidence: fixture.evidence,
        persistentFlowTree: fixture.tree,
        spatialIndex: fixture.spatialIndex,
      }),
      layoutVNextTextBlockAuthoredBoxGeometryV2(accessorEnvelope),
      layoutVNextTextBlockAuthoredBoxGeometryV2({
        initialFlow: mutableInitialFlow,
        evidence: fixture.evidence,
        persistentFlowTree: fixture.tree,
        spatialIndex: fixture.spatialIndex,
      }),
      layoutVNextTextBlockAuthoredBoxGeometryV2({
        initialFlow: fixture.initialFlow,
        evidence: refingerprintedEvidence,
        persistentFlowTree: fixture.tree,
        spatialIndex: fixture.spatialIndex,
      }),
    ]
    expect(rejected).toHaveLength(5)
    for (const result of rejected) {
      expect(result).toMatchObject({
        status: "blocked",
        geometry: null,
        lines: null,
        summary: null,
        fingerprint: null,
      })
    }
  })

  it("retains overlay extent in exact auto-height without removing text flow space", () => {
    const fixture = acceptedInlineImageSpatialFixture({
      content: "image-only",
      entries: [spatialEntry({
        objectId: "overlay-below-text",
        bottomLayoutUnit: 80_000_000,
        wrapPolicy: "overlay",
      })],
    })
    const result = layoutVNextTextBlockAuthoredBoxGeometryV2({
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      spatialIndex: fixture.spatialIndex,
    })
    expect(result).toMatchObject({
      status: "accepted",
      geometry: {
        spatialMaximumBottomLayoutUnit: 80_000_000,
        contentExtentBottomLayoutUnit: 80_000_000,
        outerHeightLayoutUnit: 84_000_000,
      },
      lines: [{
        contentYOffsetLayoutUnit: 0,
        availableIntervals: [{ contentStartLayoutUnit: 0, contentEndLayoutUnit: 90_000_000 }],
        intervalPlacements: [{ contentXStartLayoutUnit: 0, contentXEndLayoutUnit: 10_000_000 }],
      }],
    })
  })

  it("reprojects intervals and auto-height from the exact moved spatial index", () => {
    const fixture = acceptedInlineImageSpatialFixture({
      content: "image-only",
      entries: [spatialEntry({ objectId: "moved", bottomLayoutUnit: 20_000_000 })],
    })
    const before = layoutVNextTextBlockAuthoredBoxGeometryV2({
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      spatialIndex: fixture.spatialIndex,
    })
    const updated = createVNextTextBlockSpatialIndexUpdateV2({
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      previousIndex: fixture.spatialIndex,
      expectedPreviousIndexFingerprint: fixture.spatialIndex.fingerprint,
      objectId: "moved",
      geometryOwnerFingerprint: `sha256:${"a".repeat(64)}`,
      nextGeometry: {
        xLayoutUnit: 0,
        yLayoutUnit: 20_000_000,
        widthLayoutUnit: 20_000_000,
        heightLayoutUnit: 60_000_000,
      },
    })
    if (updated.status !== "accepted") throw new Error("V2 spatial move blocked")
    const after = layoutVNextTextBlockAuthoredBoxGeometryV2({
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      persistentFlowTree: fixture.tree,
      spatialIndex: updated.nextIndex,
    })
    expect(before).toMatchObject({
      status: "accepted",
      lines: [{ availableIntervals: [{ contentStartLayoutUnit: 20_000_000 }] }],
      geometry: { spatialMaximumBottomLayoutUnit: 20_000_000 },
    })
    expect(after).toMatchObject({
      status: "accepted",
      lines: [{ availableIntervals: [{ contentStartLayoutUnit: 0 }] }],
      geometry: {
        spatialMaximumBottomLayoutUnit: 80_000_000,
        contentExtentBottomLayoutUnit: 80_000_000,
        outerHeightLayoutUnit: 84_000_000,
      },
    })
  })
})
