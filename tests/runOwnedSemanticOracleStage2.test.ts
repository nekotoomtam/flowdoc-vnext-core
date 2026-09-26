import { describe, expect, it } from "vitest"
import {
  evaluateRunOwnedSemanticOracleStage2,
  type RunOwnedAuthoredSpan,
  type RunOwnedParagraphContext,
  type RunOwnedProviderRun,
  type RunOwnedSemanticOracleStage2Input,
  type RunOwnedSeamCertificate,
  type RunOwnedProofBinding,
  type RunOwnedProofWork,
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
  const binding: RunOwnedProofBinding = structuredClone({
    committedText: text, authoredSpans, paragraph, providerId: "reviewed-provider-fixture",
    providerRevision: "stage2-fixture-v1", runs: providerRuns,
    graphemeSafeOffsets: [0, caretOffset, text.length], caretOffset,
  })
  const range = { startOffset: Math.max(0, caretOffset - 1), endOffset: Math.min(text.length, caretOffset + 1) }
  const edgeFacts: RunOwnedSeamCertificate["edgeFacts"] = {
    glyphFacts: [{ factId: "glyph-boundary", ...range }],
    clusterFacts: [{ factId: "cluster-boundary", ...range }],
    breakFacts: [{ factId: "break-boundary", ...range }],
    unsafeBoundaryEvidence: { status: "safe", caretOffset },
  }
  const edge = { glyphFactIds: ["glyph-boundary"], clusterFactIds: ["cluster-boundary"], breakFactIds: ["break-boundary"], safety: "safe" as const }
  const work: RunOwnedProofWork[] = (["before", "after"] as const).flatMap((phase) => (
    (["source", "property", "shaping", "segmentation"] as const).map((kind) => ({
      operationId: `${phase}-${kind}`, phase, kind, timing: "immediate", ranges: [{ ...range }],
    }))
  ))
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
        work,
        beforeFacts: structuredClone(edgeFacts),
        edgeSummaries: {
          binding: structuredClone(binding),
          before: { left: structuredClone(edge), right: structuredClone(edge) },
          after: { left: structuredClone(edge), right: structuredClone(edge) },
        },
        outsideRangeValidity: {
          binding: structuredClone(binding), status: "preserved",
          ranges: [{ startOffset: 0, endOffset: range.startOffset }, { startOffset: range.endOffset, endOffset: text.length }]
            .filter((outside) => outside.endOffset > outside.startOffset)
            .map((outside) => ({ ...outside, beforeDigest: `sha256:${"a".repeat(64)}`, afterDigest: `sha256:${"a".repeat(64)}`, validity: "unchanged" })),
        },
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
        edgeFacts,
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
    input.provider.seamCertificates[0]!.edgeSummaries.binding.paragraph = { ...input.paragraph }
    input.provider.seamCertificates[0]!.outsideRangeValidity.binding.paragraph = { ...input.paragraph }
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
    overBudget.provider.seamCertificates[0]!.work = [
      ...overBudget.provider.seamCertificates[0]!.work,
      ...Array.from({ length: 509 }, (_, i): RunOwnedProofWork => ({
        operationId: `extra-${i}`, kind: "shaping", phase: "after", timing: "deferred", ranges: [{ startOffset: 2, endOffset: 4 }],
      })),
    ]

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
    hebrewFirst.provider.seamCertificates[0]!.edgeSummaries.binding.paragraph = { ...fixedContext }
    hebrewFirst.provider.seamCertificates[0]!.outsideRangeValidity.binding.paragraph = { ...fixedContext }
    const latinFirst = inputFor("Aא", [
      { ...latinRun(0, 1), runId: "latin-left" },
      { ...latinRun(1, 2), runId: "hebrew-right", script: "Hebrew", direction: "rtl", language: "he", fontId: "Sarabun-Hebrew" },
    ], 1)
    latinFirst.paragraph = fixedContext
    latinFirst.provider.seamCertificates[0]!.paragraphContext = { ...fixedContext }
    latinFirst.provider.seamCertificates[0]!.edgeSummaries.binding.paragraph = { ...fixedContext }
    latinFirst.provider.seamCertificates[0]!.outsideRangeValidity.binding.paragraph = { ...fixedContext }

    expect(evaluateRunOwnedSemanticOracleStage2(hebrewFirst).decision.status).toBe("certified")
    expect(evaluateRunOwnedSemanticOracleStage2(latinFirst).decision.status).toBe("certified")

    expect(evaluateRunOwnedSemanticOracleStage2(hebrewFirst).runs.map((run) => [run.analysisKey.script, run.analysisKey.direction, run.analysisKey.paragraphBaseDirection])).toEqual([
      ["Hebrew", "rtl", "rtl"],
      ["Latin", "ltr", "rtl"],
    ])
    expect(evaluateRunOwnedSemanticOracleStage2(latinFirst).runs.map((run) => [run.analysisKey.script, run.analysisKey.direction, run.analysisKey.paragraphBaseDirection])).toEqual([
      ["Latin", "ltr", "rtl"],
      ["Hebrew", "rtl", "rtl"],
    ])
  })

  it.each(["glyphFacts", "clusterFacts", "breakFacts"] as const)("rejects zero-length and far-edge-only %s", (kind) => {
    for (const range of [{ startOffset: 3, endOffset: 3 }, { startOffset: 2, endOffset: 3 }]) {
      const input = inputFor("office", [latinRun(0, 6)], 3)
      input.provider.seamCertificates[0]!.edgeFacts[kind] = [{ factId: "incomplete", ...range }]
      expect(evaluateRunOwnedSemanticOracleStage2(input).decision).toEqual({ status: "not-admissible", reason: "uncertified-seam" })
    }
  })

  it("rejects caller counters even when a fractional or zero value is below the budget", () => {
    for (const counter of [0, 0.5]) {
      const input = inputFor("AB", [latinRun(0, 2)], 1)
      Object.assign(input.provider.seamCertificates[0]!, { sourceFactUnits: counter })
      expect(evaluateRunOwnedSemanticOracleStage2(input).decision.status).toBe("not-admissible")
    }
  })

  it("requires edge summaries and outside-range validity proof", () => {
    const input = inputFor("AB", [latinRun(0, 2)], 1)
    // Runtime absence must be typed rejection, never a throw or accepted default.
    Reflect.deleteProperty(input.provider.seamCertificates[0]!, "edgeSummaries")
    Reflect.deleteProperty(input.provider.seamCertificates[0]!, "outsideRangeValidity")
    expect(evaluateRunOwnedSemanticOracleStage2(input).decision.status).toBe("not-admissible")
  })

  it.each([
    ["direction", "sideways"], ["features", ["liga", "liga"]],
    ["features", [""]], ["features", [123]], ["features", ["not-a-feature"]],
  ])("rejects malformed runtime run field %s = %j", (field, value) => {
    const input = inputFor("AB", [latinRun(0, 2)], 1)
    Object.assign(input.provider.runs[0]!, { [field as string]: value })
    expect(evaluateRunOwnedSemanticOracleStage2(input).decision).toEqual({ status: "not-admissible", reason: "invalid-provider-facts" })
  })

  it("rejects empty provider and authored identities and duplicate span IDs", () => {
    for (const field of ["providerId", "providerRevision"]) {
      const input = inputFor("AB", [latinRun(0, 2)], 1)
      Object.assign(input.provider, { [field]: "" })
      expect(evaluateRunOwnedSemanticOracleStage2(input).decision).toEqual({ status: "not-admissible", reason: "invalid-provider-facts" })
    }
    for (const ids of [["", "b"], ["same", "same"]]) {
      const input = inputFor("AB", [latinRun(0, 2)], 1)
      input.authoredSpans = [
        { spanId: ids[0]!, startOffset: 0, endOffset: 1, text: "A" },
        { spanId: ids[1]!, startOffset: 1, endOffset: 2, text: "B" },
      ]
      expect(evaluateRunOwnedSemanticOracleStage2(input).decision).toEqual({ status: "not-admissible", reason: "invalid-provider-facts" })
    }
  })

  it.each(["source", "property", "shaping", "segmentation"] as const)("charges repeated and deferred %s work at the exact ceiling", (kind) => {
    const input = inputFor("office", [latinRun(0, 6)], 3)
    const certificate = input.provider.seamCertificates[0]!
    const count = kind === "source" || kind === "property" ? 254 : 508
    const extra = (i: number): RunOwnedProofWork => ({
      operationId: `deferred-${i}`, kind, phase: "after", timing: "deferred", ranges: [{ startOffset: 2, endOffset: 4 }],
    })
    certificate.work = [...certificate.work, ...Array.from({ length: count }, (_, i) => extra(i))]
    const result = evaluateRunOwnedSemanticOracleStage2(input)
    expect(result.decision.status).toBe("certified")
    if (result.decision.status !== "certified") throw new Error("expected boundary certificate")
    expect(result.decision.seamFacts.workAccounting[kind]).toBe(count * 2 + 4)
    expect(result.decision.seamFacts.workAccounting.deferred[kind]).toBe(count * 2)
    certificate.work = [...certificate.work, extra(count)]
    expect(evaluateRunOwnedSemanticOracleStage2(input).decision.status).toBe("not-admissible")
  })

  it("reports separate source/property/shaping/segmentation work without caller totals", () => {
    const result = evaluateRunOwnedSemanticOracleStage2(inputFor("office", [latinRun(0, 6)], 3))
    expect(result.decision).toMatchObject({ status: "certified", seamFacts: { workAccounting: {
      source: 4, property: 4, shaping: 4, segmentation: 4,
      deferred: { source: 0, property: 0, shaping: 0, segmentation: 0 },
    } } })
  })

  it.each([
    ["zero", [{ startOffset: 3, endOffset: 3 }]],
    ["fractional", [{ startOffset: 2.5, endOffset: 4 }]],
    ["gap", [{ startOffset: 2, endOffset: 3 }]],
    ["overlap", [{ startOffset: 2, endOffset: 4 }, { startOffset: 3, endOffset: 4 }]],
    ["outside", [{ startOffset: 1, endOffset: 4 }]],
  ])("rejects %s work declarations and evidence partitions", (_name, ranges) => {
    const input = inputFor("office", [latinRun(0, 6)], 3)
    input.provider.seamCertificates[0]!.work[0]!.ranges = ranges as { startOffset: number; endOffset: number }[]
    expect(evaluateRunOwnedSemanticOracleStage2(input).decision.status).toBe("not-admissible")
    for (const kind of ["glyphFacts", "clusterFacts", "breakFacts"] as const) {
      const evidenceInput = inputFor("office", [latinRun(0, 6)], 3)
      evidenceInput.provider.seamCertificates[0]!.edgeFacts[kind] = (ranges as { startOffset: number; endOffset: number }[])
        .map((range, i) => ({ factId: `fact-${i}`, ...range }))
      expect(evaluateRunOwnedSemanticOracleStage2(evidenceInput).decision.status).toBe("not-admissible")
    }
  })

  it("rejects missing work, duplicate operation IDs, and deferred work used as completed proof", () => {
    for (const alter of [
      (c: RunOwnedSeamCertificate) => { c.work = c.work.slice(1) },
      (c: RunOwnedSeamCertificate) => { c.work = [...c.work, c.work[0]!] },
      (c: RunOwnedSeamCertificate) => { c.work[0]!.timing = "deferred" },
    ]) {
      const input = inputFor("office", [latinRun(0, 6)], 3)
      alter(input.provider.seamCertificates[0]!)
      expect(evaluateRunOwnedSemanticOracleStage2(input).decision.status).toBe("not-admissible")
    }
  })

  it("rejects missing or mismatched before/after edges independently", () => {
    for (const phase of ["before", "after"] as const) {
      for (const side of ["left", "right"] as const) {
        const input = inputFor("office", [latinRun(0, 6)], 3)
        input.provider.seamCertificates[0]!.edgeSummaries[phase][side].glyphFactIds = ["unrelated-glyph"]
        expect(evaluateRunOwnedSemanticOracleStage2(input).decision.status).toBe("not-admissible")
      }
      const input = inputFor("office", [latinRun(0, 6)], 3)
      Reflect.deleteProperty(input.provider.seamCertificates[0]!.edgeSummaries, phase)
      expect(evaluateRunOwnedSemanticOracleStage2(input).decision.status).toBe("not-admissible")
    }
  })

  it("rejects missing, unsafe, changed or incomplete outside-range validity", () => {
    const mutations: ((c: RunOwnedSeamCertificate) => void)[] = [
      (c) => { Reflect.deleteProperty(c, "outsideRangeValidity") },
      (c) => { Object.assign(c.outsideRangeValidity, { status: "unsafe" }) },
      (c) => { c.outsideRangeValidity.ranges[0]!.afterDigest = `sha256:${"b".repeat(64)}` },
      (c) => { c.outsideRangeValidity.ranges = c.outsideRangeValidity.ranges.slice(1) },
      (c) => { c.outsideRangeValidity.ranges[0]!.endOffset = 1 },
      (c) => { c.outsideRangeValidity.binding.providerRevision = "stale" },
      (c) => { c.outsideRangeValidity.binding.runs[0]!.fontId = "different-font" },
    ]
    for (const mutate of mutations) {
      const input = inputFor("office", [latinRun(0, 6)], 3)
      mutate(input.provider.seamCertificates[0]!)
      expect(evaluateRunOwnedSemanticOracleStage2(input).decision.status).toBe("not-admissible")
    }
  })

  it("binds values as well as IDs and fails closed on malformed runtime proof objects", () => {
    for (const field of ["direction", "fontId", "features"] as const) {
      const input = inputFor("AB", [latinRun(0, 2)], 1)
      Object.assign(input.provider.runs[0]!, { [field]: field === "direction" ? "rtl" : field === "fontId" ? "another-font" : ["kern"] })
      expect(evaluateRunOwnedSemanticOracleStage2(input).decision.status).toBe("not-admissible")
    }
    for (const invalid of [null, {}, "certificate", { edgeFacts: null }]) {
      const input = inputFor("AB", [latinRun(0, 2)], 1)
      Object.assign(input.provider, { seamCertificates: [invalid] })
      expect(evaluateRunOwnedSemanticOracleStage2(input).decision).toEqual({ status: "not-admissible", reason: "uncertified-seam" })
    }
  })

  it("keeps source immutable and returns detached proof and run descriptors", () => {
    const input = inputFor("office", [latinRun(0, 6)], 3)
    const before = structuredClone(input)
    const result = evaluateRunOwnedSemanticOracleStage2(input)
    expect(input).toEqual(before)
    expect(result.decision.status).toBe("certified")
    input.provider.runs[0]!.fontId = "changed-after-evaluation"
    input.provider.seamCertificates[0]!.edgeFacts.glyphFacts[0]!.factId = "mutated"
    expect(result.runs[0]!.analysisKey.fontId).toBe("Sarabun-Regular")
    if (result.decision.status === "certified") {
      expect(result.decision.seamFacts.edgeFacts.glyphFacts[0]!.factId).toBe("glyph-boundary")
      expect(result.decision.seamFacts.edgeSummaries.binding.runs[0]!.fontId).toBe("Sarabun-Regular")
    }
  })

  it("accepts exact partitions on both seam sides and binds summaries to their actual evidence", () => {
    const input = inputFor("office", [latinRun(0, 6)], 3)
    const c = input.provider.seamCertificates[0]!
    for (const phase of ["before", "after"] as const) {
      const facts = phase === "before" ? c.beforeFacts : c.edgeFacts
      for (const [kind, ids] of [["glyphFacts", "glyphFactIds"], ["clusterFacts", "clusterFactIds"], ["breakFacts", "breakFactIds"]] as const) {
        facts[kind] = [
          { factId: `${phase}-${kind}-left`, startOffset: 2, endOffset: 3 },
          { factId: `${phase}-${kind}-right`, startOffset: 3, endOffset: 4 },
        ]
        c.edgeSummaries[phase].left[ids] = [`${phase}-${kind}-left`]
        c.edgeSummaries[phase].right[ids] = [`${phase}-${kind}-right`]
      }
    }
    for (const work of c.work) work.ranges = [{ startOffset: 2, endOffset: 3 }, { startOffset: 3, endOffset: 4 }]
    expect(evaluateRunOwnedSemanticOracleStage2(input).decision).toMatchObject({ status: "certified", seamFacts: {
      workAccounting: { source: 4, property: 4, shaping: 4, segmentation: 4 },
    } })
    c.edgeSummaries.after.right.clusterFactIds = ["before-clusterFacts-right"]
    expect(evaluateRunOwnedSemanticOracleStage2(input).decision.status).toBe("not-admissible")
  })

  it("rejects nonlocal inspected windows even when caller counters claim zero work", () => {
    const text = "A".repeat(1026)
    const input = inputFor(text, [latinRun(0, 1026)], 513)
    const c = input.provider.seamCertificates[0]!
    c.leftSourceRange = { startOffset: 0, endOffset: 513 }
    c.rightSourceRange = { startOffset: 513, endOffset: 1026 }
    for (const work of c.work) work.ranges = [{ startOffset: 0, endOffset: 1026 }]
    for (const facts of [c.beforeFacts, c.edgeFacts]) {
      for (const kind of ["glyphFacts", "clusterFacts", "breakFacts"] as const) {
        facts[kind][0]!.startOffset = 0
        facts[kind][0]!.endOffset = 1026
      }
    }
    c.outsideRangeValidity.ranges = []
    expect(evaluateRunOwnedSemanticOracleStage2(input).decision.status).toBe("not-admissible")
    Object.assign(c, { sourceFactUnits: 0, propertyFactUnits: 0, shapingAndSegmentationUnits: 0 })
    expect(evaluateRunOwnedSemanticOracleStage2(input).decision.status).toBe("not-admissible")
  })

  it("rejects unaccounted alternative certificates and unsafe before evidence", () => {
    const input = inputFor("office", [latinRun(0, 6)], 3)
    const c = input.provider.seamCertificates[0]!
    input.provider.seamCertificates = [c, structuredClone(c)]
    expect(evaluateRunOwnedSemanticOracleStage2(input).decision.status).toBe("not-admissible")
    input.provider.seamCertificates = [c]
    c.beforeFacts.unsafeBoundaryEvidence = { status: "unsafe", reason: "unsafe-before" }
    expect(evaluateRunOwnedSemanticOracleStage2(input).decision.status).toBe("not-admissible")
  })
})

describe("Stage 5 endpoint reference certificates", () => {
  function endpoint(text: string, caret: number): RunOwnedSemanticOracleStage2Input {
    const input = inputFor("AB", [latinRun(0, 2)], 1)
    input.committedText = text
    input.caretOffset = caret
    input.authoredSpans = text ? [{ spanId: "span-1", startOffset: 0, endOffset: text.length, text, styleKey: "body" }] : []
    input.provider.runs = text ? [latinRun(0, text.length)] : []
    input.provider.graphemeSafeOffsets = [0, text.length]
    const cert = input.provider.seamCertificates[0] as any
    const binding = { committedText: text, authoredSpans: input.authoredSpans, paragraph: input.paragraph,
      providerId: input.provider.providerId, providerRevision: input.provider.providerRevision,
      runs: input.provider.runs, graphemeSafeOffsets: input.provider.graphemeSafeOffsets, caretOffset: caret }
    Object.assign(cert, { variant: "endpoint", caretOffset: caret,
      leftSourceRange: { startOffset: 0, endOffset: caret }, rightSourceRange: { startOffset: caret, endOffset: text.length },
      leftProviderRunId: caret === 0 ? null : input.provider.runs[0]!.runId,
      rightProviderRunId: caret === text.length ? null : input.provider.runs[0]!.runId,
      leftAuthoredProperties: caret === 0 ? [] : [{ spanId: "span-1", language: null, styleKey: "body" }],
      rightAuthoredProperties: caret === text.length ? [] : [{ spanId: "span-1", language: null, styleKey: "body" }],
      sourceBinding: { committedText: text, authoredSpans: input.authoredSpans.map(({spanId,startOffset,endOffset}) => ({spanId,startOffset,endOffset})) },
      sides: { left: caret === 0 ? "empty" : "nonempty", right: caret === text.length ? "empty" : "nonempty" },
      emptyOrigins: Object.fromEntries((["left","right"] as const).map(side=>[side,(side==="left"?caret===0:caret===text.length)?{parentParagraphId:paragraph.paragraphId,parentRevision:0,caretOffset:caret,side,authoredEdge:text?{spanId:"span-1",language:null,styleKey:"body"}:null}:null])),
    })
    for (const facts of [cert.beforeFacts, cert.edgeFacts]) {
      for (const kind of ["glyphFacts", "clusterFacts", "breakFacts"]) facts[kind] = text ? [{ factId: kind, startOffset: 0, endOffset: text.length }] : []
      facts.unsafeBoundaryEvidence = { status: "safe", caretOffset: caret }
    }
    const edge = (empty: boolean) => ({ glyphFactIds: empty ? [] : ["glyphFacts"], clusterFactIds: empty ? [] : ["clusterFacts"], breakFactIds: empty ? [] : ["breakFacts"], safety: "safe" })
    cert.edgeSummaries = { binding: structuredClone(binding), before: {left: edge(caret === 0),right: edge(caret === text.length)}, after: {left: edge(caret === 0),right: edge(caret === text.length)} }
    cert.outsideRangeValidity = { binding: structuredClone(binding), status: "preserved", ranges: [] }
    cert.work.forEach((w: any) => { w.ranges = text ? [{ startOffset: 0, endOffset: text.length }] : [] })
    return input
  }
  it.each([["AB",0],["AB",2],["",0]] as const)("certifies real endpoint %s:%s without sentinel runs", (text, caret) => {
    const result = evaluateRunOwnedSemanticOracleStage2(endpoint(text,caret))
    expect(result.decision.status).toBe("certified")
    expect(result.runs.length).toBe(text ? 1 : 0)
  })
  it.each(["empty", "source", "context", "provider", "origin", "defaults"])("rejects forged %s binding", (field) => {
    const input = endpoint("AB",0)
    const cert = input.provider.seamCertificates[0] as any
    if(field === "empty") cert.sides.right = "empty"
    if(field === "source") cert.sourceBinding.committedText = "AC"
    if(field === "context") cert.paragraphContext.paragraphId = "wrong"
    if(field === "provider") cert.providerRevision = "wrong"
    if(field === "origin") cert.emptyOrigins.left.parentRevision = 99
    if(field === "defaults") cert.paragraphContext.defaults = {version:"v1",digest:"different",styleKey:"body"}
    expect(evaluateRunOwnedSemanticOracleStage2(input).decision).toEqual({status:"not-admissible",reason:"uncertified-seam"})
  })
  it("returns explicit empty/nonempty side tags and bound empty origin",()=>{
    const result=evaluateRunOwnedSemanticOracleStage2(endpoint("AB",0))
    expect(result.decision).toMatchObject({status:"certified",seamFacts:{sides:{left:"empty",right:"nonempty"},emptyOrigins:{left:{parentParagraphId:paragraph.paragraphId,caretOffset:0,side:"left"}}}})
  })
  it("never uses an endpoint tag to skip an interior side",()=>{
    const input=inputFor("AB",[latinRun(0,2)],1)
    Object.assign(input.provider.seamCertificates[0]!,{variant:"endpoint",sides:{left:"empty",right:"nonempty"}})
    expect(evaluateRunOwnedSemanticOracleStage2(input).decision).toEqual({status:"not-admissible",reason:"uncertified-seam"})
  })

})
