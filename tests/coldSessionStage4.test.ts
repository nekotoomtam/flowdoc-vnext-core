import { beforeAll, describe, expect, it } from "vitest"
import { buildColdQaWasm } from "./coldQaWasmBuild.js"
import { fixture } from "./coldStage3Fixtures.js"
import { createColdSessionQaAdapter, type ColdQaWasm } from "../packages/text-engine-rust-wasm/src/coldSessionStage3.js"

type Stage4Wasm = {
  stage3_create(input: string): string
  stage4_apply(input: string): string
}

let wasm: Stage4Wasm
beforeAll(async () => {
  wasm = await buildColdQaWasm() as Stage4Wasm
}, 360_000)

describe("private Stage 4 ordinary atomic commands", () => {
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
    expect(result.affectedSummary.work).toMatchObject({ sourceFactsUtf16: 43, propertyFactsUtf16: 10, shapingSegmentationInputUtf16: 30, sourceCopyBytes: 20, sourceIndexUtf16: 5, wholeParagraphScans: 0, unboundedSuffixWork: 0, absoluteOffsetReindexing: 0 })
  })
  it("charges auxiliary source, index, canonical encoding and payload-copy work", () => {
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture("ABCDE"))))
    const result = JSON.parse(wasm.stage4_apply(JSON.stringify({ receipt: created.receipt, expectedRevision: 0, startOffset: 1, endOffset: 3, replacementText: "XY", composition: "committed", anchorSpanId: "span-1" })))
    expect(result.status).toBe("Accepted")
    expect(result.affectedSummary.work).toMatchObject({ sourceCopyBytes: 20, sourceIndexUtf16: 5, sourceOffsetLookups: 4, propertyScalarVisits: 10, payloadCopyCalls: 9, canonicalValuePasses: 3, canonicalJsonPasses: 3, sourceScanUtf16: 28, sourceFactsUtf16: 43, propertyFactsUtf16: 10 })
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
  it.each([[600, 600, "B", "uncertified-seam"], [599, 600, "", "budget-exhaustion"]])("rejects an uncertified long Latin tail at %i..%i", (startOffset, endOffset, replacementText, reason) => {
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
    const result = JSON.parse(wasm.stage4_apply(request))
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
    expect(result.affectedSummary.work.abiOutputBytes).toBe(Buffer.byteLength(JSON.stringify(result)))
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

  it("retains the original middle fixture as unchanged when provider concat proof is absent", () => {
    const text = "A".repeat(600)
    const created = JSON.parse(wasm.stage3_create(JSON.stringify(fixture(text))))
    const result = JSON.parse(wasm.stage4_apply(JSON.stringify({
      receipt: created.receipt, expectedRevision: 0, startOffset: 300, endOffset: 300,
      replacementText: "B", composition: "committed", anchorSpanId: "span-1",
    })))
    expect(result, JSON.stringify(result)).toMatchObject({ status: "NotAdmissible", reason: "uncertified-seam", unchangedReceipt: created.receipt, unchangedRevision: 0 })
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
