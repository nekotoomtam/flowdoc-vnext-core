import { describe, expect, it } from "vitest"
import {
  createVNextColumnsV4TextFragmentSource,
  type VNextTextBlockV4MeasuredLinesResult,
} from "../src/index.js"

function point(offset: number) {
  return {
    textBlockId: "body-text",
    inlineId: "body-run",
    authoredOffset: offset,
    resolvedOffset: offset,
    affinity: "forward" as const,
  }
}

function accepted(): VNextTextBlockV4MeasuredLinesResult {
  return {
    source: "vnext-text-block-v4-measurement",
    version: 1,
    status: "accepted",
    textBlockId: "body-text",
    lines: [
      { index: 0, startOffset: 0, endOffset: 4, text: "Line", widthPt: 30, heightPt: 12, sourceStart: point(0), sourceEnd: point(4) },
      { index: 1, startOffset: 4, endOffset: 8, text: " two", widthPt: 35, heightPt: 14, sourceStart: point(4), sourceEnd: point(8) },
      { index: 2, startOffset: 8, endOffset: 12, text: " end", widthPt: 32, heightPt: 10, sourceStart: point(8), sourceEnd: point(12) },
    ],
    issues: [],
    summary: { lineCount: 3, renderedLength: 12, totalHeightPt: 36 },
  }
}

describe("columns v4 child fragments", () => {
  it("adapts accepted text lines without measurement or source mutation", () => {
    const measured = accepted()
    const before = JSON.stringify(measured)
    const result = createVNextColumnsV4TextFragmentSource(measured)

    expect(result).toMatchObject({
      status: "ready",
      fragmentSource: {
        kind: "text-block-lines",
        nodeId: "body-text",
        keepPolicy: "allow-split",
        prefixHeightsPt: [0, 12, 26, 36],
        totalHeightPt: 36,
        candidates: [
          { fragmentId: "body-text:line-0", fragmentIndex: 0, heightPt: 12 },
          { fragmentId: "body-text:line-1", fragmentIndex: 1, heightPt: 14 },
          { fragmentId: "body-text:line-2", fragmentIndex: 2, heightPt: 10 },
        ],
      },
    })
    expect(JSON.stringify(measured)).toBe(before)
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it("retains keep policy and produces deterministic fingerprints", () => {
    const first = createVNextColumnsV4TextFragmentSource(accepted(), { keepPolicy: "prefer-together" })
    const second = createVNextColumnsV4TextFragmentSource(accepted(), { keepPolicy: "prefer-together" })
    const split = createVNextColumnsV4TextFragmentSource(accepted())

    expect(first.status === "ready" && first.fragmentSource.keepPolicy).toBe("prefer-together")
    expect(first.status === "ready" && second.status === "ready"
      && first.fragmentSource.fingerprint).toBe(second.status === "ready" ? second.fragmentSource.fingerprint : "")
    expect(first.status === "ready" && split.status === "ready"
      && first.fragmentSource.fingerprint).not.toBe(split.status === "ready" ? split.fragmentSource.fingerprint : "")
  })

  it("blocks unaccepted measured lines", () => {
    const blocked: VNextTextBlockV4MeasuredLinesResult = {
      source: "vnext-text-block-v4-measurement",
      version: 1,
      status: "blocked",
      textBlockId: "body-text",
      lines: null,
      issues: [{ code: "bad-lines", path: "lines", message: "bad", severity: "error" }],
    }

    expect(createVNextColumnsV4TextFragmentSource(blocked)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "text-lines-not-accepted" })],
    })
  })
})
