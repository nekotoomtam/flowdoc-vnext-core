import { describe, expect, it } from "vitest"
import { prepareCreatorPreviewLinesV1 } from "../src/creatorPreview/layoutFactsV1.js"
import type { VNextCreatorTextResolvedV1 } from "../src/creatorPreview/contentV1.js"
import type { VNextCreatorPreviewRawMeasurementProviderV1 } from "../src/creatorPreview/engineV1.js"

// Controlled fact tests supplement, rather than stand in for, pinned-engine regressions.
const source = (text: string) => ({ prefix: "", value: text, suffix: "", text }) as VNextCreatorTextResolvedV1
function provider(advances: Record<string, number>, breaks: number[]): VNextCreatorPreviewRawMeasurementProviderV1 {
  return {
    segment: () => breaks,
    shape: text => ({ text, unitsPerEm: 1000, ascentFontUnit: 1068, descentFontUnit: -232,
      glyphs: [...text].map((char, clusterUtf16) => ({ glyphId: 1, clusterUtf16, xAdvance: advances[char], yAdvance: 0, xOffset: 0, yOffset: 0 })) }),
  }
}
describe("Creator line planning width boundaries with controlled facts", () => {
  it.each([42606, 42607])("fills the current line to a shaping-cluster boundary without preferring an ordinary-word break (%i)", advance => {
    const lines = prepareCreatorPreviewLinesV1(source("PAB"), provider({ P: 1000, A: 1000, B: advance }, [0, 1, 3]))
    // 43606 font units = 523.272pt fits; 43607 = 523.284pt exceeds 523.27559pt.
    expect(lines.map(line => line.map(cluster => cluster.start))).toEqual([[0, 1], [2]])
  })
  it("rejects one unsplittable cluster wider than a full line", () => {
    expect(() => prepareCreatorPreviewLinesV1(source("X"), provider({ X: 43607 }, [0, 1]))).toThrow(/cluster exceeds the body width/)
  })
})
