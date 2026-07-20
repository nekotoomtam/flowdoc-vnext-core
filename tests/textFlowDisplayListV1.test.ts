import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockV4MeasuredLines,
  paginateVNextTextFlowV4,
  projectVNextTextFlowDisplayListV1,
  type VNextTextBlockV4MeasurementRequest,
} from "../src/index.js"

function acceptedMeasurement(lineCount = 3) {
  const text = Array.from({ length: lineCount }, (_, index) => `L${index}`).join("")
  const request: VNextTextBlockV4MeasurementRequest = {
    documentId: "document-1",
    instanceRevision: 1,
    sectionId: "section-1",
    textBlockId: "body-text",
    availableWidthPt: 180,
    measurementProfileId: "profile-1",
    styleKey: "paragraph/body",
    renderedText: text,
    runs: [{
      inlineId: "body-run",
      kind: "text",
      renderStartOffset: 0,
      renderEndOffset: text.length,
      renderedText: text,
      styleKey: "paragraph/body",
    }],
  }
  const accepted = acceptVNextTextBlockV4MeasuredLines(request, Array.from({ length: lineCount }, (_, index) => ({
    index,
    startOffset: index * 2,
    endOffset: index * 2 + 2,
    text: `L${index}`,
    widthPt: 24 + index,
    heightPt: 18,
  })))
  if (accepted.status !== "accepted") throw new Error("measurement acceptance blocked")
  return accepted
}

function pagination(lineCount = 3, pageBodyHeightPt = 36) {
  return paginateVNextTextFlowV4({
    accepted: acceptedMeasurement(lineCount),
    pageBodyHeightPt,
    maximumPageCount: 10,
  })
}

function project(overrides: Partial<Parameters<typeof projectVNextTextFlowDisplayListV1>[0]> = {}) {
  return projectVNextTextFlowDisplayListV1({
    projectionId: "display-list-1",
    pagination: pagination(),
    pageBox: {
      widthPt: 595.28,
      heightPt: 841.89,
      body: { xPt: 72, yPt: 72, widthPt: 180, heightPt: 36 },
    },
    style: {
      styleKey: "paragraph/body",
      fontId: "sarabun-regular",
      fontFamily: "Sarabun",
      fontSizePt: 12,
      baselineOffsetPt: 13.5,
      color: "172033",
    },
    ...overrides,
  })
}

describe("text-flow display-list v1", () => {
  it("projects measured pages into deterministic no-relayout line commands", () => {
    const source = pagination()
    const before = JSON.stringify(source)
    const first = project({ pagination: source })
    const second = project({ pagination: source })

    expect(first.status).toBe("ready")
    if (first.status !== "ready" || second.status !== "ready") throw new Error("projection blocked")
    expect(first).toEqual(second)
    expect(first.summary).toEqual({ pageCount: 2, commandCount: 3, nonBlankCommandCount: 3 })
    expect(first.pages.map((page) => [page.pageNumber, page.commands.length])).toEqual([[1, 2], [2, 1]])
    expect(first.commands[0]).toMatchObject({
      kind: "text-line",
      pageIndex: 0,
      lineIndex: 0,
      text: "L0",
      bounds: { xPt: 72, yPt: 72, widthPt: 24, heightPt: 18 },
      baselineYPt: 85.5,
    })
    expect(first.contracts).toEqual({
      consumes: "vnext-text-flow-v4-window-pagination",
      rendererMayMeasureText: false,
      rendererMayRelayout: false,
      lineBreaksAndBounds: "core-measured",
      glyphRasterization: "renderer-owned",
      artifactBytes: false,
      productionBinding: false,
    })
    expect(first.fingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
    expect(JSON.stringify(source)).toBe(before)
  })

  it("fails closed on incomplete pagination, geometry drift, and production binding", () => {
    const partial = paginateVNextTextFlowV4({
      accepted: acceptedMeasurement(3),
      pageBodyHeightPt: 36,
      maximumPageCount: 1,
    })
    const invalid = project({
      bindProductionRenderer: true,
      pagination: partial,
      pageBox: { widthPt: 100, heightPt: 100, body: { xPt: 90, yPt: 0, widthPt: 180, heightPt: 35 } },
    })
    expect(invalid.status).toBe("blocked")
    expect(invalid.issues.map((candidate) => candidate.code)).toEqual(expect.arrayContaining([
      "production-binding-forbidden",
      "pagination-not-complete",
      "invalid-body-box",
    ]))
  })

  it("blocks page-height and line-width drift rather than letting a renderer relayout", () => {
    const result = project({
      pageBox: {
        widthPt: 595.28,
        heightPt: 841.89,
        body: { xPt: 72, yPt: 72, widthPt: 20, heightPt: 35 },
      },
    })
    expect(result.status).toBe("blocked")
    expect(result.issues.map((candidate) => candidate.code)).toEqual(expect.arrayContaining([
      "page-body-height-mismatch",
      "line-outside-body",
    ]))
  })

  it("keeps the Core projector independent from browser and concrete renderer APIs", () => {
    const source = readFileSync(new URL("../src/renderer/textFlowDisplayListV1.ts", import.meta.url), "utf8")
    const doc = readFileSync(new URL("../docs/LIVE_DRAFT_XR4_TEXT_FLOW_DISPLAY_LIST.md", import.meta.url), "utf8")
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    expect(source).not.toMatch(/Canvas|canvas|document\.|window\.|measureText|fillText|fetch\(/u)
    expect(doc).toContain("rendererMayMeasureText = false")
    expect(doc).toContain("glyphRasterization = renderer-owned")
    expect(readme).toContain("Live Draft XR-4 adds a separate QA-only pure projection")
  })
})
