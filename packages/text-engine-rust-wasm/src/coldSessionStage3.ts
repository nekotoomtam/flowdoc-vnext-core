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
  stage4_apply?(input: string): string
  stage5_apply?(input: string): string
  stage6_maintain?(input: string): string
  stage7_apply?(input: string, control: string): string
  stage7_structural?(input: string, control: string): string
  stage7_maintain?(input: string, control: string): string
  stage5_verify?(receipt:string,expectedInput:string):string
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
interface HostTiming {readonly serializationMs:number;readonly rustAbiMs:number}
export type ColdCreated = { status: "Created"; receipt: ColdReceipt; revision: 0; coldSummary: ColdSummary;hostTiming?:HostTiming }
export type ColdNotCreated = { status: "NotCreated"; reason: string; coldSummary: ColdSummary;hostTiming?:HostTiming }
export type ColdDisposal = ({status:"NotDisposed";reason:string} | { status: "Disposed"; disposalSummary: Readonly<Record<string, number>> } | { status: "UnknownReceipt" }) & {hostTiming?:HostTiming}
export interface ColdCommand {
  expectedRevision: number; startOffset: number; endOffset: number
  replacementText: string; composition: "committed" | "active"; anchorSpanId: string
}
interface CommandSummary {
  work: Readonly<Record<string, number>>
  allocationLifecycle: Omit<Pick<ColdSummary, "allocationCalls" | "allocatedBytes" | "deallocationCalls" | "deallocatedBytes" | "allocationScope" | "hostJsonEncodePasses" | "hostJsonDecodePasses" | "abiEntrypointCalls">,"hostJsonEncodePasses"> & {hostJsonEncodePasses:1|2}
}
export interface HostControlRequest { readonly operationId: string; readonly cancelled: boolean }
export type ColdCommandResult =
  | { status: "Accepted"; nextReceipt: ColdReceipt; nextRevision: number; affectedSummary: CommandSummary }
  | { status: "NoOp"; outcomeKind: "no-op"; unchangedReceipt: ColdReceipt; unchangedRevision: number; affectedSummary: CommandSummary }
  | { status: "NotAdmissible"; reason: string; unchangedReceipt: ColdReceipt; unchangedRevision: number; affectedSummary: CommandSummary }
  | { status: "Cancelled"; reason: "cancelled"; unchangedReceipt: ColdReceipt; unchangedRevision: number; affectedSummary: CommandSummary }
  | { status: "UnknownReceipt" | "Unavailable" }

export type ColdStructuralResult =
 | {status:"Accepted";receipts:readonly ColdReceipt[];revision:0;affectedSummary:CommandSummary}
 | {status:"NotAdmissible";reason:string;affectedSummary:CommandSummary}
 | {status:"Cancelled";reason:"cancelled";unchangedReceipts:readonly ColdReceipt[];unchangedRevisions:readonly number[];affectedSummary:CommandSummary}
 | {status:"UnknownReceipt" | "Unavailable"}

export type ColdMaintenanceResult =
 | {status:"Evicted" | "Recovered" | "Unchanged"; unchangedReceipt:ColdReceipt; unchangedRevision:number;
    targetRunIndex:number; releasedResources:number; releasedBytes:number; affectedSummary:CommandSummary}
 | {status:"NotAdmissible"; reason:string; unchangedReceipt:ColdReceipt; unchangedRevision:number; affectedSummary:CommandSummary}
 | {status:"Cancelled"; reason:"cancelled"; unchangedReceipt:ColdReceipt; unchangedRevision:number; affectedSummary:CommandSummary}
 | {status:"UnknownReceipt" | "Unavailable"}

export function createColdSessionQaAdapter(wasm: ColdQaWasm) {
  const capabilities = new WeakMap<ColdReceipt, string>()
  const providers = new WeakMap<ColdReceipt, { id:string; revision:string }>()
  function controlWire(request:HostControlRequest, receipt:string, revision:number,
    right?:{receipt:string;revision:number}, recovery?:{operation:string;target:string;runIndex:number;provider:{id:string;revision:string}}) {
    return JSON.stringify({operationId:request.operationId,receipt,expectedRevision:revision,
      rightReceipt:right?.receipt??null,rightRevision:right?.revision??null,
      runIndex:recovery?.runIndex??null,maintenanceOperation:recovery?.operation??null,
      maintenanceTarget:recovery?.target??null,providerId:recovery?.provider.id??null,
      providerRevision:recovery?.provider.revision??null,cancelled:request.cancelled})
  }
  function measuredTransfer(input: string, invoke: (input: string) => string) {
    wasm.stage3_begin_transfer()
    let wire: string
    const started=performance.now()
    try { wire = invoke(input) } finally { wasm.stage3_end_transfer() }
    const rustAbiMs=performance.now()-started
    const counts = [0, 1, 2, 3].map((field) => wasm.stage3_allocation_count(field).toString(16).padStart(16, "0"))
    return { wire, rustAbiMs, allocationCalls: counts[0], allocatedBytes: counts[1], deallocationCalls: counts[2], deallocatedBytes: counts[3] }
  }
  function structural(handles: readonly ColdReceipt[], command: Record<string, unknown>, control?:HostControlRequest): ColdStructuralResult {
    const tokens = handles.map(handle => capabilities.get(handle))
    if (tokens.some(token => !token)) return {status:"UnknownReceipt"}
    if (control ? !wasm.stage7_structural : !wasm.stage5_apply) return {status:"Unavailable"}
    const serialStart=performance.now()
    const raw=JSON.stringify({...command,receipt:tokens[0],...(tokens.length===2?{rightReceipt:tokens[1]}:{})})
    const ctl=control?controlWire(control,tokens[0]!,Number(command.expectedRevision),tokens.length===2?{receipt:tokens[1]!,revision:Number(command.rightRevision)}:undefined):""
    let serializationMs=performance.now()-serialStart
    const {wire,rustAbiMs,...allocations} = measuredTransfer(raw, input=>control?wasm.stage7_structural!(input,ctl):wasm.stage5_apply!(input))
    const parseStart=performance.now()
    const result=JSON.parse(wire)
    serializationMs+=performance.now()-parseStart
    if(control)result.hostTiming={serializationMs,rustAbiMs}
    result.affectedSummary.allocationLifecycle={...allocations,allocationScope:"complete-rust-abi-lifecycle",hostJsonEncodePasses:control?2:1,hostJsonDecodePasses:1,abiEntrypointCalls:7}
    if(result.status!=="Accepted")return result.status==="Cancelled"?{...result,unchangedReceipts:handles}:result
    const provider=providers.get(handles[0])
    const receipts=result.receipts.map((token:string)=>{const handle=Object.freeze(Object.create(null)) as ColdReceipt;capabilities.set(handle,token);if(provider)providers.set(handle,provider);return handle})
    handles.forEach(handle=>{capabilities.delete(handle);providers.delete(handle)})
    return {...result,receipts}
  }
  return Object.freeze({
    verify(receipt:ColdReceipt,expectedInput:unknown):{status:string;qaOnly?:boolean} {
      const capability=capabilities.get(receipt)
      if(!capability)return {status:"UnknownReceipt"}
      if(!wasm.stage5_verify)return {status:"Unavailable"}
      return JSON.parse(wasm.stage5_verify(capability,JSON.stringify(expectedInput)))
    },
    create(providerContext: unknown, paragraphContext: unknown, authoredSpans: unknown): ColdCreated | ColdNotCreated {
      const encodeStart=performance.now()
      const raw=JSON.stringify({ providerContext, paragraphContext, authoredSpans })
      let serializationMs=performance.now()-encodeStart
      const { wire,rustAbiMs, ...allocations } = measuredTransfer(raw, (input) => wasm.stage3_create(input))
      const parseStart=performance.now()
      const result = JSON.parse(wire) as (Omit<ColdCreated, "receipt"> & { receipt: string }) | ColdNotCreated
      serializationMs+=performance.now()-parseStart
      result.hostTiming={serializationMs,rustAbiMs}
      Object.assign(result.coldSummary, allocations, {
        allocationScope: "complete-rust-abi-lifecycle", hostJsonEncodePasses: 1, hostJsonDecodePasses: 1, abiEntrypointCalls: 7,
      })
      if (result.status !== "Created") return result
      const receipt = Object.freeze(Object.create(null)) as ColdReceipt
      capabilities.set(receipt, result.receipt)
      const context=providerContext as {providerId?:string;providerRevision?:string}
      providers.set(receipt,{id:context.providerId??"",revision:context.providerRevision??""})
      return { status: "Created", receipt, revision: result.revision, coldSummary: result.coldSummary,hostTiming:result.hostTiming }
    },
    dispose(receipt: ColdReceipt): ColdDisposal {
      const capability = capabilities.get(receipt)
      if (!capability) return { status: "UnknownReceipt" }
      const {wire,rustAbiMs,...allocations}=measuredTransfer(capability,input=>wasm.stage3_dispose(input))
      const parseStart=performance.now()
      const result = JSON.parse(wire) as ColdDisposal
      result.hostTiming={serializationMs:performance.now()-parseStart,rustAbiMs}
      if(result.status==="Disposed" || result.status==="UnknownReceipt"){capabilities.delete(receipt);providers.delete(receipt)}
      Object.assign(result,{allocationLifecycle:{...allocations,allocationScope:"complete-rust-abi-lifecycle",hostJsonEncodePasses:0,hostJsonDecodePasses:1,abiEntrypointCalls:7}})
      return result
    },
    enter(receipt:ColdReceipt, expectedRevision:number, caretOffset:number, composition:"committed"|"active"="committed",control?:HostControlRequest):ColdStructuralResult {
      return structural([receipt],{operation:"enter",expectedRevision,caretOffset,composition},control)
    },
    join(left:ColdReceipt,right:ColdReceipt,leftRevision=0,rightRevision=0,composition:"committed"|"active"="committed",control?:HostControlRequest):ColdStructuralResult {
      return structural([left,right],{operation:"join",expectedRevision:leftRevision,rightRevision,composition},control)
    },
    maintain(receipt:ColdReceipt, expectedRevision:number, operation:"evict"|"recover", runIndex:number, target:"plan"|"shard"="plan",control?:HostControlRequest):ColdMaintenanceResult {
      const capability=capabilities.get(receipt)
      if(!capability)return {status:"UnknownReceipt"}
      if(control?!wasm.stage7_maintain:!wasm.stage6_maintain)return {status:"Unavailable"}
      const serialStart=performance.now()
      const raw=JSON.stringify({receipt:capability,expectedRevision,operation,runIndex,target})
      const provider=providers.get(receipt)
      const ctl=control?controlWire(control,capability,expectedRevision,undefined,{operation,target,runIndex,provider:provider??{id:"",revision:""}}):""
      let serializationMs=performance.now()-serialStart
      const {wire,rustAbiMs,...allocations}=measuredTransfer(raw,input=>control?wasm.stage7_maintain!(input,ctl):wasm.stage6_maintain!(input))
      const parseStart=performance.now()
      const result=JSON.parse(wire)
      serializationMs+=performance.now()-parseStart
      if(control)result.hostTiming={serializationMs,rustAbiMs}
      result.affectedSummary.allocationLifecycle={...allocations,allocationScope:"complete-rust-abi-lifecycle",hostJsonEncodePasses:control?2:1,hostJsonDecodePasses:1,abiEntrypointCalls:7}
      return {...result,unchangedReceipt:receipt}
    },
    apply(receipt: ColdReceipt, command: ColdCommand, control?:HostControlRequest): ColdCommandResult {
      const capability = capabilities.get(receipt)
      if (!capability) return { status: "UnknownReceipt" }
      if (control ? !wasm.stage7_apply : !wasm.stage4_apply) return { status: "Unavailable" }
      const serialStart=performance.now()
      const raw=JSON.stringify({ ...command, receipt: capability })
      const ctl=control?controlWire(control,capability,command.expectedRevision):""
      let serializationMs=performance.now()-serialStart
      const { wire,rustAbiMs, ...allocations } = measuredTransfer(raw, (input) => control?wasm.stage7_apply!(input,ctl):wasm.stage4_apply!(input))
      const parseStart=performance.now()
      const result = JSON.parse(wire)
      serializationMs+=performance.now()-parseStart
      if(control)result.hostTiming={serializationMs,rustAbiMs}
      result.affectedSummary.allocationLifecycle = {
        ...allocations, allocationScope: "complete-rust-abi-lifecycle",
        hostJsonEncodePasses: control?2:1, hostJsonDecodePasses: 1, abiEntrypointCalls: 7,
      }
      if (result.status !== "Accepted") {
        return { ...result, unchangedReceipt: receipt }
      }
      const nextReceipt = Object.freeze(Object.create(null)) as ColdReceipt
      capabilities.set(nextReceipt, result.nextReceipt)
      const provider=providers.get(receipt);if(provider)providers.set(nextReceipt,provider)
      capabilities.delete(receipt)
      providers.delete(receipt)
      return { ...result, nextReceipt }
    },
  })
}
