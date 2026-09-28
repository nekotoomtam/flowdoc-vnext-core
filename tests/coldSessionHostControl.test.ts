import {afterAll,beforeAll,describe,expect,it} from "vitest"
import {writeFileSync} from "node:fs"
import {buildColdQaWasm} from "./coldQaWasmBuild.js"
import {fixture} from "./coldStage3Fixtures.js"
// @ts-expect-error Private unchanged Stage6 generator has no declarations.
import {firstEdit,applyEdit} from "../scripts/stage6/corpus.mjs"
import {createColdSessionQaAdapter,type ColdQaWasm} from "../packages/text-engine-rust-wasm/src/coldSessionStage3.js"
import {createColdSessionHostControl,checkedHostCostSum,type HostCompletion,type HostCosts} from "../packages/text-engine-rust-wasm/src/coldSessionHostControl.js"

let wasm:ColdQaWasm & {stage7_apply(input:string,control:string):string}
beforeAll(async()=>{wasm=await buildColdQaWasm() as typeof wasm},360_000)
const observations:Array<Record<string,unknown>>=[]
afterAll(()=>{if(process.env.FLOWDOC_HOST_ARTIFACT)writeFileSync(process.env.FLOWDOC_HOST_ARTIFACT,
  JSON.stringify({kind:"host-control-actual-wasm",observations},null,2)+"\n")})
function record(name:string,done:{operationId:string;delivery:string;requestedAt:number|null;enteredAt:number;completedAt:number;
  deliveredAt:number;result:{status:string};costs:unknown;familyCosts:unknown;accountingOverflow:boolean;unaccumulatedCosts:unknown}){
  observations.push({name,operationId:done.operationId,delivery:done.delivery,
    requestedAt:done.requestedAt,enteredAt:done.enteredAt,completedAt:done.completedAt,deliveredAt:done.deliveredAt,
    resultStatus:done.result.status,costs:done.costs,familyCosts:done.familyCosts,
    accountingOverflow:done.accountingOverflow,unaccumulatedCosts:done.unaccumulatedCosts})
}
function create(host:ReturnType<typeof createColdSessionHostControl>,text="AB"){
  const input=fixture(text)
  const made=host.create(input.providerContext,input.paragraphContext,input.authoredSpans)
  expect(made.status).toBe("Created")
  if(made.status!=="Created")throw Error("create failed")
  return made.receipt
}
const edit=(text="C")=>({expectedRevision:0,startOffset:2,endOffset:2,replacementText:text,
  composition:"committed" as const,anchorSpanId:"span-1"})

describe("real host delivery on actual synchronous WASM",()=>{
  it("authenticates already aborted ordinary and no-op attempts, charges Rust, and accepts a fresh retry",async()=>{
    const host=createColdSessionHostControl(createColdSessionQaAdapter(wasm))
    const receipt=create(host)
    const before=new AbortController();before.abort()
    const cancelled=await host.apply(receipt,edit(),before.signal).completion
    record("already-aborted-edit",cancelled)
    expect(cancelled).toMatchObject({delivery:"pre-entry",result:{status:"Cancelled",reason:"cancelled",unchangedReceipt:receipt,unchangedRevision:0}})
    if(cancelled.result.status!=="Cancelled")throw Error("expected cancel")
    expect(cancelled.result.affectedSummary.work.shapingCalls).toBe(0)
    expect(cancelled.result.affectedSummary.work.abiInputBytes).toBeGreaterThan(0)
    const noOp=await host.apply(receipt,edit(""),before.signal).completion
    record("already-aborted-no-op",noOp)
    expect(noOp.result.status).toBe("Cancelled")
    const retry=await host.apply(receipt,edit()).completion
    record("fresh-retry-edit",retry)
    expect(retry.operationId).not.toBe(cancelled.operationId)
    expect(retry.result.status).toBe("Accepted")
    expect(retry.delivery).toBe("none")
    expect(retry.costs.endToEndMs).toBeGreaterThanOrEqual(retry.costs.rustAbiMs)
    expect(retry.familyCosts?.calls).toBe(4)
    if(retry.result.status==="Accepted")expect(host.dispose(retry.result.nextReceipt).result.status).toBe("Disposed")
  })

  it("delivers queued cancellation before entry and cannot route a stale operation ID to another request",async()=>{
    const host=createColdSessionHostControl(createColdSessionQaAdapter(wasm))
    const receipt=create(host)
    const first=new AbortController()
    const queued=host.apply(receipt,edit(""),first.signal)
    first.abort()
    const result=await queued.completion
    record("queued-before-entry",result)
    expect(result.delivery).toBe("pre-entry")
    expect(result.result.status).toBe("Cancelled")
    const next=host.apply(receipt,edit(""))
    expect(host.cancel(queued.operationId)).toBe(false)
    expect((await next.completion).result.status).toBe("NoOp")
    expect(host.dispose(receipt).result.status).toBe("Disposed")
  })

  it("reports a callback queued by synchronous invocation as too-late with its actual accepted result",async()=>{
    const controller=new AbortController()
    const wrapped={...wasm,stage7_apply:(input:string,control:string)=>{
      setTimeout(()=>controller.abort(),0)
      return wasm.stage7_apply(input,control)
    }}
    const host=createColdSessionHostControl(createColdSessionQaAdapter(wrapped))
    const receipt=create(host)
    const op=host.apply(receipt,edit(),controller.signal)
    const done=await op.completion
    record("callback-delayed-by-sync-wasm",done)
    expect(done.result.status).toBe("Accepted")
    expect(done.delivery).toBe("too-late")
    expect(done.requestedAt).toBeGreaterThan(done.completedAt)
    const c=done.costs
    expect(c.queueMs+c.controlMs+c.serializationMs+c.rustAbiMs+c.otherMs+c.lateControlMs)
      .toBeCloseTo(c.endToEndMs,5)
    expect(op.cancel()).toBe("too-late")
    if(done.result.status==="Accepted")expect(host.dispose(done.result.nextReceipt).result.status).toBe("Disposed")
  })

  it("observes a real AbortSignal after completed NoOp without changing the delivered result",async()=>{
    const adapter=createColdSessionQaAdapter(wasm),host=createColdSessionHostControl(adapter)
    const receipt=create(host),controller=new AbortController()
    const op=host.apply(receipt,edit(""),controller.signal)
    const done=await op.completion
    expect(done.result.status).toBe("NoOp")
    expect(done.delivery).toBe("none")
    const commandMs=done.costs.endToEndMs
    controller.abort()
    expect(done.delivery).toBe("too-late")
    record("abort-after-completed-no-op",done)
    expect(done.requestedAt).toBeGreaterThan(done.completedAt)
    expect(done.costs.lateControlMs).toBeGreaterThan(0)
    expect(done.familyCosts?.lateControlMs).toBe(done.costs.lateControlMs)
    expect(done.costs.endToEndMs).toBe(commandMs)
    expect(adapter.verify(receipt,fixture("AB")).status).toBe("Equal")
    expect(host.dispose(receipt).result.status).toBe("Disposed")
  })

  it("reports delayed callbacks with actual Recovered and failed results",async()=>{
    const recoverAbort=new AbortController(),failureAbort=new AbortController()
    const wrapped={...wasm,
      stage7_maintain:(input:string,control:string)=>{if(JSON.parse(input).operation==="recover")setTimeout(()=>recoverAbort.abort(),0);return wasm.stage7_maintain!(input,control)},
      stage7_apply:(input:string,control:string)=>{setTimeout(()=>failureAbort.abort(),0);return wasm.stage7_apply(input,control)}}
    const adapter=createColdSessionQaAdapter(wrapped),host=createColdSessionHostControl(adapter)
    const receipt=create(host)
    const evicted=await host.maintain(receipt,0,"evict",0,"plan").completion
    expect(evicted.result.status).toBe("Evicted")
    const recovered=await host.maintain(receipt,0,"recover",0,"plan",recoverAbort.signal).completion
    record("callback-delayed-recovered",recovered)
    expect(recovered.result.status).toBe("Recovered")
    expect(recovered.delivery).toBe("too-late")
    const failed=await host.apply(receipt,{...edit(),expectedRevision:1},failureAbort.signal).completion
    record("callback-delayed-failure",failed)
    expect(failed.result).toMatchObject({status:"NotAdmissible",reason:"stale-revision"})
    expect(failed.delivery).toBe("too-late")
    expect(adapter.verify(receipt,fixture("AB")).status).toBe("Equal")
    expect(host.dispose(receipt).result.status).toBe("Disposed")
  })

  it("keeps Enter and Join capabilities atomic across cancellation, then completes the inverse",async()=>{
    const host=createColdSessionHostControl(createColdSessionQaAdapter(wasm))
    const receipt=create(host), controller=new AbortController();controller.abort()
    const stopped=await host.enter(receipt,0,1,controller.signal).completion
    record("already-aborted-enter",stopped)
    expect(stopped.result.status).toBe("Cancelled")
    if(stopped.result.status==="Cancelled")expect(stopped.result.unchangedReceipts).toEqual([receipt])
    const entered=await host.enter(receipt,0,1).completion
    expect(entered.result.status).toBe("Accepted")
    if(entered.result.status!=="Accepted")throw Error("enter failed")
    const [left,right]=entered.result.receipts
    const stopJoin=await host.join(left!,right!,0,0,controller.signal).completion
    record("already-aborted-join",stopJoin)
    expect(stopJoin.result.status).toBe("Cancelled")
    if(stopJoin.result.status==="Cancelled")expect(stopJoin.result.unchangedReceipts).toEqual([left,right])
    const joined=await host.join(left!,right!,0,0).completion
    expect(joined.result.status).toBe("Accepted")
    if(joined.result.status==="Accepted")expect(host.dispose(joined.result.receipts[0]!).result.status).toBe("Disposed")
  })

  it("binds recovery to exact provider and missing target, with unchanged cancellation",async()=>{
    const host=createColdSessionHostControl(createColdSessionQaAdapter(wasm))
    const receipt=create(host), controller=new AbortController();controller.abort()
    const evicted=await host.maintain(receipt,0,"evict",0,"plan").completion
    expect(evicted.result.status).toBe("Evicted")
    const stopped=await host.maintain(receipt,0,"recover",0,"plan",controller.signal).completion
    record("already-aborted-recover",stopped)
    expect(stopped.result.status).toBe("Cancelled")
    expect(stopped.result.status==="Cancelled"?stopped.result.unchangedReceipt:null).toBe(receipt)
    const recovered=await host.maintain(receipt,0,"recover",0,"plan").completion
    expect(recovered.result.status).toBe("Recovered")
    expect(recovered.familyCosts?.calls).toBe(4)
    expect(host.dispose(receipt).result.status).toBe("Disposed")
  })

  it("lets normal validation precede cancellation and rejects a mismatched control envelope",()=>{
    const f=fixture("AB")
    const made=JSON.parse(wasm.stage3_create(JSON.stringify(f)))
    expect(made.status).toBe("Created")
    const command={receipt:made.receipt,expectedRevision:0,startOffset:2,endOffset:2,
      replacementText:"C",composition:"committed",anchorSpanId:"span-1"}
    const control={operationId:crypto.randomUUID(),receipt:made.receipt,expectedRevision:0,
      rightReceipt:null,rightRevision:null,runIndex:null,providerId:null,providerRevision:null,cancelled:true}
    const invalid=JSON.parse(wasm.stage7_apply(JSON.stringify({...command,expectedRevision:1}),JSON.stringify({...control,expectedRevision:1})))
    expect(invalid).toMatchObject({status:"NotAdmissible",reason:"stale-revision"})
    expect(invalid.affectedSummary.work.abiInputBytes).toBe(
      JSON.stringify({...command,expectedRevision:1}).length+JSON.stringify({...control,expectedRevision:1}).length)
    expect(invalid.affectedSummary.work.commandParseCalls).toBe(1)
    const mismatched=JSON.parse(wasm.stage7_apply(JSON.stringify(command),JSON.stringify({...control,receipt:"unrelated"})))
    expect(mismatched).toMatchObject({status:"NotAdmissible",reason:"invalid-host-control"})
    const stopped=JSON.parse(wasm.stage7_apply(JSON.stringify(command),JSON.stringify(control)))
    expect(stopped).toMatchObject({status:"Cancelled",reason:"cancelled",unchangedReceipt:made.receipt,unchangedRevision:0})
    expect(stopped.affectedSummary.work.shapingCalls).toBe(0)
    expect(stopped.affectedSummary.work.abiInputBytes).toBeGreaterThan(JSON.stringify(command).length)
    expect(stopped.affectedSummary.work.commandParseCalls).toBe(2)
    const disposed=JSON.parse(wasm.stage3_dispose(made.receipt))
    expect(disposed.status).toBe("Disposed")
    expect(disposed.affectedSummary.familyEvents.rejectedAttempts).toBeGreaterThanOrEqual(3)
  })

  it("rejects cancellation envelopes for another maintenance operation or target",()=>{
    const f=fixture("AB"),made=JSON.parse(wasm.stage3_create(JSON.stringify(f)))
    expect(made.status).toBe("Created")
    const command={receipt:made.receipt,expectedRevision:0,operation:"evict",runIndex:0,target:"plan"}
    const base={operationId:crypto.randomUUID(),receipt:made.receipt,expectedRevision:0,
      rightReceipt:null,rightRevision:null,runIndex:0,maintenanceOperation:"evict",maintenanceTarget:"plan",
      providerId:f.providerContext.providerId,providerRevision:f.providerContext.providerRevision,cancelled:true}
    for(const changed of [{maintenanceOperation:"recover"},{maintenanceTarget:"shard"},{providerRevision:"other"}]){
      const result=JSON.parse(wasm.stage7_maintain!(JSON.stringify(command),JSON.stringify({...base,...changed})))
      expect(result).toMatchObject({status:"NotAdmissible",reason:"invalid-host-control",unchangedReceipt:made.receipt})
      expect(result.affectedSummary.work.commandAuthLookups).toBeGreaterThan(0)
    }
    expect(JSON.parse(wasm.stage7_maintain!(JSON.stringify(command),JSON.stringify(base))).status).toBe("Cancelled")
    expect(JSON.parse(wasm.stage6_maintain!(JSON.stringify(command))).status).toBe("Evicted")
    expect(JSON.parse(wasm.stage3_dispose(made.receipt)).status).toBe("Disposed")
  })

  it("routes a retired receipt to unattributed host work and clears failed dispatch state",async()=>{
    let failOnce=true
    const wrapped={...wasm,stage7_apply:(input:string,control:string)=>{
      if(failOnce){failOnce=false;throw Error("host-failure")}
      return wasm.stage7_apply(input,control)
    }}
    const adapter=createColdSessionQaAdapter(wrapped),host=createColdSessionHostControl(adapter)
    const receipt=create(host)
    const first=host.apply(receipt,edit(""))
    await expect(first.completion).rejects.toThrow("host-failure")
    expect(host.cancel(first.operationId)).toBe(false)
    const accepted=await host.apply(receipt,edit()).completion
    expect(accepted.result.status).toBe("Accepted")
    if(accepted.result.status!=="Accepted")throw Error("edit failed")
    const old=await host.apply(receipt,edit("" )).completion
    expect(old.result.status).toBe("UnknownReceipt")
    expect(old.familyCosts).toBeNull()
    expect(host.unattributedCosts().calls).toBe(1)
    expect(host.dispose(accepted.result.nextReceipt).result.status).toBe("Disposed")
  })

  it("keeps one cold and exact unique family work through edit, no-op, maintenance, cancellation, siblings and disposal",async()=>{
    const adapter=createColdSessionQaAdapter(wasm),host=createColdSessionHostControl(adapter)
    const receipt=create(host),attempts:HostCompletion[]=[]
    const noOp=await host.apply(receipt,edit("")).completion;attempts.push(noOp)
    expect(noOp.result.status).toBe("NoOp")
    const abort=new AbortController();abort.abort()
    const cancelled=await host.apply(receipt,edit(),abort.signal).completion;attempts.push(cancelled)
    expect(cancelled.result.status).toBe("Cancelled")
    expect(adapter.verify(receipt,fixture("AB")).status).toBe("Equal")
    const evicted=await host.maintain(receipt,0,"evict",0,"plan").completion;attempts.push(evicted)
    expect(evicted.result.status).toBe("Evicted")
    const recovered=await host.maintain(receipt,0,"recover",0,"plan").completion;attempts.push(recovered)
    expect(recovered.result.status).toBe("Recovered")
    expect(adapter.verify(receipt,fixture("AB")).status).toBe("Equal")
    const edited=await host.apply(receipt,edit()).completion;attempts.push(edited)
    expect(edited.result.status).toBe("Accepted")
    if(edited.result.status!=="Accepted")throw Error("edit failed")
    expect(adapter.verify(edited.result.nextReceipt,fixture("ABC")).status).toBe("Equal")
    const entered=await host.enter(edited.result.nextReceipt,1,1).completion;attempts.push(entered)
    expect(entered.result.status).toBe("Accepted")
    if(entered.result.status!=="Accepted")throw Error("enter failed")
    const [left,right]=entered.result.receipts
    const siblingNoOp=await host.apply(right!,{expectedRevision:0,startOffset:2,endOffset:2,
      replacementText:"",composition:"committed",anchorSpanId:""}).completion;attempts.push(siblingNoOp)
    expect(siblingNoOp.result.status).toBe("NoOp")
    const joined=await host.join(left!,right!,0,0).completion;attempts.push(joined)
    expect(joined.result.status).toBe("Accepted")
    if(joined.result.status!=="Accepted")throw Error("join failed")
    expect(adapter.verify(joined.result.receipts[0]!,fixture("ABC")).status).toBe("Equal")
    const disposal=host.dispose(joined.result.receipts[0]!) as unknown as {result:{status:string;affectedSummary:{work:Record<string,number>;lifecycleCumulativeWork:Record<string,number>;familyEvents:Record<string,number>}};costs:{endToEndMs:number};familyCosts:{coldMs:number;endToEndMs:number;calls:number}|null}
    expect(disposal.result.status).toBe("Disposed")
    const prior=disposal.result.affectedSummary.lifecycleCumulativeWork
    for(const key of ["abiInputBytes","commandAuthLookups","shapingCalls","responseEncodingPasses"]){
      const sum=attempts.reduce((total,a)=>total+Number((a.result as any).affectedSummary.work[key]??0),0)+
        Number(disposal.result.affectedSummary.work[key]??0)
      expect(BigInt(`0x${prior[key]}`),key).toBe(BigInt(sum))
    }
    expect(disposal.result.affectedSummary.familyEvents).toMatchObject({acceptedEvents:3,noOpEvents:2,
      evictionEvents:1,recoveryEvents:1,rejectedAttempts:1,disposals:1})
    expect(disposal.familyCosts?.calls).toBe(1+attempts.length+1)
    expect(disposal.familyCosts?.coldMs).toBe(attempts[0]!.familyCosts?.coldMs)
    const hostSum=attempts.reduce((total,a)=>total+a.costs.endToEndMs,0)+
      disposal.costs.endToEndMs+disposal.familyCosts!.coldMs
    expect(disposal.familyCosts!.endToEndMs).toBeCloseTo(hostSum,8)
  })

  it("revalidates the accepted mixed1024 replacement maximum through host control",async()=>{
    const generated=firstEdit("mixed",1024,"replacement")
    const input=fixture(generated.text)
    const adapter=createColdSessionQaAdapter(wasm),host=createColdSessionHostControl(adapter)
    const made=host.create(input.providerContext,input.paragraphContext,input.authoredSpans)
    expect(made.status).toBe("Created")
    if(made.status!=="Created")throw Error("create failed")
    const done=await host.apply(made.receipt,{expectedRevision:0,startOffset:generated.edit.start,
      endOffset:generated.edit.end,replacementText:generated.edit.insertedText,
      composition:"committed",anchorSpanId:"span-1"}).completion
    record("mixed1024-replacement",done)
    expect(done.result.status).toBe("Accepted")
    if(done.result.status!=="Accepted")throw Error("mixed replacement failed")
    const w=done.result.affectedSummary.work
    expect([w.sourceFactsUtf16,w.propertyFactsUtf16,w.shapingSegmentationInputUtf16]).toEqual([475,139,260])
    expect(adapter.verify(done.result.nextReceipt,fixture(applyEdit(generated.text,generated.edit))).status).toBe("Equal")
    expect(host.dispose(done.result.nextReceipt).result.status).toBe("Disposed")
  })

  it("reports host counter overflow as unaccumulated work with prior totals intact",()=>{
    const zero:HostCosts={coldMs:0,queueMs:0,controlMs:0,serializationMs:0,rustAbiMs:0,
      otherMs:0,endToEndMs:0,lateControlMs:0,calls:Number.MAX_SAFE_INTEGER}
    const delta:HostCosts={...zero,calls:1}
    const checked=checkedHostCostSum(zero,delta)
    expect(checked.accountingOverflow).toBe(true)
    expect(checked.value.calls).toBe(Number.MAX_SAFE_INTEGER)
    expect(checked.unaccumulatedCosts?.calls).toBe(1)
  })
})
