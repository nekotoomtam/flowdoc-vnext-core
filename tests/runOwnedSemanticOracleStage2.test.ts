import { describe, expect, it } from "vitest"
import {
  evaluateRunOwnedSemanticOracleStage2,
  type RunOwnedParagraphContext,
  type RunOwnedProviderRun,
  type RunOwnedSemanticOracleStage2Input,
} from "../src/layout/runOwnedSemanticOracleStage2.js"

const paragraph: RunOwnedParagraphContext = {
  paragraphId: "paragraph-stage2",
  baseDirection: "ltr" as const,
  writingMode: "horizontal-tb" as const,
}

function inputFor(
  text: string,
  providerRuns: readonly RunOwnedProviderRun[],
  caretOffset: number,
): RunOwnedSemanticOracleStage2Input {
  return {
    committedText: text,
    authoredSpans: [{
      spanId: "span-1",
      startOffset: 0,
      endOffset: text.length,
      text,
      language: "und",
      styleKey: "body",
    }],
    paragraph,
    caretOffset,
    composition: "committed" as const,
    provider: {
      providerId: "reviewed-provider-fixture",
      providerRevision: "stage2-fixture-v1",
      runs: providerRuns,
      graphemeSafeOffsets: [0, caretOffset, text.length],
      seamCertificates: [{
        certificateId: `seam-${caretOffset}`,
        caretOffset,
        leftSourceRange: { startOffset: Math.max(0, caretOffset - 1), endOffset: caretOffset },
        rightSourceRange: { startOffset: caretOffset, endOffset: Math.min(text.length, caretOffset + 1) },
        sourceFactUnits: 2,
        propertyFactUnits: 2,
        shapingAndSegmentationUnits: 2,
        edgeFacts: {
          glyphFacts: ["glyph-boundary"],
          clusterFacts: ["cluster-boundary"],
          breakFacts: ["break-boundary"],
          unsafeBoundaryFacts: ["no-unsafe-boundary"],
        },
      }],
    },
  }
}

function latinRun(startOffset: number, endOffset: number): RunOwnedProviderRun {
  return {
    startOffset,
    endOffset,
    script: "Latin",
    direction: "ltr" as const,
    language: "en",
    fontId: "Sarabun-Regular",
    features: ["kern", "liga"],
  }
}

describe("run-owned semantic oracle stage 2", () => {
  it("certifies a same-property Enter by splitting provider-backed analysis facts at the seam", () => {
    const result = evaluateRunOwnedSemanticOracleStage2(inputFor("AB", [latinRun(0, 2)], 1))

    expect(result).toEqual({
      runs: [
        expect.objectContaining({ startOffset: 0, endOffset: 1, text: "A", analysisKey: expect.objectContaining({ script: "Latin", direction: "ltr" }) }),
        expect.objectContaining({ startOffset: 1, endOffset: 2, text: "B", analysisKey: expect.objectContaining({ script: "Latin", direction: "ltr" }) }),
      ],
      decision: expect.objectContaining({
        status: "certified",
        certificateId: "seam-1",
        caretOffset: 1,
        seamFacts: expect.objectContaining({
          paragraphContext: expect.objectContaining({ baseDirection: "ltr", writingMode: "horizontal-tb" }),
          leftAnalysisKey: expect.objectContaining({ script: "Latin", direction: "ltr" }),
          rightAnalysisKey: expect.objectContaining({ script: "Latin", direction: "ltr" }),
          edgeFacts: expect.objectContaining({
            glyphFacts: ["glyph-boundary"],
            clusterFacts: ["cluster-boundary"],
            breakFacts: ["break-boundary"],
            unsafeBoundaryFacts: ["no-unsafe-boundary"],
          }),
        }),
      }),
    })
  })

  it("keeps Thai-left and Latin-right analysis keys separate across a certified Enter", () => {
    const result = evaluateRunOwnedSemanticOracleStage2(inputFor("กA", [
      { ...latinRun(0, 1), script: "Thai", language: "th", fontId: "Sarabun-Thai" },
      latinRun(1, 2),
    ], 1))

    expect(result.decision).toMatchObject({ status: "certified", caretOffset: 1 })
    expect(result.runs.map((run) => [run.text, run.analysisKey.script, run.analysisKey.language])).toEqual([
      ["ก", "Thai", "th"],
      ["A", "Latin", "en"],
    ])
  })

  it("certifies off|ice as two same-key analysis descriptors only when an explicit local seam is supplied", () => {
    const result = evaluateRunOwnedSemanticOracleStage2(inputFor("office", [latinRun(0, 6)], 3))

    expect(result).toMatchObject({ decision: { status: "certified", certificateId: "seam-3" } })
    expect(result.runs.map((run) => [run.startOffset, run.endOffset, run.text])).toEqual([
      [0, 3, "off"],
      [3, 6, "ice"],
    ])
  })

  it("rejects unsafe Thai combining, surrogate, and ZWJ caret boundaries instead of inventing a seam", () => {
    const thai = inputFor("ก่", [{ ...latinRun(0, 2), script: "Thai", language: "th" }], 1)
    thai.provider.graphemeSafeOffsets = [0, 2]
    const surrogate = inputFor("😀A", [{ ...latinRun(0, 3), script: "Common" }], 1)
    const zwj = inputFor("👩‍💻", [{ ...latinRun(0, 5), script: "Common" }], 2)
    zwj.provider.graphemeSafeOffsets = [0, 5]

    expect(evaluateRunOwnedSemanticOracleStage2(thai).decision).toEqual({ status: "not-admissible", reason: "uncertified-boundary" })
    expect(evaluateRunOwnedSemanticOracleStage2(surrogate).decision).toEqual({ status: "not-admissible", reason: "unsafe-surrogate-pair" })
    expect(evaluateRunOwnedSemanticOracleStage2(zwj).decision).toEqual({ status: "not-admissible", reason: "uncertified-boundary" })
  })

  it("rejects active composition without treating preedit as committed source", () => {
    const input = inputFor("AB", [latinRun(0, 2)], 1)
    input.composition = "active"

    expect(evaluateRunOwnedSemanticOracleStage2(input).decision).toEqual({ status: "not-admissible", reason: "composition-active" })
  })

  it("keeps paragraph direction distinct from run script across an RTL first-strong change", () => {
    const input = inputFor("אA", [
      { ...latinRun(0, 1), script: "Hebrew", direction: "rtl" as const, language: "he", fontId: "Sarabun-Hebrew" },
      latinRun(1, 2),
    ], 1)
    input.paragraph = { ...paragraph, baseDirection: "rtl" }
    const result = evaluateRunOwnedSemanticOracleStage2(input)

    expect(input.paragraph.baseDirection).toBe("rtl")
    expect(result.decision).toMatchObject({ status: "certified" })
    expect(result.runs.map((run) => [run.analysisKey.script, run.analysisKey.direction, run.analysisKey.paragraphBaseDirection])).toEqual([
      ["Hebrew", "rtl", "rtl"],
      ["Latin", "ltr", "rtl"],
    ])
  })

  it("returns typed non-admissibility for a missing or over-budget seam certificate", () => {
    const missing = inputFor("office", [latinRun(0, 6)], 3)
    missing.provider.seamCertificates = []
    const overBudget = inputFor("office", [latinRun(0, 6)], 3)
    overBudget.provider.seamCertificates[0]!.shapingAndSegmentationUnits = 1_025

    expect(evaluateRunOwnedSemanticOracleStage2(missing).decision).toEqual({ status: "not-admissible", reason: "uncertified-seam" })
    expect(evaluateRunOwnedSemanticOracleStage2(overBudget).decision).toEqual({ status: "not-admissible", reason: "uncertified-seam" })
  })
})
