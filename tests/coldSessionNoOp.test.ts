import { beforeAll, describe, expect, it } from "vitest"
import { buildColdQaWasm } from "./coldQaWasmBuild.js"
import { fixture } from "./coldStage3Fixtures.js"
import { createColdSessionQaAdapter } from "../packages/text-engine-rust-wasm/src/coldSessionStage3.js"

type Wasm = Awaited<ReturnType<typeof buildColdQaWasm>> & {
  stage3_create(input: string): string
  stage3_dispose(receipt: string): string
  stage4_apply(input: string): string
  stage4_arm_fault(input: string): string
  stage5_apply(input: string): string
  stage5_verify(receipt: string, input: string): string
  stage3_live_count(): number
  stage3_begin_transfer(): void
  stage3_end_transfer(): void
  stage3_allocation_count(field: number): bigint
}
let wasm: Wasm
const parse = (wire: string) => JSON.parse(wire)
const emptyFixture = () => ({ ...fixture(""), authoredSpans: [] })

beforeAll(async () => { wasm = await buildColdQaWasm() as Wasm }, 360_000)

describe("private committed EOF no-op", () => {
  it("keeps the identical TS handle, revision and source in empty and nonempty sessions", () => {
    const adapter = createColdSessionQaAdapter(wasm)
    for (const text of ["", "AB", "ภาษาไทย"]) {
      const input = text ? fixture(text) : emptyFixture()
      const created = adapter.create(input.providerContext, input.paragraphContext, input.authoredSpans)
      expect(created.status).toBe("Created")
      if (created.status !== "Created") continue
      const receipt = created.receipt
      const command = { expectedRevision: 0, startOffset: text.length, endOffset: text.length,
        replacementText: "", composition: "committed" as const, anchorSpanId: text ? "span-1" : "" }
      for (let attempt = 1; attempt <= 2; attempt++) {
        const result = adapter.apply(receipt, command)
        expect(result.status).toBe("NoOp")
        if (result.status !== "NoOp") continue
        expect(result.unchangedReceipt).toBe(receipt)
        expect(result.unchangedRevision).toBe(0)
        expect(result.outcomeKind).toBe("no-op")
        expect(result.affectedSummary.work.shapingCalls).toBe(0)
        expect(result.affectedSummary.work.segmentationCalls).toBe(0)
        expect(result.affectedSummary.work.hashCalls).toBe(0)
        expect(result.affectedSummary.work.abiInputBytes).toBeGreaterThan(0)
        expect(result.affectedSummary.allocationLifecycle.allocationScope).toBe("complete-rust-abi-lifecycle")
      }
      expect(adapter.dispose(receipt).status).toBe("Disposed")
    }
  }, 120_000)

  it("distinguishes NoOp from mutation, stale identity, QA cancellation and family totals", () => {
    const created = parse(wasm.stage3_create(JSON.stringify(fixture("AB"))))
    expect(created.status).toBe("Created")
    const receipt = created.receipt as string
    const noOp = (token: string, revision: number, n: number) => ({ receipt: token,
      expectedRevision: revision, startOffset: n, endOffset: n, replacementText: "", composition: "committed" })
    const first = parse(wasm.stage4_apply(JSON.stringify(noOp(receipt, 0, 2))))
    expect(first.status).toBe("NoOp")
    expect(first.unchangedReceipt).toBe(receipt)
    expect(first.unchangedRevision).toBe(0)
    expect(parse(wasm.stage5_verify(receipt, JSON.stringify(fixture("AB")))).status).toBe("Equal")
    expect(parse(wasm.stage4_arm_fault(JSON.stringify({ receipt, expectedRevision: 0, point: "no-op-completion" }))).status).toBe("Armed")
    const cancelled = parse(wasm.stage4_apply(JSON.stringify(noOp(receipt, 0, 2))))
    expect(cancelled.reason).toBe("cancelled")
    const retry = parse(wasm.stage4_apply(JSON.stringify(noOp(receipt, 0, 2))))
    expect(retry.status).toBe("NoOp")
    const edit = { receipt, expectedRevision: 0, startOffset: 2, endOffset: 2,
      replacementText: "C", composition: "committed", anchorSpanId: "span-1" }
    const accepted = parse(wasm.stage4_apply(JSON.stringify(edit)))
    expect(accepted.status).toBe("Accepted")
    expect(accepted.nextRevision).toBe(1)
    expect(accepted.nextReceipt).not.toBe(receipt)
    expect(parse(wasm.stage4_apply(JSON.stringify(noOp(receipt, 0, 2)))).reason).toBe("unknown-receipt")
    const after = parse(wasm.stage4_apply(JSON.stringify(noOp(accepted.nextReceipt, 1, 3))))
    expect(after.status).toBe("NoOp")
    expect(after.unchangedRevision).toBe(1)
    expect(parse(wasm.stage5_verify(accepted.nextReceipt, JSON.stringify(fixture("ABC")))).status).toBe("Equal")
    const disposal = parse(wasm.stage3_dispose(accepted.nextReceipt))
    expect(disposal.status).toBe("Disposed")
    expect(disposal.affectedSummary.familyEvents.noOpEvents).toBe(3)
    expect(disposal.affectedSummary.familyEvents.acceptedEvents).toBe(1)
    expect(disposal.affectedSummary.familyEvents.rejectedAttempts).toBe(1)
    expect(disposal.affectedSummary.familyEvents.disposals).toBe(1)
    for (const [field, hex] of Object.entries(disposal.affectedSummary.lifecycleCumulativeWork)) {
      const exact = [first, cancelled, retry, accepted, after, disposal]
        .reduce((sum, attempt) => sum + BigInt(attempt.affectedSummary.work[field]), 0n)
      expect(BigInt(`0x${hex}`), field).toBe(exact)
    }
  }, 120_000)

  it("keeps validation precedence and optional authored anchors in actual WASM", () => {
    const created = parse(wasm.stage3_create(JSON.stringify(fixture("AB"))))
    const receipt = created.receipt as string
    const base = { receipt, expectedRevision: 0, startOffset: 2, endOffset: 2,
      replacementText: "", composition: "committed", anchorSpanId: "span-1" }
    const attempt = (patch: Record<string, unknown>) => parse(wasm.stage4_apply(JSON.stringify({ ...base, ...patch })))
    expect(attempt({ expectedRevision: 1, composition: "active" }).reason).toBe("stale-revision")
    expect(attempt({ composition: "active", startOffset: 9 }).reason).toBe("composition-active")
    expect(attempt({ startOffset: 9 }).reason).toBe("invalid-range")
    expect(attempt({ startOffset: 1, endOffset: 1 }).reason).toBe("unsupported-command-shape")
    expect(attempt({ anchorSpanId: "forged" }).reason).toBe("ambiguous-anchor")
    expect(attempt({ unknownField: true }).reason).toBe("invalid-command")
    expect(attempt({ anchorSpanId: "" }).status).toBe("NoOp")
    expect(attempt({}).status).toBe("NoOp")
    expect(parse(wasm.stage3_dispose(receipt)).status).toBe("Disposed")
  }, 120_000)

  it("keeps Stage5 sibling inverse eligible across an actual WASM no-op", () => {
    const created = parse(wasm.stage3_create(JSON.stringify(fixture("AB"))))
    const split = parse(wasm.stage5_apply(JSON.stringify({ operation: "enter", receipt: created.receipt,
      expectedRevision: 0, caretOffset: 1, composition: "committed" })))
    expect(split.status).toBe("Accepted")
    const [left, right] = split.receipts as string[]
    const noOp = parse(wasm.stage4_apply(JSON.stringify({ receipt: left, expectedRevision: 0,
      startOffset: 1, endOffset: 1, replacementText: "", composition: "committed" })))
    expect(noOp.status).toBe("NoOp")
    expect(noOp.unchangedReceipt).toBe(left)
    const joined = parse(wasm.stage5_apply(JSON.stringify({ operation: "join", receipt: left,
      rightReceipt: right, expectedRevision: 0, rightRevision: 0, composition: "committed" })))
    expect(joined.status).toBe("Accepted")
    expect(parse(wasm.stage5_verify(joined.receipts[0], JSON.stringify(fixture("AB")))).status).toBe("Equal")
    expect(parse(wasm.stage3_dispose(joined.receipts[0])).status).toBe("Disposed")
  }, 120_000)
})
