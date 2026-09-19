/** Private QA adapter. Not exported by this package or Core entrypoints.
 * Retains only Rust-generated capabilities in a WeakMap. Inputs and parsed
 * responses are transient; no source, descriptor, shard or raw-fact cache.
 */
export interface ColdQaWasm {
  stage3_create(input: string): string
  stage3_dispose(receipt: string): string
  stage3_live_count(): number
  stage3_begin_transfer(): void
  stage3_end_transfer(): void
  stage3_allocation_count(field: number): bigint
}
declare const receiptBrand: unique symbol
export type ColdReceipt = Readonly<{ [receiptBrand]: true }>
export interface ColdSummary {
  sourceDigest: string; descriptorDigest: string; factsDigest: string; policyDigest: string
  sourceUtf16: number; spans: number; runs: number; shards: number; treeHeight: number; liveSessions: number
  work: Readonly<Record<string, number>>
  abiInputBytes: string; abiOutputBytes: string; responseEncodingPasses: string; responseEncodedBytes: string
  allocationCalls: string; allocatedBytes: string; deallocationCalls: string; deallocatedBytes: string
  allocationScope: "complete-rust-abi-lifecycle"
  hostJsonEncodePasses: 1; hostJsonDecodePasses: 1; abiEntrypointCalls: 7
}
export type ColdCreated = { status: "Created"; receipt: ColdReceipt; revision: 0; coldSummary: ColdSummary }
export type ColdNotCreated = { status: "NotCreated"; reason: string; coldSummary: ColdSummary }
export type ColdDisposal = { status: "Disposed"; disposalSummary: Readonly<Record<string, number>> } | { status: "UnknownReceipt" }

export function createColdSessionQaAdapter(wasm: ColdQaWasm) {
  const capabilities = new WeakMap<ColdReceipt, string>()
  function measuredTransfer(input: string, invoke: (input: string) => string) {
    wasm.stage3_begin_transfer()
    let wire: string
    try { wire = invoke(input) } finally { wasm.stage3_end_transfer() }
    const counts = [0, 1, 2, 3].map((field) => wasm.stage3_allocation_count(field).toString(16).padStart(16, "0"))
    return { wire, allocationCalls: counts[0], allocatedBytes: counts[1], deallocationCalls: counts[2], deallocatedBytes: counts[3] }
  }
  return Object.freeze({
    create(providerContext: unknown, paragraphContext: unknown, authoredSpans: unknown): ColdCreated | ColdNotCreated {
      const { wire, ...allocations } = measuredTransfer(JSON.stringify({ providerContext, paragraphContext, authoredSpans }), (input) => wasm.stage3_create(input))
      const result = JSON.parse(wire) as (Omit<ColdCreated, "receipt"> & { receipt: string }) | ColdNotCreated
      Object.assign(result.coldSummary, allocations, {
        allocationScope: "complete-rust-abi-lifecycle", hostJsonEncodePasses: 1, hostJsonDecodePasses: 1, abiEntrypointCalls: 7,
      })
      if (result.status !== "Created") return result
      const receipt = Object.freeze(Object.create(null)) as ColdReceipt
      capabilities.set(receipt, result.receipt)
      return { status: "Created", receipt, revision: result.revision, coldSummary: result.coldSummary }
    },
    dispose(receipt: ColdReceipt): ColdDisposal {
      const capability = capabilities.get(receipt)
      if (!capability) return { status: "UnknownReceipt" }
      const result = JSON.parse(wasm.stage3_dispose(capability)) as ColdDisposal
      capabilities.delete(receipt)
      return result
    },
  })
}
