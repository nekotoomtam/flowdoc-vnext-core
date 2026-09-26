import {beforeAll,describe,expect,it} from "vitest"
import {buildColdQaWasm} from "./coldQaWasmBuild.js"
import {fixture} from "./coldStage3Fixtures.js"
import {createColdSessionQaAdapter} from "../packages/text-engine-rust-wasm/src/coldSessionStage3.js"
let wasm:any
beforeAll(async()=>{wasm=await buildColdQaWasm()},360_000)
function create(text:string){const f=fixture(text);if(!text)f.authoredSpans=[];return JSON.parse(wasm.stage3_create(JSON.stringify(f)))}
function enter(receipt:string,caretOffset:number){return JSON.parse(wasm.stage5_apply(JSON.stringify({operation:"enter",receipt,expectedRevision:0,caretOffset,composition:"committed"})))}
function join(left:string,right:string){return JSON.parse(wasm.stage5_apply(JSON.stringify({operation:"join",receipt:left,expectedRevision:0,rightReceipt:right,rightRevision:0,composition:"committed"})))}
describe("actual WASM private Stage 5",()=>{
 it("provides independent full-provider QA comparison without exporting raw facts",()=>{
  expect(typeof wasm.stage5_verify).toBe("function")
 })
 it.each([["AB",0],["AB",1],["AB",2],["กA",0],["กA",1],["กA",2],["office",0],["office",3],["office",6],["",0]] as const)("matches independent full-provider children and inverse %s:%s",(text,caret)=>{
  const original=create(text);expect(original.status).toBe("Created")
  const split=enter(original.receipt,caret);expect(split.status,JSON.stringify(split)).toBe("Accepted")
  expect(split.receipts[0]).not.toBe(split.receipts[1])
  for(const [index,part] of [text.slice(0,caret),text.slice(caret)].entries()){
   const f=fixture(part);if(!part)f.authoredSpans=[]
   const sourceStart=index===0?0:caret
   const cut=caret>0 && caret<text.length
   const authoredOrigins=part ? [cut ? {spanId:"span-1",sourceBinding:original.coldSummary.sourceDigest,startOffset:sourceStart,endOffset:sourceStart+part.length}:null] : []
   const check=JSON.parse(wasm.stage5_verify(split.receipts[index],JSON.stringify({input:f,authoredOrigins})))
   expect(check).toMatchObject({status:"Equal",qaOnly:true})
   expect(check.source).toBeUndefined();expect(check.glyphs).toBeUndefined()
  }
  const inverse=join(split.receipts[0],split.receipts[1]);expect(inverse.status,JSON.stringify(inverse)).toBe("Accepted")
  const f=fixture(text);if(!text)f.authoredSpans=[]
  expect(JSON.parse(wasm.stage5_verify(inverse.receipts[0],JSON.stringify(f))).status).toBe("Equal")
  for(const name of ["sourceFactsUtf16","propertyFactsUtf16"])expect(split.affectedSummary.work[name]).toBeLessThanOrEqual(512)
  expect(split.affectedSummary.work.shapingSegmentationInputUtf16).toBeLessThanOrEqual(1024)
  expect(JSON.parse(wasm.stage3_dispose(inverse.receipts[0])).status).toBe("Disposed")
 })
})

it("keeps structural capabilities opaque and consumes them only on success",()=>{
 const adapter=createColdSessionQaAdapter(wasm);const f=fixture("AB");const parent=adapter.create(f.providerContext,f.paragraphContext,f.authoredSpans);expect(parent.status).toBe("Created");if(parent.status!=="Created")throw Error("create failed")
 expect(adapter.enter(parent.receipt,0,1,"active").status).toBe("NotAdmissible")
 const split=adapter.enter(parent.receipt,0,1);expect(split.status).toBe("Accepted");if(split.status!=="Accepted")throw Error("split failed")
 expect(JSON.stringify(split.receipts)).toBe("[{},{}]");expect(adapter.enter(parent.receipt,0,0).status).toBe("UnknownReceipt")
 expect(adapter.join(split.receipts[1]!,split.receipts[0]!).status).toBe("NotAdmissible")
 const inverse=adapter.join(split.receipts[0]!,split.receipts[1]!);expect(inverse.status).toBe("Accepted");if(inverse.status!=="Accepted")throw Error("join failed")
 expect(adapter.join(split.receipts[0]!,split.receipts[1]!).status).toBe("UnknownReceipt");expect(adapter.dispose(inverse.receipts[0]!).status).toBe("Disposed")
})

it("preserves a host capability when disposal cannot publish",()=>{
 let refuse=true
 const adapter=createColdSessionQaAdapter({...wasm,stage3_dispose:(receipt:string)=>refuse?JSON.stringify({status:"NotDisposed",reason:"lifecycle-overflow"}):wasm.stage3_dispose(receipt)})
 const f=fixture("AB");const created=adapter.create(f.providerContext,f.paragraphContext,f.authoredSpans);if(created.status!=="Created")throw Error("create failed")
 expect(adapter.dispose(created.receipt).status).toBe("NotDisposed");refuse=false;expect(adapter.dispose(created.receipt).status).toBe("Disposed")
})

it("rejects live unsafe and forged structural commands unchanged",()=>{
 for(const [text,cut] of [["ก่ข",1]] as const){const parent=create(text);expect(parent.status,JSON.stringify(parent)).toBe("Created");const rejected=enter(parent.receipt,cut);expect(rejected).toMatchObject({status:"NotAdmissible",reason:"uncertified-boundary"});expect(JSON.parse(wasm.stage5_verify(parent.receipt,JSON.stringify(fixture(text)))).status).toBe("Equal");wasm.stage3_dispose(parent.receipt)}
 const parent=create("AB");const command={operation:"enter",receipt:parent.receipt,expectedRevision:0,caretOffset:1,composition:"committed"}
 for(const [change,reason] of [[{caretOffset:3},"invalid-caret"],[{expectedRevision:1},"stale-revision"],[{receipt:"forged"},"unknown-receipt"],[{certificate:{}},"invalid-command"]] as const)expect(JSON.parse(wasm.stage5_apply(JSON.stringify({...command,...change})))).toMatchObject({status:"NotAdmissible",reason})
 const split=enter(parent.receipt,1),other=create("CD"),otherSplit=enter(other.receipt,1)
 expect(join(split.receipts[0],otherSplit.receipts[1]).reason).toBe("not-unchanged-siblings")
 const rejectedEdit=JSON.parse(wasm.stage4_apply(JSON.stringify({receipt:split.receipts[0],expectedRevision:0,startOffset:0,endOffset:0,replacementText:"C",composition:"active",anchorSpanId:"irrelevant"})));expect(rejectedEdit.reason).toBe("composition-active")
 const joined=join(split.receipts[0],split.receipts[1]);expect(joined.status).toBe("Accepted");wasm.stage3_dispose(joined.receipts[0]);wasm.stage3_dispose(otherSplit.receipts[1]);expect(join(otherSplit.receipts[0],otherSplit.receipts[1]).reason).toBe("unknown-receipt");wasm.stage3_dispose(otherSplit.receipts[0])
})
it("reports unsupported construction for empty RTL and non-BMP font coverage",()=>{
 const rtl=fixture("");rtl.authoredSpans=[];Object.assign(rtl.paragraphContext,{baseDirection:"rtl"});expect(JSON.parse(wasm.stage3_create(JSON.stringify(rtl)))).toMatchObject({status:"NotCreated",reason:"unsupported-font-script"})
 // This installed private Sarabun provider has no supported astral glyph;
 // no live surrogate-cut claim can be made for a session it cannot construct.
 expect(create("A\u200dB")).toMatchObject({status:"NotCreated",reason:"unsupported-font-script"})
 expect(create("A😀B")).toMatchObject({status:"NotCreated",reason:"unsupported-font-script"})
})
