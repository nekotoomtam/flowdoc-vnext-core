import { beforeAll, describe, expect, it } from "vitest"
import { buildColdQaWasm } from "./coldQaWasmBuild.js"
import { fixture, canonical, hash } from "./coldStage3Fixtures.js"
import { createColdSessionQaAdapter, type ColdQaWasm } from "../packages/text-engine-rust-wasm/src/coldSessionStage3.js"

type Stage4Wasm = {
  stage3_create(input: string): string
  stage5_verify(receipt: string, input: string): string
  stage4_apply(input: string): string
  stage4_arm_fault(input: string): string
  stage3_dispose(receipt: string): string
  stage3_live_count(): number
  stage3_begin_transfer(): void
  stage3_end_transfer(): void
  stage3_allocation_count(field: number): bigint
}

let wasm: Stage4Wasm
function spanFixture(texts: string[]) {
  const input = fixture(texts.join(""))
  let offset = 0
  input.authoredSpans = texts.map((text, index) => {
    const startOffset = offset
    offset += text.length
    return { spanId: `span-${index}`, startOffset, endOffset: offset, text, language: "und", styleKey: "body" }
  })
  return input
}
beforeAll(async () => {
  wasm = await buildColdQaWasm() as Stage4Wasm
}, 360_000)

describe("private Stage 4 ordinary atomic commands", () => {
  it("certifies short Thai tail edits and a Latin terminator after a partitioned Thai prefix in actual WASM", () => {
    const cases: Array<[string, number, number, string, string]> = [
      ["Aกขค", 2, 2, "ง", "Aกงขค"],
      ["Aกขค", 2, 3, "", "Aกค"],
      ["กขค", 1, 2, "ง", "กงค"],
      [`${"ก".repeat(300)}AB`, 300, 302, "", "ก".repeat(300)],
    ]
    for (const [text, startOffset, endOffset, replacementText, expected] of cases) {
      const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture(text))))
      expect(created.status).toBe("Created")
      const result = JSON.parse(wasm.stage4_apply(JSON.stringify({ receipt: created.receipt,
        expectedRevision: 0, startOffset, endOffset, replacementText,
        composition: "committed", anchorSpanId: "span-1" })))
      expect(result.status).toBe("Accepted")
      expect(JSON.parse(wasm.stage5_verify(result.nextReceipt, JSON.stringify(fixture(expected)))).status).toBe("Equal")
      for (const [field, cap] of [["sourceFactsUtf16", 512], ["propertyFactsUtf16", 512],
        ["shapingSegmentationInputUtf16", 1024]] as const) {
        expect(result.affectedSummary.work[field]).toBeLessThanOrEqual(cap)
      }
      expect(JSON.parse(wasm.stage3_dispose(result.nextReceipt)).status).toBe("Disposed")
    }
  })
  it("retains exact fixed-width cumulative work across receipts and a rejected attempt", () => {
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("AB"))))
    let receipt = created.receipt
    const totals = new Map<string, bigint>()
    for (const [name, value] of Object.entries(created.acceptedCumulativeWork)) {
      expect(value).toBe("0".repeat(32))
      totals.set(name, 0n)
    }
    expect(totals.size).toBe(92)
    for (let revision = 0; revision < 2; revision++) {
      const wire = wasm.stage4_apply(JSON.stringify({ receipt, expectedRevision: revision,
        startOffset: 2 + revision, endOffset: 2 + revision, replacementText: "C",
        anchorSpanId: "span-1", composition: "committed" }))
      const result = JSON.parse(wire)
      expect(result.status).toBe("Accepted")
      expect(result.affectedSummary.attemptWork).toBeUndefined()
      expect(result.affectedSummary.work.abiOutputBytes).toBe(Buffer.byteLength(wire))
      expect(result.affectedSummary.work).toMatchObject({ responseEncodingPasses: 2,
        responseScalarSlotWrites: 184, responseScalarSlotBytes: 4784 })
      for (const [name, prior] of totals) {
        const actual = prior + BigInt(result.affectedSummary.work[name])
        totals.set(name, actual)
        expect(result.affectedSummary.acceptedCumulativeWork[name]).toMatch(/^[0-9a-f]{32}$/)
        expect(BigInt(`0x${result.affectedSummary.acceptedCumulativeWork[name]}`)).toBe(actual)
      }
      receipt = result.nextReceipt
    }
    const rejected = JSON.parse(wasm.stage4_apply(JSON.stringify({ receipt, expectedRevision: 2,
      startOffset: 4, endOffset: 4, replacementText: "X".repeat(10000),
      anchorSpanId: "span-1", composition: "committed" })))
    expect(rejected).toMatchObject({ status: "NotAdmissible", reason: "budget-exhaustion", unchangedRevision: 2 })
    expect(rejected.affectedSummary.work.sourceFactsUtf16).toBe(511)
    expect(rejected.affectedSummary.work).toMatchObject({ responseEncodingPasses: 2,
      responseScalarSlotWrites: 184, responseScalarSlotBytes: 4784 })
    for (const [name, total] of totals) {
      expect(BigInt(`0x${rejected.affectedSummary.acceptedCumulativeWork[name]}`)).toBe(total)
    }
    expect(JSON.parse(wasm.stage3_dispose(receipt)).status).toBe("Disposed")
  })
  it("charges only work slots when no authentic cumulative baseline exists", () => {
    for (const input of ["{}", "{"]) {
      const wire = wasm.stage4_apply(input)
      const rejected = JSON.parse(wire)
      expect(rejected).toMatchObject({ status: "NotAdmissible", affectedSummary: {
        acceptedCumulativeWork: null, work: { responseEncodingPasses: 2,
          responseScalarSlotWrites: 92, responseScalarSlotBytes: 1840,
          abiOutputBytes: Buffer.byteLength(wire) } } })
    }
  })
  it.each([
    ["tail-repair-provider-failure", "provider-failure", 2, 11, 0],
    ["cancel-after-tail-repair", "cancelled", 3, 15, 6],
    ["receipt-entropy-failure", "entropy-unavailable", 3, 15, 6],
  ] as const)("keeps the %s tail checkpoint atomic with exact phase accounting", (point, reason, shapes, sourceFacts, tailInput) => {
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("ข".repeat(300) + "ABก"))))
    const live = wasm.stage3_live_count()
    expect(JSON.parse(wasm.stage4_arm_fault(JSON.stringify({ receipt: created.receipt, expectedRevision: 0, point }))).status).toBe("Armed")
    const command = { receipt: created.receipt, expectedRevision: 0, startOffset: 302, endOffset: 303, replacementText: "", anchorSpanId: "span-1", composition: "committed" }
    for (const [change, rejection] of [[{ composition: "active" }, "composition-active"], [{ expectedRevision: 1 }, "stale-revision"], [{ receipt: "forged" }, "unknown-receipt"], [{ startOffset: 0, endOffset: 1 }, "budget-exhaustion"]] as const) {
      expect(JSON.parse(wasm.stage4_apply(JSON.stringify({ ...command, ...change })))).toMatchObject({ status: "NotAdmissible", reason: rejection, affectedSummary: { work: { faultsConsumed: 0, faultsCleared: 0 } } })
    }
    const request = JSON.stringify(command)
    wasm.stage3_begin_transfer()
    const wire = wasm.stage4_apply(request)
    wasm.stage3_end_transfer()
    const rejected = JSON.parse(wire)
    expect(rejected).toMatchObject({ status: "NotAdmissible", reason, unchangedReceipt: created.receipt, unchangedRevision: 0 })
    const w = rejected.affectedSummary.work
    expect(w).toMatchObject({ sourceFactsUtf16: sourceFacts, propertyFactsUtf16: 1, sourceCopiedUtf16: 3, sourceCopyBytes: 5, sourceCopyCalls: 5, sourceIndexUtf16: 0,
      oldNewShapingCalls: 2, oldNewProviderInputUtf16: 3, tailRepairShapingCalls: shapes - 2, tailRepairProviderInputUtf16: tailInput,
      shapingCalls: shapes, segmentationCalls: shapes * 2, fontParseCalls: shapes, shapingSegmentationInputUtf16: 3 + tailInput,
      faultsConsumed: 1, faultsCleared: 0, receiptRandomBytes: 0, publicationPreparationPasses: 0,
      canonicalValuePasses: point === "receipt-entropy-failure" ? 1 : 0, hashCalls: point === "receipt-entropy-failure" ? 1 : 0,
      abiInputBytes: Buffer.byteLength(request), abiOutputBytes: Buffer.byteLength(wire) })
    expect(wasm.stage3_allocation_count(1)).toBeGreaterThan(BigInt(w.allocatedBytes))
    expect(wasm.stage3_allocation_count(3)).toBeGreaterThan(BigInt(w.deallocatedBytes))
    expect(wasm.stage3_live_count()).toBe(live)
    const retry = JSON.parse(wasm.stage4_apply(request))
    expect(retry).toMatchObject({ status: "Accepted", nextRevision: 1, affectedSummary: { work: { sourceFactsUtf16: 15, tailRepairProviderInputUtf16: 6, hashCalls: 3 } } })
    expect(JSON.parse(wasm.stage4_apply(request)).reason).toBe("unknown-receipt")
    wasm.stage3_dispose(retry.nextReceipt)
  })
  it.each([
    ["AB", 2, 2, "C", 24, 2, 11, 15],
    ["ABCDE", 4, 5, "", 45, 9, 17, 27],
    ["ABCDE", 2, 2, "X", 45, 6, 23, 33],
    ["ABCDE", 1, 3, "XY", 47, 10, 20, 30],
    ["ABCDE", 1, 3, "", 37, 8, 14, 24],
  ] as const)("reports actual per-path inspection and separate copying for %s %i..%i", (text, startOffset, endOffset, replacementText, sourceFacts, propertyFacts, copied, provider) => {
    const c = JSON.parse(wasm.stage3_create(JSON.stringify(fixture(text))))
    const r = JSON.parse(wasm.stage4_apply(JSON.stringify({ receipt: c.receipt, expectedRevision: 0, startOffset, endOffset, replacementText, anchorSpanId: "span-1", composition: "committed" })))
    expect(r).toMatchObject({ status: "Accepted", affectedSummary: { work: { sourceFactsUtf16: sourceFacts, propertyFactsUtf16: propertyFacts, sourceCopiedUtf16: copied, sourceCopyBytes: copied, sourceCopyCalls: 4,
      oldNewProviderInputUtf16: provider, tailRepairProviderInputUtf16: 0, fontParseCalls: 2, featureParseCalls: 4, segmentationSetupCalls: 4, lineFilterVisits: 4, hashCalls: 3, providerRunIdEncodingPasses: 3 } } })
    wasm.stage3_dispose(r.nextReceipt)
  })
  it.each([["X".repeat(10000), 509, 511], ["X".repeat(509) + "😀" + "Y".repeat(10000), 509, 511], ["X".repeat(508) + "😀" + "Y".repeat(10000), 510, 512]] as const)("bounds a long replacement scan without splitting UTF-16 scalars at %i inspected units", (replacementText, scan, facts) => {
    const c = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("AB"))))
    const r = JSON.parse(wasm.stage4_apply(JSON.stringify({ receipt: c.receipt, expectedRevision: 0, startOffset: 2, endOffset: 2, replacementText, anchorSpanId: "span-1", composition: "committed" })))
    expect(r).toMatchObject({ status: "NotAdmissible", reason: "budget-exhaustion", unchangedReceipt: c.receipt, unchangedRevision: 0, affectedSummary: { work: {
      sourceFactsUtf16: facts, sourceScanUtf16: scan, replacementScalarsDecoded: 509, sourceOffsetLookups: 2, propertyFactsUtf16: 0, sourceCopiedUtf16: 2, sourceCopyBytes: 2, sourceCopyCalls: 1,
      shapingCalls: 0, shapingSegmentationInputUtf16: 0, canonicalValuePasses: 0, canonicalJsonPasses: 0, hashCalls: 0, hashInputBytes: 0 } } })
    wasm.stage3_dispose(c.receipt)
  })
  it("deletes a Latin terminator with a real Thai consonant witness and unchanged dictionary input", () => {
    const text = "ภาษาไทย".repeat(30) + "A"
    const c = JSON.parse(wasm.stage3_create(JSON.stringify(fixture(text))))
    const r = JSON.parse(wasm.stage4_apply(JSON.stringify({ receipt: c.receipt, expectedRevision: 0, startOffset: text.length - 1, endOffset: text.length, replacementText: "", anchorSpanId: "span-1", composition: "committed" })))
    expect(r).toMatchObject({ status: "Accepted", nextRevision: 1, affectedSummary: { work: { tailRepairShapingCalls: 0 } } })
    expect(JSON.parse(wasm.stage5_verify(r.nextReceipt, JSON.stringify(fixture(text.slice(0, -1))))).status).toBe("Equal")
    wasm.stage3_dispose(r.nextReceipt)
  })
  it("retires only the old capability's unreached tail control on successful publication", () => {
    const c = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("ABCDE"))))
    expect(JSON.parse(wasm.stage4_arm_fault(JSON.stringify({ receipt: c.receipt, expectedRevision: 0, point: "cancel-after-tail-repair" }))).status).toBe("Armed")
    const command = { receipt: c.receipt, expectedRevision: 0, startOffset: 1, endOffset: 3, replacementText: "XY", anchorSpanId: "span-1", composition: "committed" }
    const r = JSON.parse(wasm.stage4_apply(JSON.stringify(command)))
    expect(r).toMatchObject({ status: "Accepted", affectedSummary: { work: { faultsConsumed: 0, faultsCleared: 1 } } })
    expect(JSON.parse(wasm.stage4_arm_fault(JSON.stringify({ receipt: r.nextReceipt, expectedRevision: 1, point: "cancel-before-provider" }))).status).toBe("Armed")
    expect(JSON.parse(wasm.stage3_dispose(c.receipt)).status).toBe("UnknownReceipt")
    expect(JSON.parse(wasm.stage3_dispose("forged")).status).toBe("UnknownReceipt")
    expect(JSON.parse(wasm.stage4_apply(JSON.stringify({ ...command, receipt: r.nextReceipt, expectedRevision: 1 })))).toMatchObject({ status: "NotAdmissible", reason: "cancelled", affectedSummary: { work: { faultsConsumed: 1 } } })
    wasm.stage3_dispose(r.nextReceipt)
  })
  it.each([
    ["cancel-before-provider", "cancelled", 0, 1],
    ["provider-failure", "provider-failure", 1, 2],
    ["cancel-after-provider", "cancelled", 2, 3],
    ["publication-refusal", "publication-refused", 2, 5],
  ] as const)("keeps %s atomic through the raw one-shot QA channel and charges its full ABI lifecycle", (point, reason, shapes, checkpoints) => {
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("ABCDE"))))
    const live = wasm.stage3_live_count()
    expect(typeof wasm.stage4_arm_fault).toBe("function")
    const control = JSON.stringify({ receipt: created.receipt, expectedRevision: 0, point })
    wasm.stage3_begin_transfer()
    const armWire = wasm.stage4_arm_fault(control)
    wasm.stage3_end_transfer()
    const armed = JSON.parse(armWire)
    expect(armed).toMatchObject({ status: "Armed", work: { controlParses: 1, sessionLookups: 1, revisionChecks: 1, faultsArmed: 1, bindingBytesRetained: created.receipt.length } })
    expect(BigInt(`0x${armed.work.abiInputBytes}`)).toBe(BigInt(Buffer.byteLength(control)))
    expect(BigInt(`0x${armed.work.abiOutputBytes}`)).toBe(BigInt(Buffer.byteLength(armWire)))
    expect(BigInt(`0x${armed.work.responseEncodingPasses}`)).toBe(2n)
    expect(BigInt(`0x${armed.work.responseEncodedBytes}`)).toBe(BigInt(2 * Buffer.byteLength(armWire)))
    expect(wasm.stage3_allocation_count(0)).toBeGreaterThan(BigInt(`0x${armed.work.allocationCalls}`))
    expect(wasm.stage3_allocation_count(1)).toBeGreaterThan(BigInt(`0x${armed.work.allocatedBytes}`))
    expect(wasm.stage3_allocation_count(3)).toBeGreaterThan(BigInt(`0x${armed.work.deallocatedBytes}`))
    const command = JSON.stringify({ receipt: created.receipt, expectedRevision: 0, startOffset: 1, endOffset: 3, replacementText: "XY", anchorSpanId: "span-1", composition: "committed" })
    wasm.stage3_begin_transfer()
    const rejectedWire = wasm.stage4_apply(command)
    wasm.stage3_end_transfer()
    const cancelled = JSON.parse(rejectedWire)
    expect(cancelled).toMatchObject({ status: "NotAdmissible", reason, unchangedReceipt: created.receipt, unchangedRevision: 0 })
    const w = cancelled.affectedSummary.work
    expect(w).toMatchObject({ shapingCalls: shapes, segmentationCalls: 2 * shapes, faultCheckpoints: checkpoints, faultsConsumed: 1,
      faultSlotProbes: checkpoints, faultBindingChecks: checkpoints, faultRevisionChecks: checkpoints, faultPointChecks: checkpoints,
      faultReceiptComparisonBytes: checkpoints * created.receipt.length, abiInputBytes: Buffer.byteLength(command), abiOutputBytes: Buffer.byteLength(rejectedWire),
      wholeParagraphScans: 0, unboundedSuffixWork: 0, absoluteOffsetReindexing: 0,
      publicationPreparationPasses: point === "publication-refusal" ? 1 : 0 })
    expect(w.responseEncodedBytes).toBeGreaterThan(w.abiOutputBytes)
    expect(w.sourceFactsUtf16).toBeLessThanOrEqual(512)
    expect(w.propertyFactsUtf16).toBeLessThanOrEqual(512)
    expect(w.shapingSegmentationInputUtf16).toBeLessThanOrEqual(1024)
    if (point === "publication-refusal") expect(w.publicationPreparationBytes).toBeGreaterThan(0)
    expect(wasm.stage3_allocation_count(1)).toBeGreaterThan(BigInt(w.allocatedBytes))
    expect(wasm.stage3_allocation_count(3)).toBeGreaterThan(BigInt(w.deallocatedBytes))
    expect(wasm.stage3_live_count()).toBe(live)
    const retry = JSON.parse(wasm.stage4_apply(command))
    expect(retry).toMatchObject({ status: "Accepted", nextRevision: 1 })
    expect(JSON.parse(wasm.stage4_apply(command))).toMatchObject({ status: "NotAdmissible", reason: "unknown-receipt" })
    expect(wasm.stage3_live_count()).toBe(live)
    expect(JSON.parse(wasm.stage3_dispose(retry.nextReceipt)).status).toBe("Disposed")
  })
  it("keeps invalid controls and ordinary rejection outside the fault channel, isolates receipts, and clears only a disposed binding", () => {
    const a = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("ก".repeat(300) + "ABCDE" + "ข".repeat(300)))))
    const b = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("ABCDE"))))
    const control = { receipt: a.receipt, expectedRevision: 0, point: "publication-refusal" }
    for (const invalid of [{ ...control, point: "unknown" }, { ...control, authoredSpans: [] }, { ...control, expectedRevision: -1 }]) {
      expect(JSON.parse(wasm.stage4_arm_fault(JSON.stringify(invalid)))).toMatchObject({ status: "NotArmed", reason: "invalid-fault-control" })
    }
    expect(JSON.parse(wasm.stage4_arm_fault(" ".repeat(1025)))).toMatchObject({ status: "NotArmed", reason: "control-input-limit", work: { controlParses: 0 } })
    expect(JSON.parse(wasm.stage4_arm_fault(JSON.stringify(control))).status).toBe("Armed")
    expect(JSON.parse(wasm.stage4_arm_fault(JSON.stringify({ ...control, receipt: "forged" }))).reason).toBe("unknown-receipt")
    expect(JSON.parse(wasm.stage4_arm_fault(JSON.stringify({ ...control, expectedRevision: 1 }))).reason).toBe("stale-revision")
    expect(JSON.parse(wasm.stage4_arm_fault(JSON.stringify({ ...control, receipt: b.receipt }))).reason).toBe("fault-already-armed")
    const command = { receipt: a.receipt, expectedRevision: 0, startOffset: 301, endOffset: 303, replacementText: "XY", anchorSpanId: "span-1", composition: "committed" }
    for (const [change, reason] of [
      [{ composition: "active" }, "composition-active"], [{ receipt: "forged" }, "unknown-receipt"],
      [{ expectedRevision: 1 }, "stale-revision"], [{ startOffset: 0, endOffset: 1 }, "budget-exhaustion"],
      [{ point: "cancel-before-provider" }, "invalid-command"],
    ] as const) {
      const rejected = JSON.parse(wasm.stage4_apply(JSON.stringify({ ...command, ...change })))
      expect(rejected).toMatchObject({ status: "NotAdmissible", reason, affectedSummary: { work: { faultsConsumed: 0, faultCheckpoints: 0 } } })
    }
    const other = JSON.parse(wasm.stage4_apply(JSON.stringify({ ...command, receipt: b.receipt, startOffset: 1, endOffset: 3 })))
    expect(other).toMatchObject({ status: "Accepted", affectedSummary: { work: { faultsConsumed: 0 } } })
    expect(JSON.parse(wasm.stage3_dispose(other.nextReceipt))).toMatchObject({ status: "Disposed", disposalSummary: { faultWork: { faultsCleared: 0 } } })
    expect(JSON.parse(wasm.stage4_apply(JSON.stringify(command)))).toMatchObject({ status: "NotAdmissible", reason: "publication-refused" })
    expect(JSON.parse(wasm.stage4_arm_fault(JSON.stringify(control))).status).toBe("Armed")
    expect(JSON.parse(wasm.stage3_dispose(a.receipt))).toMatchObject({ status: "Disposed", disposalSummary: { faultWork: { faultsCleared: 1 } } })
    const c = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("ABCDE"))))
    expect(JSON.parse(wasm.stage4_arm_fault(JSON.stringify({ ...control, receipt: c.receipt }))).status).toBe("Armed")
    wasm.stage3_dispose(c.receipt)
  })
  it.each(["left", "right"])("rejects uncertified Thai dictionary context across a %s style-run neighbor", (side) => {
    const input = spanFixture(["ภ", "า", "ษาไทย"])
    input.authoredSpans[side === "right" ? 2 : 0]!.styleKey = "zbody"
    const policy = input.providerContext.policy
    policy.fontRouteRules.push(...policy.fontRouteRules.map((row) => ({ ...row, styleKey: "zbody" })))
    policy.featureRules.push(...policy.featureRules.map((row) => ({ ...row, styleKey: "zbody" })))
    input.providerContext.policyDigest = hash(canonical(policy))
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(input)))
    expect(created.status).toBe("Created")
    const offset = side === "right" ? 1 : 2
    const result = JSON.parse(wasm.stage4_apply(JSON.stringify({receipt: created.receipt, expectedRevision: 0,
      startOffset: offset, endOffset: offset, replacementText: "ข", composition: "committed", anchorSpanId: side === "right" ? "span-0" : "span-1"})))
    expect(result).toMatchObject({status: "NotAdmissible", reason: "uncertified-seam", unchangedReceipt: created.receipt, unchangedRevision: 0})
    expect(result.affectedSummary.work.shapingCalls).toBe(0)
    expect(result.affectedSummary.work.contextRunVisits).toBe(1)
  })
  it.each([
    [["AB", "CD"], 2, 2, "X", "span-0"],
    [["AB", "CD"], 2, 2, "X", "span-1"],
    [["กข", "คง"], 2, 2, "จ", "span-0"],
    [["กข", "คง"], 2, 2, "จ", "span-1"],
    [["AB", "CD"], 1, 3, "", "span-0"],
    [["กข", "คง"], 1, 3, "", "span-1"],
  ] as const)("publishes the exact anchored authored-edge profile: %j", (texts, startOffset, endOffset, replacementText, anchorSpanId) => {
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(spanFixture([...texts]))))
    expect(created.status).toBe("Created")
    const request = JSON.stringify({ receipt: created.receipt, expectedRevision: 0, startOffset, endOffset, replacementText, anchorSpanId, composition: "committed" })
    const wire = wasm.stage4_apply(request)
    const result = JSON.parse(wire)
    expect(result, wire).toMatchObject({ status: "Accepted", nextRevision: 1 })
    const w = result.affectedSummary.work
    expect(w).toMatchObject({ ownershipSpanVisits: 2, boundedOwnership: true, wholeParagraphScans: 0, unboundedSuffixWork: 0, absoluteOffsetReindexing: 0 })
    expect(w.sourceFactsUtf16).toBeLessThanOrEqual(512)
    expect(w.propertyFactsUtf16).toBeLessThanOrEqual(512)
    expect(w.shapingSegmentationInputUtf16).toBeLessThanOrEqual(1024)
    expect(w.abiInputBytes).toBe(Buffer.byteLength(request))
    expect(w.abiOutputBytes).toBe(Buffer.byteLength(wire))
  })

  it.each([
    [["AB", "CD"], 2, 2, "X", undefined, "missing-anchor"],
    [["AB", "CD", "EF"], 2, 2, "X", "span-2", "ambiguous-anchor"],
    [["AB", "CD"], 2, 2, "X", "wrong", "ambiguous-anchor"],
    [["ก่ข", "คง"], 1, 4, "", "span-0", "uncertified-boundary"],
    [["กข", "คง"], 2, 2, "่", "span-1", "uncertified-boundary"],
    [["AB", "กข"], 2, 2, "X", "span-0", "uncertified-boundary"],
    [["AB", "CD"], 2, 2, "ก", "span-0", "uncertified-seam"],
    [["AB", "CD"], 1, 3, "X", "span-0", "unsupported-command-shape"],
    [["AB", "CD"], 0, 3, "", "span-0", "unsupported-command-shape"],
    [["AB", "CD"], 1, 4, "", "span-0", "unsupported-command-shape"],
    [["AB", "CD", "EF"], 1, 5, "", "span-0", "unsupported-command-shape"],
    [["A".repeat(40), "B".repeat(40)], 40, 40, "C", "span-0", "budget-exhaustion"],
  ] as const)("rejects unsupported authored-edge ownership unchanged: %j", (texts, startOffset, endOffset, replacementText, anchorSpanId, reason) => {
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(spanFixture([...texts]))))
    expect(created.status).toBe("Created")
    const result = JSON.parse(wasm.stage4_apply(JSON.stringify({ receipt: created.receipt, expectedRevision: 0, startOffset, endOffset, replacementText, anchorSpanId, composition: "committed" })))
    expect(result).toMatchObject({ status: "NotAdmissible", reason, unchangedReceipt: created.receipt, unchangedRevision: 0 })
  })

  it.each([300, 3000])("keeps authored-edge work bounded with %i unrelated suffix spans", (count) => {
    for (const replacementText of ["X", ""]) {
      const created = JSON.parse(wasm.stage3_create(JSON.stringify(spanFixture(["ก".repeat(300), "AB", "CD", ...Array<string>(count).fill("ข")]))))
      const startOffset = replacementText ? 302 : 301, endOffset = replacementText ? 302 : 303
      const result = JSON.parse(wasm.stage4_apply(JSON.stringify({ receipt: created.receipt, expectedRevision: 0, startOffset, endOffset, replacementText, anchorSpanId: "span-1", composition: "committed" })))
      expect(result.status).toBe("Accepted")
      const w = result.affectedSummary.work
      expect(w.ownershipSpanVisits).toBe(2)
      expect(w.payloadElementsCopied).toBeLessThan(120)
      expect(w.treePathCopies).toBeLessThan(80)
      expect(w.treeNodeVisits).toBeLessThan(160)
      expect(w.sourceFactsUtf16).toBeLessThanOrEqual(512)
      expect(w.propertyFactsUtf16).toBeLessThanOrEqual(512)
      expect(w.shapingSegmentationInputUtf16).toBeLessThanOrEqual(1024)
    }
  }, 30_000) // Two cold constructions are outside the measured command envelope.

  it.each(["forged", "stale"])("keeps authored-edge authentication failure atomic: %s", (kind) => {
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(spanFixture(["AB", "CD"]))))
    const command = { receipt: created.receipt, expectedRevision: 0, startOffset: 2, endOffset: 2, replacementText: "X", anchorSpanId: "span-0", composition: "committed" }
    const rejected = JSON.parse(wasm.stage4_apply(JSON.stringify({ ...command, receipt: kind === "forged" ? "forged" : created.receipt, expectedRevision: kind === "stale" ? 1 : 0 })))
    expect(rejected).toMatchObject({ status: "NotAdmissible", reason: kind === "forged" ? "unknown-receipt" : "stale-revision" })
    expect(JSON.parse(wasm.stage4_apply(JSON.stringify(command)))).toMatchObject({ status: "Accepted", nextRevision: 1 })
    expect(JSON.parse(wasm.stage4_apply(JSON.stringify(command)))).toMatchObject({ status: "NotAdmissible", reason: "unknown-receipt" })
  })

  it("does not create an ambiguous duplicate stable-ID boundary", () => {
    const input = spanFixture(["AB", "CD"])
    input.authoredSpans[1]!.spanId = input.authoredSpans[0]!.spanId
    expect(JSON.parse(wasm.stage3_create(JSON.stringify(input)))).toMatchObject({ status: "NotCreated", reason: "invalid-authored-spans" })
  })

  it("charges the complete authored-edge ABI allocation lifecycle", () => {
    const adapter = createColdSessionQaAdapter(wasm as Stage4Wasm & ColdQaWasm)
    const input = spanFixture(["AB", "CD"])
    const created = adapter.create(input.providerContext, input.paragraphContext, input.authoredSpans)
    if (created.status !== "Created") throw new Error("cold construction failed")
    const result = adapter.apply(created.receipt, { expectedRevision: 0, startOffset: 2, endOffset: 2, replacementText: "X", anchorSpanId: "span-0", composition: "committed" })
    if (result.status !== "Accepted") throw new Error("edge command failed")
    expect(result.affectedSummary.allocationLifecycle).toMatchObject({ allocationScope: "complete-rust-abi-lifecycle", hostJsonEncodePasses: 1, hostJsonDecodePasses: 1, abiEntrypointCalls: 7 })
    expect(Number.parseInt(result.affectedSummary.allocationLifecycle.allocatedBytes, 16)).toBeGreaterThan(result.affectedSummary.work.allocatedBytes)
    expect(Number.parseInt(result.affectedSummary.allocationLifecycle.deallocatedBytes, 16)).toBeGreaterThan(result.affectedSummary.work.deallocatedBytes)
    expect(adapter.dispose(created.receipt)).toEqual({ status: "UnknownReceipt" })
    expect(adapter.dispose(result.nextReceipt).status).toBe("Disposed")
  })
  it("rejects a partial analysis-run range before provider work without an adjacent line certificate", () => {
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("ก".repeat(150)))))
    const result = JSON.parse(wasm.stage4_apply(JSON.stringify({ receipt: created.receipt, expectedRevision: 0, startOffset: 148, endOffset: 149, replacementText: "ข", composition: "committed", anchorSpanId: "span-1" })))
    expect(result).toMatchObject({ status: "NotAdmissible", reason: "uncertified-seam", unchangedReceipt: created.receipt, unchangedRevision: 0 })
    expect(result.affectedSummary.work.shapingCalls).toBe(0)
  })
  it.each([300, 3000])("keeps replacement work independent of a %i-unit suffix", (suffixLength) => {
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("ก".repeat(300) + "ABCDE" + "ข".repeat(suffixLength)))))
    const result = JSON.parse(wasm.stage4_apply(JSON.stringify({ receipt: created.receipt, expectedRevision: 0, startOffset: 301, endOffset: 303, replacementText: "XY", composition: "committed", anchorSpanId: "span-1" })))
    expect(result.status).toBe("Accepted")
    expect(result.affectedSummary.work).toMatchObject({ sourceFactsUtf16: 47, propertyFactsUtf16: 10, shapingSegmentationInputUtf16: 30, sourceCopyBytes: 20, sourceCopiedUtf16: 20, sourceIndexUtf16: 5, wholeParagraphScans: 0, unboundedSuffixWork: 0, absoluteOffsetReindexing: 0 })
  })
  it("charges auxiliary source, index, canonical encoding and payload-copy work", () => {
    // Stage5 lineage retains one copied event identity in addition to nine tree/payload copies.
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("ABCDE"))))
    const result = JSON.parse(wasm.stage4_apply(JSON.stringify({ receipt: created.receipt, expectedRevision: 0, startOffset: 1, endOffset: 3, replacementText: "XY", composition: "committed", anchorSpanId: "span-1" })))
    expect(result.status).toBe("Accepted")
    expect(result.affectedSummary.work).toMatchObject({ sourceCopyBytes: 20, sourceCopiedUtf16: 20, sourceIndexUtf16: 5, sourceOffsetLookups: 4, propertyScalarVisits: 10, payloadCopyCalls: 10, canonicalValuePasses: 3, canonicalJsonPasses: 3, sourceScanUtf16: 28, sourceFactsUtf16: 47, propertyFactsUtf16: 10 })
    expect(result.affectedSummary.work.sourceScanUtf16).toBeGreaterThan(0)
    expect(result.affectedSummary.work.payloadElementsCopied).toBeGreaterThan(9)
  })

  it.each([
    ["ก่ข", 1, 2, "ค", "uncertified-boundary"],
    ["AกขB", 1, 2, "่", "uncertified-boundary"],
    ["ABC", 1, 2, "ก", "uncertified-seam"],
    ["AกB", 1, 2, "", "uncertified-seam"],
    ["ABC", 0, 3, "", "unsupported-command-shape"],
    ["A".repeat(600), 300, 301, "B", "budget-exhaustion"],
    ["A".repeat(80), 39, 40, "B", "budget-exhaustion"],
  ])("does not publish an uncertified replacement/deletion in %s", (text, startOffset, endOffset, replacementText, reason) => {
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture(text))))
    const result = JSON.parse(wasm.stage4_apply(JSON.stringify({ receipt: created.receipt, expectedRevision: 0, startOffset, endOffset, replacementText, composition: "committed", anchorSpanId: "span-1" })))
    expect(result).toMatchObject({ status: "NotAdmissible", reason, unchangedReceipt: created.receipt, unchangedRevision: 0 })
  })

  it.each([[1, "span-1", false, "stale-revision"], [0, "wrong", false, "ambiguous-anchor"], [0, "span-1", true, "unknown-receipt"]])("preserves the authentic session after replacement authentication failure %s", (expectedRevision, anchorSpanId, forged, reason) => {
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("ABC"))))
    const base = { receipt: created.receipt, expectedRevision: 0, startOffset: 1, endOffset: 2, replacementText: "X", composition: "committed", anchorSpanId: "span-1" }
    const rejected = JSON.parse(wasm.stage4_apply(JSON.stringify({ ...base, receipt: forged ? "forged" : created.receipt, expectedRevision, anchorSpanId })))
    expect(rejected).toMatchObject({ status: "NotAdmissible", reason })
    expect(JSON.parse(wasm.stage4_apply(JSON.stringify(base)))).toMatchObject({ status: "Accepted", nextRevision: 1 })
  })

  it("rejects a lone UTF-16 surrogate in replacement and leaves the authentic receipt usable", () => {
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("ABC"))))
    const base = { receipt: created.receipt, expectedRevision: 0, startOffset: 1, endOffset: 2, replacementText: "\uD800", composition: "committed", anchorSpanId: "span-1" }
    expect(JSON.parse(wasm.stage4_apply(JSON.stringify(base)))).toMatchObject({ status: "NotAdmissible", reason: "invalid-command" })
    expect(JSON.parse(wasm.stage4_apply(JSON.stringify({ ...base, replacementText: "X" })))).toMatchObject({ status: "Accepted", nextRevision: 1 })
  })
  it.each([
    ["ABCDE", 1, 3, "XY"], ["กขคง", 1, 2, "จ"], ["AกขคB", 2, 3, "ง"],
    ["ABCDE", 1, 2, ""], ["ABCDE", 2, 3, ""], ["กขคง", 1, 2, ""], ["AกขคB", 2, 3, ""],
  ])("publishes a bounded replacement/deletion in %s", (text, startOffset, endOffset, replacementText) => {
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture(text))))
    const request = JSON.stringify({ receipt: created.receipt, expectedRevision: 0, startOffset, endOffset, replacementText, composition: "committed", anchorSpanId: "span-1" })
    const wire = wasm.stage4_apply(request)
    const result = JSON.parse(wire)
    expect(result, wire).toMatchObject({ status: "Accepted", nextRevision: 1 })
    const work = result.affectedSummary.work
    expect(work.sourceFactsUtf16).toBeLessThanOrEqual(512)
    expect(work.propertyFactsUtf16).toBeLessThanOrEqual(512)
    expect(work.shapingSegmentationInputUtf16).toBeLessThanOrEqual(1024)
    expect(work.abiInputBytes).toBe(Buffer.byteLength(request))
    expect(work.abiOutputBytes).toBe(Buffer.byteLength(wire))
  })
  it.each([[600, 600, "B", "budget-exhaustion"], [599, 600, "", "budget-exhaustion"]])("rejects an oversized long Latin tail at %i..%i", (startOffset, endOffset, replacementText, reason) => {
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("A".repeat(600)))))
    const result = JSON.parse(wasm.stage4_apply(JSON.stringify({ receipt: created.receipt, expectedRevision: 0, startOffset, endOffset, replacementText, composition: "committed", anchorSpanId: "span-1" })))
    expect(result).toMatchObject({ status: "NotAdmissible", reason, unchangedReceipt: created.receipt, unchangedRevision: 0 })
  })

  it("measures the complete command ABI lifecycle and keeps receipts opaque", () => {
    const adapter = createColdSessionQaAdapter(wasm as Stage4Wasm & ColdQaWasm)
    const input = fixture("AB")
    const created = adapter.create(input.providerContext, input.paragraphContext, input.authoredSpans)
    expect(created.status).toBe("Created")
    if (created.status !== "Created") throw new Error("cold create failed")
    const result = adapter.apply(created.receipt, { expectedRevision: 0, startOffset: 2, endOffset: 2, replacementText: "C", composition: "committed", anchorSpanId: "span-1" })
    expect(result.status).toBe("Accepted")
    if (result.status !== "Accepted") throw new Error("command failed")
    expect(JSON.stringify(result.nextReceipt)).toBe("{}")
    expect(result.affectedSummary.allocationLifecycle).toMatchObject({ allocationScope: "complete-rust-abi-lifecycle", hostJsonEncodePasses: 1, hostJsonDecodePasses: 1, abiEntrypointCalls: 7 })
    expect(Number.parseInt(result.affectedSummary.allocationLifecycle.allocatedBytes, 16)).toBeGreaterThan(result.affectedSummary.work.allocatedBytes)
    expect(Number.parseInt(result.affectedSummary.allocationLifecycle.deallocatedBytes, 16)).toBeGreaterThan(result.affectedSummary.work.deallocatedBytes)
    expect(adapter.dispose(created.receipt)).toEqual({ status: "UnknownReceipt" })
    expect(adapter.dispose(result.nextReceipt).status).toBe("Disposed")
  })
  it("publishes one next revision for an exactly anchored Latin append", () => {
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("AB"))))
    expect(created.status).toBe("Created")
    const request = JSON.stringify({
      receipt: created.receipt,
      expectedRevision: 0,
      startOffset: 2,
      endOffset: 2,
      replacementText: "C",
      composition: "committed",
      anchorSpanId: "span-1",
    })
    const result = JSON.parse(wasm.stage4_apply(request))
    expect(result).toMatchObject({ status: "Accepted", nextRevision: 1 })
  })

  it("repairs a long anchored tail append inside the fixed command envelope", () => {
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("ก".repeat(598) + "AB"))))
    expect(created.status).toBe("Created")
    const request = JSON.stringify({
      receipt: created.receipt,
      expectedRevision: 0,
      startOffset: 600,
      endOffset: 600,
      replacementText: "B",
      composition: "committed",
      anchorSpanId: "span-1",
    })
    const wire = wasm.stage4_apply(request)
    const result = JSON.parse(wire)
    expect(result).toMatchObject({ status: "Accepted", nextRevision: 1 })
    expect(result.affectedSummary.work).toMatchObject({
      sourceFactsUtf16: expect.any(Number),
      propertyFactsUtf16: expect.any(Number),
      shapingSegmentationInputUtf16: expect.any(Number),
      wholeParagraphScans: 0,
      fullSerializations: 0,
      unboundedSuffixWork: 0,
      allocationCalls: expect.any(Number),
      treePathCopies: expect.any(Number),
      hashInputUtf16: expect.any(Number),
      receiptBindingBytes: expect.any(Number),
      abiInputBytes: expect.any(Number),
      abiOutputBytes: expect.any(Number),
      seamCertified: true,
      lineCertified: true,
      unsafeEdgesCertified: true,
    })
    expect(result.affectedSummary.work.sourceFactsUtf16).toBeLessThanOrEqual(512)
    expect(result.affectedSummary.work.propertyFactsUtf16).toBeLessThanOrEqual(512)
    expect(result.affectedSummary.work.shapingSegmentationInputUtf16).toBeLessThanOrEqual(1024)
    expect(result.affectedSummary.work.abiInputBytes).toBe(Buffer.byteLength(request))
    expect(result.affectedSummary.work.abiOutputBytes).toBe(Buffer.byteLength(wire))
    expect(result.affectedSummary.sourceBindingDigest).toMatch(/^sha256:/)
  })

  it("preserves the authentic receipt on rejection and invalidates it only after publication", () => {
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("AB"))))
    const rejected = JSON.parse(wasm.stage4_apply(JSON.stringify({
      receipt: created.receipt, expectedRevision: 0, startOffset: 1, endOffset: 1,
      replacementText: "C", composition: "active", anchorSpanId: "span-1",
    })))
    expect(rejected).toMatchObject({ status: "NotAdmissible", unchangedReceipt: created.receipt, unchangedRevision: 0 })
    const accepted = JSON.parse(wasm.stage4_apply(JSON.stringify({
      receipt: created.receipt, expectedRevision: 0, startOffset: 2, endOffset: 2,
      replacementText: "C", composition: "committed", anchorSpanId: "span-1",
    })))
    expect(accepted.status).toBe("Accepted")
    expect(JSON.parse(wasm.stage4_apply(JSON.stringify({
      receipt: created.receipt, expectedRevision: 0, startOffset: 2, endOffset: 2,
      replacementText: "D", composition: "committed", anchorSpanId: "span-1",
    })))).toMatchObject({ status: "NotAdmissible", reason: "unknown-receipt" })
    expect(JSON.parse(wasm.stage4_apply(JSON.stringify({
      receipt: `sha256:${"0".repeat(64)}`, expectedRevision: 0, startOffset: 2, endOffset: 2,
      replacementText: "D", composition: "committed", anchorSpanId: "span-1",
    })))).toMatchObject({ status: "NotAdmissible", reason: "unknown-receipt" })
  })

  it.each([
    ["AB", 1, 2],
    ["กข", 1, 2],
    ["Aก", 1, 2],
  ])("publishes a bounded safe tail deletion for %s", (text, startOffset, endOffset) => {
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture(text))))
    const result = JSON.parse(wasm.stage4_apply(JSON.stringify({
      receipt: created.receipt, expectedRevision: 0, startOffset, endOffset,
      replacementText: "", composition: "committed", anchorSpanId: "span-1",
    })))
    expect(result).toMatchObject({ status: "Accepted", nextRevision: 1 })
    expect(result.affectedSummary.work).toMatchObject({
      wholeParagraphScans: 0, fullSerializations: 0, unboundedSuffixWork: 0,
    })
  })

  it("rejects a Thai combining-mark split without changing the receipt", () => {
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("ก่"))))
    const rejected = JSON.parse(wasm.stage4_apply(JSON.stringify({
      receipt: created.receipt, expectedRevision: 0, startOffset: 1, endOffset: 2,
      replacementText: "", composition: "committed", anchorSpanId: "span-1",
    })))
    expect(rejected).toMatchObject({ status: "NotAdmissible", reason: "uncertified-boundary", unchangedReceipt: created.receipt, unchangedRevision: 0 })
  })

  it.each(["A😀", "A👩‍💻"])("rejects unsupported surrogate or ZWJ source before a command can publish: %s", (text) => {
    expect(JSON.parse(wasm.stage3_create(JSON.stringify(fixture(text))))).toMatchObject({ status: "NotCreated", reason: "unsupported-font-script" })
  })

  it("retains the oversized original middle fixture unchanged before provider concat work", () => {
    const text = "A".repeat(600)
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture(text))))
    const result = JSON.parse(wasm.stage4_apply(JSON.stringify({
      receipt: created.receipt, expectedRevision: 0, startOffset: 300, endOffset: 300,
      replacementText: "B", composition: "committed", anchorSpanId: "span-1",
    })))
    expect(result, JSON.stringify(result)).toMatchObject({ status: "NotAdmissible", reason: "budget-exhaustion", unchangedReceipt: created.receipt, unchangedRevision: 0 })
    expect(result.affectedSummary.work).toMatchObject({
      wholeParagraphScans: 0, fullSerializations: 0, unboundedSuffixWork: 0,
      absoluteOffsetReindexing: 0,
    })
  })

  it("publishes a provider-isolated middle insertion and shares the long suffix", () => {
    const text = "ก".repeat(300) + "AB" + "ข".repeat(300)
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture(text))))
    const request = JSON.stringify({receipt:created.receipt,expectedRevision:0,startOffset:301,endOffset:301,replacementText:"C",composition:"committed",anchorSpanId:"span-1"})
    const wire = wasm.stage4_apply(request)
    const result = JSON.parse(wire)
    expect(result, wire).toMatchObject({status:"Accepted",nextRevision:1})
    const work = result.affectedSummary.work
    expect(work.sourceFactsUtf16).toBeLessThanOrEqual(512)
    expect(work.propertyFactsUtf16).toBeLessThanOrEqual(512)
    expect(work.shapingSegmentationInputUtf16).toBe(15)
    expect(work.shapingCalls).toBe(2)
    expect(work.segmentationCalls).toBe(4)
    expect(work.treePathCopies).toBeGreaterThan(0)
    expect(work.sharedSubtrees).toBeGreaterThan(0)
    expect(work.lazyShiftedSubtrees).toBeGreaterThan(0)
    expect(work.abiInputBytes).toBe(Buffer.byteLength(request))
    expect(work.abiOutputBytes).toBe(Buffer.byteLength(wire))
    expect(work.responseEncodedBytes).toBeGreaterThan(work.abiOutputBytes)
    expect(work.allocationCalls).toBeGreaterThan(0)
    expect(work).toMatchObject({wholeParagraphScans:0,fullSerializations:0,unboundedSuffixWork:0,absoluteOffsetReindexing:0})
  })
})

it.each([["กA", "ก"], ["Aกข", "BC"], ["AB", "ขค"], ["กข", "A"]])("certifies actual WASM opposite-script tail %s + %s", (text, inserted) => {
  const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture(text))))
  const result = JSON.parse(wasm.stage4_apply(JSON.stringify({ receipt: created.receipt, expectedRevision: 0,
    startOffset: text.length, endOffset: text.length, replacementText: inserted, composition: "committed", anchorSpanId: "span-1" })))
  expect(result.status, JSON.stringify(result)).toBe("Accepted")
  expect(result.nextRevision).toBe(1)
  expect(result.nextReceipt).not.toBe(created.receipt)
  expect(JSON.parse(wasm.stage5_verify(result.nextReceipt, JSON.stringify(fixture(text + inserted)))).status).toBe("Equal")
  const work = result.affectedSummary.work
  expect(work.policyRuleVisits).toBeGreaterThan(0)
  expect(work.sourceFactsUtf16).toBeLessThanOrEqual(512)
  expect(work.propertyFactsUtf16).toBeLessThanOrEqual(512)
  expect(work.shapingSegmentationInputUtf16).toBeLessThanOrEqual(1024)
  for (const [field, value] of Object.entries(result.affectedSummary.acceptedCumulativeWork)) expect(BigInt(`0x${value}`)).toBe(BigInt(work[field]))
  expect(JSON.parse(wasm.stage3_dispose(result.nextReceipt)).status).toBe("Disposed")
})

it.each([[" A", "ก"], ["Aก่", "B"], ["กA", "ก่"], ["กA", "กA"], ["A".repeat(33), "ก"]])("keeps uncertified actual WASM context %s + %s unchanged", (text, inserted) => {
  const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture(text))))
  const result = JSON.parse(wasm.stage4_apply(JSON.stringify({ receipt: created.receipt, expectedRevision: 0,
    startOffset: text.length, endOffset: text.length, replacementText: inserted, composition: "committed", anchorSpanId: "span-1" })))
  expect(result).toMatchObject({ status: "NotAdmissible", unchangedReceipt: created.receipt, unchangedRevision: 0 })
  expect(JSON.parse(wasm.stage5_verify(created.receipt, JSON.stringify(fixture(text)))).status).toBe("Equal")
  expect(JSON.parse(wasm.stage3_dispose(created.receipt)).status).toBe("Disposed")
})

it("distinguishes a committed empty request from active composition", () => {
  const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("กA"))))
  const command = { receipt: created.receipt, expectedRevision: 0, startOffset: 2, endOffset: 2, replacementText: "", anchorSpanId: "span-1" }
  expect(JSON.parse(wasm.stage4_apply(JSON.stringify({ ...command, composition: "committed" })))).toMatchObject({ reason: "unsupported-command-shape", unchangedRevision: 0 })
  expect(JSON.parse(wasm.stage4_apply(JSON.stringify({ ...command, composition: "active" })))).toMatchObject({ reason: "composition-active", unchangedRevision: 0 })
  expect(JSON.parse(wasm.stage5_verify(created.receipt, JSON.stringify(fixture("กA")))).status).toBe("Equal")
  wasm.stage3_dispose(created.receipt)
})
