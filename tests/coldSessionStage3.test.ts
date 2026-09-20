import { beforeAll, describe, expect, it } from "vitest"
import { buildColdQaWasm } from "./coldQaWasmBuild.js"
import { evaluateRunOwnedSemanticOracleStage2 } from "../src/layout/runOwnedSemanticOracleStage2.js"
import { createColdSessionQaAdapter, type ColdQaWasm } from "../packages/text-engine-rust-wasm/src/coldSessionStage3.js"
import { canonical, fixture, hash, oracleInput } from "./coldStage3Fixtures.js"

let wasm: ColdQaWasm
beforeAll(async () => {
  wasm = await buildColdQaWasm() as ColdQaWasm
}, 360_000)

describe("private Stage 3 cold Rust-owned session", () => {
  it.each([
    ["AB", [[0, 2, "Latin"]]], ["office", [[0, 6, "Latin"]]],
    ["กA", [[0, 1, "Thai"], [1, 2, "Latin"]]], ["ก่A", [[0, 2, "Thai"], [2, 3, "Latin"]]],
  ] as const)("matches complete cold Stage 2 descriptors for %s", (text, rows) => {
    const input = fixture(text)
    const expected = evaluateRunOwnedSemanticOracleStage2(oracleInput(input, rows)).runs
    const baseline = wasm.stage3_live_count()
    const adapter = createColdSessionQaAdapter(wasm)
    const result = adapter.create(input.providerContext, input.paragraphContext, input.authoredSpans)
    expect(result.status).toBe("Created")
    if (result.status !== "Created") throw new Error(result.reason)
    expect(result.revision).toBe(0)
    expect(result.coldSummary.sourceDigest).toBe(hash(text))
    expect(result.coldSummary.descriptorDigest).toBe(hash(canonical(expected)))
    expect(result.coldSummary.policyDigest).toBe(input.providerContext.policyDigest)
    expect(result.coldSummary.work.shapingInputUtf16).toBe(text.length)
    expect(result.coldSummary.work.segmentationInputUtf16).toBe(2 * text.length)
    expect(result.coldSummary.work.deferredWork).toBe(0)
    expect(result.coldSummary.work.commandWork).toBe(0)
    expect(wasm.stage3_live_count()).toBe(baseline + 1)
    expect(adapter.dispose(result.receipt).status).toBe("Disposed")
    expect(adapter.dispose(result.receipt).status).toBe("UnknownReceipt")
    expect(wasm.stage3_live_count()).toBe(baseline)
  })

  it("cannot forge, transplant, or reuse receipts through the host adapter or raw WASM ABI", () => {
    const input = fixture("AB")
    const baseline = wasm.stage3_live_count()
    const a = createColdSessionQaAdapter(wasm), b = createColdSessionQaAdapter(wasm)
    const first = a.create(input.providerContext, input.paragraphContext, input.authoredSpans)
    if (first.status !== "Created") throw new Error(first.reason)
    expect(a.dispose({} as typeof first.receipt).status).toBe("UnknownReceipt")
    expect(b.dispose(first.receipt).status).toBe("UnknownReceipt")
    expect(JSON.parse(wasm.stage3_dispose(`sha256:${"0".repeat(64)}`)).status).toBe("UnknownReceipt")
    expect(a.dispose(first.receipt).status).toBe("Disposed")
    expect(wasm.stage3_live_count()).toBe(baseline)
  })

  it("rejects forged policy/resource digests, unknown fact fields and missing rules without publication", () => {
    const baseline = wasm.stage3_live_count()
    const examples = [fixture(), fixture(), fixture(), fixture()]
    examples[0].providerContext.policyDigest = `sha256:${"0".repeat(64)}`
    examples[1].providerContext.fonts[0].bytes[0] ^= 1
    Object.assign(examples[2].providerContext.policy, { glyphs: [] })
    examples[3].providerContext.policy.languageRules.pop()
    examples[3].providerContext.policyDigest = hash(canonical(examples[3].providerContext.policy))
    for (const input of examples) {
      const result = JSON.parse(wasm.stage3_create(JSON.stringify(input)))
      expect(result.status).toBe("NotCreated")
      expect(result.receipt).toBeUndefined()
      expect(wasm.stage3_live_count()).toBe(baseline)
    }
  })

  it.each(["אA", "Aא", "😀A", "👩‍💻"])("returns the exact unsupported capability result for %s", (text) => {
    const baseline = wasm.stage3_live_count()
    const result = JSON.parse(wasm.stage3_create(JSON.stringify(fixture(text))))
    expect(result).toMatchObject({ status: "NotCreated", reason: "unsupported-font-script" })
    expect(wasm.stage3_live_count()).toBe(baseline)
  })

  it("accounts for serialized ABI bytes and repeats setup for identical cold constructions", () => {
    const input = JSON.stringify(fixture("office"))
    const firstWire = wasm.stage3_create(input), secondWire = wasm.stage3_create(input)
    const first = JSON.parse(firstWire), second = JSON.parse(secondWire)
    for (const [wire, result] of [[firstWire, first], [secondWire, second]] as const) {
      expect(result.status).toBe("Created")
      expect(parseInt(result.coldSummary.abiInputBytes, 16)).toBe(Buffer.byteLength(input))
      expect(parseInt(result.coldSummary.abiOutputBytes, 16)).toBe(Buffer.byteLength(wire))
      expect(parseInt(result.coldSummary.responseEncodedBytes, 16)).toBe(2 * Buffer.byteLength(wire))
      expect(parseInt(result.coldSummary.allocatedBytes, 16)).toBeGreaterThan(0)
      expect(result.coldSummary.work.fontHashBytes).toBe(fixture().providerContext.fonts[0].bytes.length)
      expect(result.coldSummary.work.segmentationSetupCalls).toBe(2)
    }
    expect(first.receipt).not.toBe(second.receipt)
    // Entropy is encoded as decimal byte values, whose JSON lengths vary.
    // All non-random construction work must repeat without a warm cache.
    const { receiptHashBytes: firstBinding, canonicalEncodedBytes: firstEncoded, ...firstWork } = first.coldSummary.work
    const { receiptHashBytes: secondBinding, canonicalEncodedBytes: secondEncoded, ...secondWork } = second.coldSummary.work
    expect(firstWork).toEqual(secondWork)
    expect(firstEncoded - firstBinding).toBe(secondEncoded - secondBinding)
    expect(JSON.parse(wasm.stage3_dispose(first.receipt)).status).toBe("Disposed")
    expect(JSON.parse(wasm.stage3_dispose(second.receipt)).status).toBe("Disposed")
  })

  it("captures Rust transfer allocation and release outside the create function", () => {
    const input = fixture("กA")
    const wireInput = JSON.stringify(input)
    wasm.stage3_begin_transfer()
    const wire = wasm.stage3_create(wireInput)
    wasm.stage3_end_transfer()
    const result = JSON.parse(wire)
    const wholeAllocated = wasm.stage3_allocation_count(1)
    const wholeFreed = wasm.stage3_allocation_count(3)
    // Input copy starts before Runtime::create; response shrink and glue frees
    // finish after it. Both sides must be present in the outer window.
    expect(wholeAllocated).toBeGreaterThan(BigInt(`0x${result.coldSummary.allocatedBytes}`))
    expect(wholeFreed).toBeGreaterThan(BigInt(`0x${result.coldSummary.deallocatedBytes}`) + BigInt(Buffer.byteLength(wireInput)))
    expect(JSON.parse(wasm.stage3_dispose(result.receipt)).status).toBe("Disposed")
    const adapter = createColdSessionQaAdapter(wasm)
    const created = adapter.create(input.providerContext, input.paragraphContext, input.authoredSpans)
    if (created.status !== "Created") throw new Error(created.reason)
    expect(created.coldSummary.allocationScope).toBe("complete-rust-abi-lifecycle")
    expect(BigInt(`0x${created.coldSummary.allocatedBytes}`)).toBe(wasm.stage3_allocation_count(1))
    expect(BigInt(`0x${created.coldSummary.deallocatedBytes}`)).toBe(wasm.stage3_allocation_count(3))
    expect(created.coldSummary.abiEntrypointCalls).toBe(7)
    expect(adapter.dispose(created.receipt).status).toBe("Disposed")
  })

  it("preserves explicit Thai/Latin authored properties with policy-resolved keys", () => {
    const input = fixture("กA")
    input.authoredSpans = [
      { spanId: "thai-authored", startOffset: 0, endOffset: 1, text: "ก", language: "th", styleKey: "thai-body" },
      { spanId: "latin-authored", startOffset: 1, endOffset: 2, text: "A", language: "en", styleKey: "latin-emphasis" },
    ]
    const policy = input.providerContext.policy
    policy.languageRules.unshift({ authoredLanguage: "en", script: "Latin", language: "en" }, { authoredLanguage: "th", script: "Thai", language: "th" })
    for (const rules of [policy.fontRouteRules, policy.featureRules]) {
      rules[0].styleKey = "latin-emphasis"
      rules[1].styleKey = "thai-body"
    }
    input.providerContext.policyDigest = hash(canonical(policy))
    const expected = evaluateRunOwnedSemanticOracleStage2(oracleInput(input, [[0, 1, "Thai"], [1, 2, "Latin"]])).runs
    const adapter = createColdSessionQaAdapter(wasm)
    const created = adapter.create(input.providerContext, input.paragraphContext, input.authoredSpans)
    if (created.status !== "Created") throw new Error(created.reason)
    expect(created.coldSummary.descriptorDigest).toBe(hash(canonical(expected)))
    expect(created.coldSummary.work.descriptorSpanVisits).toBe(4)
    expect(adapter.dispose(created.receipt).status).toBe("Disposed")
  })

  it("binds changed valid policy meaning and rejects stale policy digests", () => {
    const input = fixture("AB"), adapter = createColdSessionQaAdapter(wasm)
    const first = adapter.create(input.providerContext, input.paragraphContext, input.authoredSpans)
    input.providerContext.policy.fontRouteRules[0].fontId = "Sarabun-Latin-Alternate-Logical-ID"
    expect(adapter.create(input.providerContext, input.paragraphContext, input.authoredSpans)).toMatchObject({ status: "NotCreated", reason: "policy-digest-mismatch" })
    input.providerContext.policyDigest = hash(canonical(input.providerContext.policy))
    const second = adapter.create(input.providerContext, input.paragraphContext, input.authoredSpans)
    if (first.status !== "Created" || second.status !== "Created") throw new Error("expected both bound policies")
    expect(second.coldSummary.policyDigest).not.toBe(first.coldSummary.policyDigest)
    expect(second.coldSummary.descriptorDigest).not.toBe(first.coldSummary.descriptorDigest)
    expect(second.coldSummary.sourceDigest).toBe(first.coldSummary.sourceDigest)
    expect(second.coldSummary.factsDigest).toBe(first.coldSummary.factsDigest)
    expect(second.receipt).not.toBe(first.receipt)
    expect(adapter.dispose(first.receipt).status).toBe("Disposed")
    expect(adapter.dispose(second.receipt).status).toBe("Disposed")
  })

  it.each([
    [" Aก", [[0, 2, "Latin"], [2, 3, "Thai"]]],
    ["A ก", [[0, 2, "Latin"], [2, 3, "Thai"]]],
    ["A\u0301ก", [[0, 2, "Latin"], [2, 3, "Thai"]]],
  ] as const)("uses the named Common/Inherited policy for %s", (text, rows) => {
    const input = fixture(text), adapter = createColdSessionQaAdapter(wasm)
    const expected = evaluateRunOwnedSemanticOracleStage2(oracleInput(input, rows)).runs
    const created = adapter.create(input.providerContext, input.paragraphContext, input.authoredSpans)
    if (created.status !== "Created") throw new Error(created.reason)
    expect(created.coldSummary.descriptorDigest).toBe(hash(canonical(expected)))
    expect(adapter.dispose(created.receipt).status).toBe("Disposed")
  })

  it("constructs and disposes an empty paragraph without fabricated provider facts", () => {
    const input = fixture(""), adapter = createColdSessionQaAdapter(wasm)
    const baseline = wasm.stage3_live_count()
    const created = adapter.create(input.providerContext, input.paragraphContext, input.authoredSpans)
    if (created.status !== "Created") throw new Error(created.reason)
    expect(created.coldSummary).toMatchObject({ sourceUtf16: 0, spans: 0, runs: 0, shards: 0, treeHeight: 0 })
    expect(created.coldSummary.work.shapingCalls).toBe(0)
    expect(created.coldSummary.sourceDigest).toBe(hash(""))
    expect(adapter.dispose(created.receipt)).toMatchObject({ status: "Disposed", disposalSummary: { liveSessions: baseline, releasedSourceBytes: 0, releasedRuns: 0 } })
  })
})
