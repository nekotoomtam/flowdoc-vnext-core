import { beforeAll, describe, expect, it } from "vitest"
import { buildColdQaWasm } from "./coldQaWasmBuild.js"
import { fixture } from "./coldStage3Fixtures.js"
import { createColdSessionQaAdapter } from "../packages/text-engine-rust-wasm/src/coldSessionStage3.js"
// @ts-expect-error Private Stage6 corpus has no public declarations.
import { base, corpus } from "../scripts/stage6/corpus.mjs"

type Wasm = Awaited<ReturnType<typeof buildColdQaWasm>> & {
  stage6_maintain(input:string):string
  stage3_create(input:string):string
  stage3_dispose(receipt:string):string
  stage4_apply(input:string):string
  stage5_apply(input:string):string
  stage5_verify(receipt:string,input:string):string
  stage3_live_count():number
  stage3_begin_transfer():void
  stage3_end_transfer():void
  stage3_allocation_count(field:number):bigint
}
let wasm:Wasm
const parse=(wire:string)=>JSON.parse(wire)
beforeAll(async()=>{wasm=await buildColdQaWasm() as Wasm},360_000)

describe("private retained-source plan lifecycle",()=>{
  it("drops a used plan, requires recovery, and then gives an independent cold-equal edit",()=>{
    const adapter=createColdSessionQaAdapter(wasm)
    const input=fixture("AB")
    const created=adapter.create(input.providerContext,input.paragraphContext,input.authoredSpans)
    expect(created.status).toBe("Created")
    if(created.status!=="Created")return
    const receipt=created.receipt
    const evicted=adapter.maintain(receipt,0,"evict",0)
    expect(evicted.status).toBe("Evicted")
    if(evicted.status!=="Evicted")return
    expect(evicted.unchangedReceipt).toBe(receipt)
    expect(evicted.unchangedRevision).toBe(0)
    expect(evicted.releasedResources).toBe(1)
    expect(evicted.releasedBytes).toBeGreaterThan(0)
    expect(adapter.maintain(receipt,0,"evict",0).status).toBe("Unchanged")
    expect(adapter.apply(receipt,{expectedRevision:0,startOffset:2,endOffset:2,replacementText:"",
      composition:"committed",anchorSpanId:"span-1"}).status).toBe("NoOp")
    const edit={expectedRevision:0,startOffset:2,endOffset:2,replacementText:"C",
      composition:"committed" as const,anchorSpanId:"span-1"}
    const missing=adapter.apply(receipt,edit)
    expect(missing.status).toBe("NotAdmissible")
    if(missing.status==="NotAdmissible")expect(missing.reason).toBe("recovery-required")
    expect(adapter.maintain(receipt,1,"recover",0).status).toBe("NotAdmissible")
    const recovered=adapter.maintain(receipt,0,"recover",0)
    expect(recovered.status).toBe("Recovered")
    expect(adapter.maintain(receipt,0,"recover",0).status).toBe("Unchanged")
    const accepted=adapter.apply(receipt,edit)
    expect(accepted.status).toBe("Accepted")
    if(accepted.status!=="Accepted")return
    expect(adapter.dispose(accepted.nextReceipt).status).toBe("Disposed")

    const raw=parse(wasm.stage3_create(JSON.stringify(fixture("AB"))))
    const request=(operation:string)=>JSON.stringify({receipt:raw.receipt,expectedRevision:0,operation,runIndex:0})
    expect(parse(wasm.stage6_maintain(request("evict"))).status).toBe("Evicted")
    expect(parse(wasm.stage6_maintain(request("recover"))).status).toBe("Recovered")
    const rawEdit=parse(wasm.stage4_apply(JSON.stringify({...edit,receipt:raw.receipt})))
    expect(rawEdit.status).toBe("Accepted")
    expect(parse(wasm.stage5_verify(rawEdit.nextReceipt,JSON.stringify(fixture("ABC")))).status).toBe("Equal")
    expect(parse(wasm.stage3_dispose(rawEdit.nextReceipt)).status).toBe("Disposed")
  },120_000)

  it("pins the plan while an inverse sibling retains the parent snapshot",()=>{
    const created=parse(wasm.stage3_create(JSON.stringify(fixture("AB"))))
    const split=parse(wasm.stage5_apply(JSON.stringify({operation:"enter",receipt:created.receipt,
      expectedRevision:0,caretOffset:1,composition:"committed"})))
    expect(split.status).toBe("Accepted")
    const [left,right]=split.receipts as string[]
    const pinned=parse(wasm.stage6_maintain(JSON.stringify({receipt:left,expectedRevision:0,operation:"evict",runIndex:0})))
    expect(pinned.reason).toBe("resource-in-use")
    const joined=parse(wasm.stage5_apply(JSON.stringify({operation:"join",receipt:left,rightReceipt:right,
      expectedRevision:0,rightRevision:0,composition:"committed"})))
    expect(joined.status).toBe("Accepted")
    expect(parse(wasm.stage3_dispose(joined.receipts[0])).status).toBe("Disposed")
  },120_000)

  it("releases the derived shard tree while preserving source and authored ownership",()=>{
    const created=parse(wasm.stage3_create(JSON.stringify(fixture("AB"))))
    const receipt=created.receipt as string
    const request=(operation:string)=>JSON.stringify({receipt,expectedRevision:0,operation,runIndex:0,target:"shard"})
    const evicted=parse(wasm.stage6_maintain(request("evict")))
    expect(evicted.status).toBe("Evicted")
    expect(evicted.releasedBytes).toBeGreaterThan(0)
    const edit={receipt,expectedRevision:0,startOffset:2,endOffset:2,replacementText:"C",
      composition:"committed",anchorSpanId:"span-1"}
    expect(parse(wasm.stage4_apply(JSON.stringify(edit))).reason).toBe("recovery-required")
    expect(parse(wasm.stage6_maintain(request("recover"))).status).toBe("Recovered")
    expect(parse(wasm.stage5_verify(receipt,JSON.stringify(fixture("AB")))).status).toBe("Equal")
    const accepted=parse(wasm.stage4_apply(JSON.stringify(edit)))
    expect(accepted.status).toBe("Accepted")
    expect(parse(wasm.stage5_verify(accepted.nextReceipt,JSON.stringify(fixture("ABC")))).status).toBe("Equal")
    const disposed=parse(wasm.stage3_dispose(accepted.nextReceipt))
    expect(disposed.affectedSummary.familyEvents.evictionEvents).toBe(1)
    expect(disposed.affectedSummary.familyEvents.recoveryEvents).toBe(1)
  },120_000)


  it("preserves the exact named cache-eviction row and its separate seam limit",()=>{
    expect(corpus.adversarial).toContain("shape-plan-cache-eviction")
    const text=base("mixed",2048)
    const created=parse(wasm.stage3_create(JSON.stringify(fixture(text))))
    expect(created.status).toBe("Created")
    const receipt=created.receipt as string
    const edit={receipt,expectedRevision:0,startOffset:500,endOffset:500,replacementText:"A",
      anchorSpanId:"span-1",composition:"committed"}
    const baseline=parse(wasm.stage4_apply(JSON.stringify(edit)))
    expect(baseline.reason).toBe("uncertified-seam")
    expect(parse(wasm.stage5_verify(receipt,JSON.stringify(fixture(text)))).status).toBe("Equal")
    // The historical runner churned unrelated provider plans; current Core
    // explicitly evicts the plan needed by this exact run (index 45).
    const request=(operation:string)=>JSON.stringify({receipt,expectedRevision:0,operation,runIndex:45,target:"plan"})
    const evicted=parse(wasm.stage6_maintain(request("evict")))
    expect(evicted.status).toBe("Evicted")
    expect(evicted.releasedBytes).toBeGreaterThan(0)
    const missing=parse(wasm.stage4_apply(JSON.stringify(edit)))
    expect(missing.reason).toBe("recovery-required")
    expect(missing.unchangedReceipt).toBe(receipt)
    expect(parse(wasm.stage6_maintain(request("recover"))).status).toBe("Recovered")
    const after=parse(wasm.stage4_apply(JSON.stringify(edit)))
    expect(after.reason).toBe("uncertified-seam")
    expect(after.unchangedReceipt).toBe(receipt)
    expect(after.unchangedRevision).toBe(0)
    expect(parse(wasm.stage5_verify(receipt,JSON.stringify(fixture(text)))).status).toBe("Equal")
    expect(parse(wasm.stage3_dispose(receipt)).status).toBe("Disposed")
  },120_000)
})
