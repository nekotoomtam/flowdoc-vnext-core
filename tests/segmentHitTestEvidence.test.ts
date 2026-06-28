import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  RENDERER_SEGMENT_HIT_TEST_EVIDENCE_MODE,
  RENDERER_SEGMENT_HIT_TEST_EVIDENCE_SOURCE,
  type RendererSegmentFact,
  createRendererHitTestEvidence,
  validateRendererSegmentEvidence,
} from "../src/index.js"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

const segments: RendererSegmentFact[] = [
  {
    atomic: false,
    box: { height: 14, width: 50, x: 0, y: 0 },
    fieldChip: false,
    glyphRange: { end: 5, start: 0 },
    inlineChildId: "inline-text-1",
    lineIndex: 0,
    segmentId: "seg-text-1",
    styleFacts: { fontWeight: "bold" },
    textBlockId: "cover-title",
    utf16Range: { end: 5, start: 0 },
  },
  {
    atomic: true,
    box: { height: 14, width: 28, x: 54, y: 0 },
    fieldChip: true,
    glyphRange: { end: 5, start: 5 },
    inlineChildId: "inline-field-1",
    lineIndex: 0,
    segmentId: "seg-chip-1",
    styleFacts: { fieldKey: "customer.name" },
    textBlockId: "cover-title",
    utf16Range: { end: 6, start: 5 },
  },
  {
    atomic: false,
    box: { height: 14, width: 50, x: 86, y: 0 },
    fieldChip: false,
    glyphRange: { end: 10, start: 5 },
    inlineChildId: "inline-text-2",
    lineIndex: 0,
    segmentId: "seg-text-2",
    textBlockId: "cover-title",
    utf16Range: { end: 11, start: 6 },
  },
]

describe("renderer segment hit-test evidence boundary", () => {
  it("validates renderer-backed segment facts and represents atomic field chips", () => {
    const result = validateRendererSegmentEvidence(segments)

    expect(result).toMatchObject({
      issues: [],
      mode: RENDERER_SEGMENT_HIT_TEST_EVIDENCE_MODE,
      segmentCount: 3,
      source: RENDERER_SEGMENT_HIT_TEST_EVIDENCE_SOURCE,
      status: "ready",
      version: 1,
    })
  })

  it("returns hit-test evidence with exact and nearest confidence", () => {
    const textHit = createRendererHitTestEvidence(segments, {
      point: { x: 25, y: 7 },
      textBlockId: "cover-title",
    })
    const chipHit = createRendererHitTestEvidence(segments, {
      point: { x: 60, y: 7 },
      textBlockId: "cover-title",
    })
    const nearest = createRendererHitTestEvidence(segments, {
      point: { x: 300, y: 20 },
      textBlockId: "cover-title",
    })

    expect(textHit.hit).toMatchObject({
      affinity: "inside",
      confidence: "exact",
      nearestOffset: 3,
      segmentId: "seg-text-1",
    })
    expect(chipHit.hit).toMatchObject({
      affinity: "atomic-boundary",
      confidence: "exact",
      nearestOffset: 5,
      segmentId: "seg-chip-1",
    })
    expect(nearest.hit).toMatchObject({
      affinity: "unknown",
      confidence: "nearest",
      segmentId: "seg-text-2",
    })
    expect(typeof nearest.hit.nearestOffset).toBe("number")
  })

  it("blocks invalid UTF-16 ranges and non-atomic field chip segments", () => {
    const invalid = validateRendererSegmentEvidence([
      {
        ...segments[0],
        segmentId: "bad-range",
        utf16Range: { end: 2, start: 4 },
      },
      {
        ...segments[1],
        atomic: false,
        segmentId: "bad-chip",
        utf16Range: { end: 7, start: 6 },
      },
    ])
    const hit = createRendererHitTestEvidence([
      {
        ...segments[0],
        segmentId: "bad-range",
        utf16Range: { end: 2, start: 4 },
      },
    ], {
      point: { x: 10, y: 4 },
    })

    expect(invalid.status).toBe("blocked")
    expect(invalid.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "field-chip-must-be-atomic",
      "invalid-utf16-range",
    ]))
    expect(hit.hit).toMatchObject({
      affinity: "unknown",
      confidence: "none",
      nearestOffset: null,
      segmentId: null,
    })
  })

  it("keeps renderer segment evidence dependency-clean and evidence-only", () => {
    const source = readText("../src/renderer/segmentHitTestEvidence.ts")
    const index = readText("../src/index.ts")

    expect(source).toContain("RENDERER_SEGMENT_HIT_TEST_EVIDENCE_SOURCE")
    expect(source).toContain("createRendererHitTestEvidence")
    expect(source).toContain("field-chip-must-be-atomic")
    expect(source).not.toContain("document.")
    expect(source).not.toContain("querySelector")
    expect(source).not.toContain("getSelection")
    expect(source).not.toContain("FlowDocEditor")
    expect(index).toContain('./renderer/segmentHitTestEvidence.js')
  })

  it("documents Phase 161 and advances the roadmap to Phase 162", () => {
    const doc = readText("../docs/RENDERER_SEGMENT_HIT_TEST_EVIDENCE_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Phase 161 renderer segment and hit-test evidence boundary.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL / BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("No renderer execution.")
    expect(doc).toContain("No caret parity claim.")
    expect(doc).toContain("Phase 162: Hybrid Input Close Audit")
    expect(readme).toContain("Renderer segment / hit-test evidence boundary")
    expect(readme).toContain("docs/RENDERER_SEGMENT_HIT_TEST_EVIDENCE_BOUNDARY.md")
    expect(ledger).toContain("| 161 | Renderer segment and hit-test evidence boundary | done |")
    expect(roadmap).toContain("## Phase 161: Renderer Segment / Hit-Test Evidence Boundary")
    expect(roadmap).toContain("Phase 162: Hybrid Input Close Audit")
  })
})
