import { describe, expect, it } from "vitest"
import {
  evaluateRunOwnedSemanticOracleStage2,
  type RunOwnedAuthoredSpan,
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
  authoredSpans: readonly RunOwnedAuthoredSpan[] = [{
    spanId: "span-1",
    startOffset: 0,
    endOffset: text.length,
    text,
    language: "und",
    styleKey: "body",
  }],
): RunOwnedSemanticOracleStage2Input {
  const leftProviderRun = [...providerRuns].reverse().find((run) => (
    run.startOffset < caretOffset && run.endOffset >= caretOffset
  ))!
  const rightProviderRun = providerRuns.find((run) => (
    run.startOffset <= caretOffset && run.endOffset > caretOffset
  ))!
  const propertiesFor = (startOffset: number, endOffset: number) => authoredSpans
    .filter((span) => span.startOffset < endOffset && span.endOffset > startOffset)
    .map((span) => ({
      spanId: span.spanId,
      language: span.language ?? null,
      styleKey: span.styleKey ?? null,
    }))
  return {
    committedText: text,
    authoredSpans,
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
        sourceBinding: {
          committedText: text,
          authoredSpans: authoredSpans.map(({ spanId, startOffset, endOffset }) => ({ spanId, startOffset, endOffset })),
        },
        providerId: "reviewed-provider-fixture",
        providerRevision: "stage2-fixture-v1",
        paragraphContext: { ...paragraph },
        leftProviderRunId: leftProviderRun.runId,
        rightProviderRunId: rightProviderRun.runId,
        leftAuthoredProperties: propertiesFor(leftProviderRun.startOffset, caretOffset),
        rightAuthoredProperties: propertiesFor(caretOffset, rightProviderRun.endOffset),
        edgeFacts: {
          glyphFacts: [{ factId: "glyph-boundary", startOffset: Math.max(0, caretOffset - 1), endOffset: Math.min(text.length, caretOffset + 1) }],
          clusterFacts: [{ factId: "cluster-boundary", startOffset: Math.max(0, caretOffset - 1), endOffset: Math.min(text.length, caretOffset + 1) }],
          breakFacts: [{ factId: "break-boundary", startOffset: Math.max(0, caretOffset - 1), endOffset: Math.min(text.length, caretOffset + 1) }],
          unsafeBoundaryEvidence: { status: "safe", caretOffset },
        },
      }],
    },
  }
}

function latinRun(startOffset: number, endOffset: number): RunOwnedProviderRun {
  return {
    runId: `latin-${startOffset}-${endOffset}`,
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
            glyphFacts: [expect.objectContaining({ factId: "glyph-boundary" })],
            clusterFacts: [expect.objectContaining({ factId: "cluster-boundary" })],
            breakFacts: [expect.objectContaining({ factId: "break-boundary" })],
            unsafeBoundaryEvidence: { status: "safe", caretOffset: 1 },
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
    input.provider.seamCertificates[0]!.paragraphContext = { ...input.paragraph }
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

  it("rejects unsafe, malformed, and provenance-mismatched seam certificates", () => {
    const unsafe = inputFor("AB", [latinRun(0, 2)], 1)
    unsafe.provider.seamCertificates[0]!.edgeFacts.unsafeBoundaryEvidence = { status: "unsafe", reason: "provider-unsafe" }
    const malformed = inputFor("AB", [latinRun(0, 2)], 1)
    malformed.provider.seamCertificates[0]!.edgeFacts.glyphFacts = [{ factId: "bad-range", startOffset: 2, endOffset: 1 }]
    const sourceMismatch = inputFor("AB", [latinRun(0, 2)], 1)
    sourceMismatch.provider.seamCertificates[0]!.sourceBinding.committedText = "other"
    const providerMismatch = inputFor("AB", [latinRun(0, 2)], 1)
    providerMismatch.provider.seamCertificates[0]!.providerRevision = "other-provider-revision"

    expect(evaluateRunOwnedSemanticOracleStage2(unsafe).decision).toEqual({ status: "not-admissible", reason: "uncertified-seam" })
    expect(evaluateRunOwnedSemanticOracleStage2(malformed).decision).toEqual({ status: "not-admissible", reason: "uncertified-seam" })
    expect(evaluateRunOwnedSemanticOracleStage2(sourceMismatch).decision).toEqual({ status: "not-admissible", reason: "uncertified-seam" })
    expect(evaluateRunOwnedSemanticOracleStage2(providerMismatch).decision).toEqual({ status: "not-admissible", reason: "uncertified-seam" })
  })

  it("binds Thai-left and Latin-right authored language/style properties into each certified run", () => {
    const authoredSpans: RunOwnedAuthoredSpan[] = [
      { spanId: "thai-authored", startOffset: 0, endOffset: 1, text: "ก", language: "th", styleKey: "thai-body" },
      { spanId: "latin-authored", startOffset: 1, endOffset: 2, text: "A", language: "en", styleKey: "latin-emphasis" },
    ]
    const input = inputFor("กA", [
      { ...latinRun(0, 1), runId: "thai-provider", script: "Thai", language: "th", fontId: "Sarabun-Thai" },
      { ...latinRun(1, 2), runId: "latin-provider" },
    ], 1, authoredSpans)
    const result = evaluateRunOwnedSemanticOracleStage2(input)

    expect(result).toMatchObject({ decision: { status: "certified" } })
    expect(result.runs.map((run) => run.authoredProperties)).toEqual([
      [{ spanId: "thai-authored", language: "th", styleKey: "thai-body" }],
      [{ spanId: "latin-authored", language: "en", styleKey: "latin-emphasis" }],
    ])
    input.authoredSpans[1]!.styleKey = "latin-revised"
    expect(evaluateRunOwnedSemanticOracleStage2(input).decision).toEqual({ status: "not-admissible", reason: "uncertified-seam" })
  })

  it("keeps fixed RTL paragraph context while paired first-strong orders derive different run direction facts", () => {
    const fixedContext: RunOwnedParagraphContext = { ...paragraph, baseDirection: "rtl" }
    const hebrewFirst = inputFor("אA", [
      { ...latinRun(0, 1), runId: "hebrew-left", script: "Hebrew", direction: "rtl", language: "he", fontId: "Sarabun-Hebrew" },
      { ...latinRun(1, 2), runId: "latin-right" },
    ], 1)
    hebrewFirst.paragraph = fixedContext
    hebrewFirst.provider.seamCertificates[0]!.paragraphContext = { ...fixedContext }
    const latinFirst = inputFor("Aא", [
      { ...latinRun(0, 1), runId: "latin-left" },
      { ...latinRun(1, 2), runId: "hebrew-right", script: "Hebrew", direction: "rtl", language: "he", fontId: "Sarabun-Hebrew" },
    ], 1)
    latinFirst.paragraph = fixedContext
    latinFirst.provider.seamCertificates[0]!.paragraphContext = { ...fixedContext }

    expect(evaluateRunOwnedSemanticOracleStage2(hebrewFirst).runs.map((run) => [run.analysisKey.script, run.analysisKey.direction, run.analysisKey.paragraphBaseDirection])).toEqual([
      ["Hebrew", "rtl", "rtl"],
      ["Latin", "ltr", "rtl"],
    ])
    expect(evaluateRunOwnedSemanticOracleStage2(latinFirst).runs.map((run) => [run.analysisKey.script, run.analysisKey.direction, run.analysisKey.paragraphBaseDirection])).toEqual([
      ["Latin", "ltr", "rtl"],
      ["Hebrew", "rtl", "rtl"],
    ])
  })
})
