import { afterEach, beforeAll, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { createFlowDocProductSessionRuntimeV1, type FlowDocProductSessionRuntimeV1 } from "../packages/text-engine-rust-wasm/src/productSessionV1.js"
import * as productWasm from "../packages/text-engine-rust-wasm/pkg-product-session/flowdoc_product_session.js"
const bytes=(path:string)=>Uint8Array.from(readFileSync(path)).buffer
const font=()=>bytes("assets/fonts/Sarabun/Sarabun-Regular.ttf")
let runtime:FlowDocProductSessionRuntimeV1
const create=(text:string)=>runtime.create({sessionId:"test",paragraphId:"paragraph",text,fontBytes:font()})
afterEach(()=>{
  const probe=JSON.parse(productWasm.product_session_create(JSON.stringify({paragraphId:"cleanup-probe",authoredSpans:[],fontBytes:Array.from(new Uint8Array(font()))})))
  expect(probe.status).toBe("Created")
  const disposed=JSON.parse(productWasm.product_session_dispose(probe.receipt))
  expect(disposed.disposalSummary.liveSessions).toBe(0)
  expect(disposed.retainedInversePairs).toBe(0)
})
describe("retained product session release WASM",()=>{
 beforeAll(async()=>{runtime=await createFlowDocProductSessionRuntimeV1({wasmBytes:bytes("packages/text-engine-rust-wasm/pkg-product-session/flowdoc_product_session_bg.wasm")})})
 it("product module omits QA mutation, fault and verification exports",()=>{
   expect(Object.keys(productWasm).filter(k=>/^stage[3-7]_/.test(k))).toEqual([])
 })
 it("matches untouched main60258d9 Creator product output exactly for Thai/Latin/wrapping/empty",()=>{
   const baseline=JSON.parse(readFileSync("tests/fixtures/product-session-baseline-60258d9.json","utf8"))
   for(const row of baseline.rows){const s=create(row.text);try{
     const pages=s.frame().pages.map(p=>({...p,paintCommands:p.paintCommands.map(({authority,paragraphIndex,outlineScaleX,outlineScaleY,...c})=>c)}))
     expect(pages).toEqual(row.pages)
     expect(s.frame().work.geometryMode).toBe("full-paragraph-reflow")
     expect(s.frame().work.sourceCopiedUtf16).toBe(row.text.length)
   }finally{s.dispose()}}
 })
 it("typing, full range delete, empty style and rejected/stale commands are atomic",()=>{
   const s=create("ABC")
   try{
     expect(s.apply({expectedRevision:0,paragraphIndex:0,startOffset:1,endOffset:1,replacementText:"X"}).status).toBe("accepted")
     const frame=s.frame();expect(frame.paragraphs[0].text).toBe("AXBC")
     expect(s.apply({expectedRevision:0,paragraphIndex:0,startOffset:1,endOffset:1,replacementText:"Y"}).status).toBe("blocked");expect(s.frame()).toBe(frame)
     expect(s.apply({expectedRevision:1,paragraphIndex:0,startOffset:0,endOffset:1,replacementText:"😀"}).status).toBe("blocked");expect(s.frame()).toBe(frame)
     expect(s.apply({expectedRevision:1,paragraphIndex:0,startOffset:0,endOffset:4,replacementText:""}).status).toBe("accepted")
     expect(s.frame().paragraphs[0].paragraph.defaults?.styleKey).toBe("body")
     expect(s.apply({expectedRevision:2,paragraphIndex:0,startOffset:0,endOffset:0,replacementText:"ไทย"}).status).toBe("accepted")
     expect(s.frame().paragraphs[0].text).toBe("ไทย")
   }finally{s.dispose()}
   expect(()=>s.frame()).toThrow("disposed")
 })
 it.each([0,2,4])("authored Enter at %i preserves source/defaults and exact inverse join",offset=>{
   const s=runtime.create({sessionId:"split",paragraphId:"paragraph",authoredSpans:[{spanId:"first",text:"AB"},{spanId:"second",text:"CD"}],fontBytes:font()})
   try {
     const before=s.frame()
     const entered=s.enter({expectedRevision:0,paragraphIndex:0,caretOffset:offset});expect(entered.status,JSON.stringify(entered.status==='blocked'?entered.reason:'')).toBe("accepted")
     expect(s.frame().paragraphs.map(p=>p.text)).toEqual(["ABCD".slice(0,offset),"ABCD".slice(offset)])
     expect(s.frame().paragraphs.every(p=>p.paragraph.defaults?.styleKey==="body")).toBe(true)
     const join=s.inverseJoin({expectedRevision:1});expect(join.status,join.status==='blocked'?join.reason:'').toBe("accepted")
     expect(s.frame().paragraphs[0].text).toBe("ABCD")
     expect(s.frame().paragraphs[0].spans.map(s=>s.spanId)).toEqual(before.paragraphs[0].spans.map(s=>s.spanId))
   }finally{s.dispose()}
 })
 it("edited split child explicitly loses inverse eligibility",()=>{
   const s=create("ABCD");try{
     expect(s.enter({expectedRevision:0,paragraphIndex:0,caretOffset:2}).status).toBe("accepted")
     expect(s.apply({expectedRevision:1,paragraphIndex:0,startOffset:1,endOffset:1,replacementText:"X"}).status).toBe("accepted")
     const frame=s.frame(),join=s.inverseJoin({expectedRevision:2});expect(join.status).toBe("blocked");expect(s.frame()).toBe(frame)
   }finally{s.dispose()}
 })
 it("provisional IME paints Core frames; cancellation restores base; final history commits once",()=>{
   const s=create("AB");try{
     expect(s.beginComposition({expectedRevision:0,paragraphIndex:0,startOffset:1,endOffset:1,compositionId:"ime-1"}).status).toBe("accepted")
     expect(s.updateComposition({expectedRevision:1,text:"ก"}).status).toBe("accepted")
     expect(s.frame().paragraphs[0].text).toBe("AกB");expect(s.frame().historyCommits).toBe(0);expect(s.frame().committedRevision).toBe(0)
     expect(s.updateComposition({expectedRevision:2,text:"กิ้"}).status).toBe("accepted")
     expect(s.frame().paragraphs[0].text).toBe("Aกิ้B");expect(s.frame().pages[0].paintCommands[0].text).toBe("Aกิ้B")
     expect(s.history()).toEqual([])
     expect(s.cancelComposition({expectedRevision:3}).status).toBe("accepted");expect(s.frame().paragraphs[0].text).toBe("AB");expect(s.frame().historyCommits).toBe(0)
     expect(s.beginComposition({expectedRevision:4,paragraphIndex:0,startOffset:1,endOffset:1,compositionId:"ime-2"}).status).toBe("accepted")
     expect(s.updateComposition({expectedRevision:5,text:"ไทย"}).status).toBe("accepted")
     expect(s.commitComposition({expectedRevision:6}).status).toBe("accepted");expect(s.frame().paragraphs[0].text).toBe("AไทยB");expect(s.frame().historyCommits).toBe(1);expect(s.frame().committedRevision).toBe(1)
     expect(s.history()).toHaveLength(1)
     expect(s.history()[0]).toMatchObject({sequence:1,kind:"composition",compositionId:"ime-2",beforeCommittedRevision:0,afterCommittedRevision:1,delta:{paragraphIndex:0,startOffset:1,endOffset:1,replacementText:"ไทย"}})
     expect(s.history()[0].before[0].sourceBinding).not.toBe(s.history()[0].after[0].sourceBinding)
     expect(Object.isFrozen(s.history()[0])).toBe(true)
     const frame=s.frame();expect(s.commitComposition({expectedRevision:7}).status).toBe("blocked");expect(s.frame()).toBe(frame)
   }finally{s.dispose()}
 })
 it("caret, selection, movement and hit testing share exact frame revision",()=>{
   const s=create("ABC");try{
     const a={paragraphIndex:0,offsetUtf16:0,affinity:"downstream" as const},b={paragraphIndex:0,offsetUtf16:2,affinity:"upstream" as const}
     const caret=s.caret(0,a);expect(caret.xPt).toBe(36)
     expect(s.move(0,a,"right").offsetUtf16).toBe(1)
     const selected=s.select(0,{anchor:a,focus:b});expect(selected.rectangles[0].rectPt.width).toBe(s.caret(0,b).xPt-36)
     expect(s.hitTest(0,{pageIndex:0,xPt:36,yPt:40}).offsetUtf16).toBe(0)
     expect(()=>s.caret(1,a)).toThrow("stale-revision")
   }finally{s.dispose()}
 })
})

it.each([1,3,7])("Thai authored Enter at ordinary caret %i",offset=>{
 const s=create("ภาษาไทย Latin");try{const r=s.enter({expectedRevision:0,paragraphIndex:0,caretOffset:offset});expect(r.status,r.status==="blocked"?r.reason:"").toBe("accepted");expect(s.inverseJoin({expectedRevision:1}).status).toBe("accepted")}finally{s.dispose()}
})

it("raw accepted edit invalidates a full-context inverse parent and releases it",()=>{
 const c=JSON.parse(productWasm.product_session_create(JSON.stringify({paragraphId:"raw-parent",authoredSpans:[{spanId:"raw",text:"ภาษาไทย Latin"}],fontBytes:Array.from(new Uint8Array(font()))})))
 const split=JSON.parse(productWasm.product_session_enter(JSON.stringify({operation:"enter",receipt:c.receipt,expectedRevision:0,caretOffset:1,composition:"committed"})))
 expect(split.status).toBe("Accepted");expect(split.execution).toBe("full-context-required")
 const edited=JSON.parse(productWasm.product_session_apply(JSON.stringify({receipt:split.receipts[0],expectedRevision:0,startOffset:1,endOffset:1,replacementText:"A",anchorSpanId:"raw"})))
 expect(edited.status).toBe("Accepted")
 const disposed=JSON.parse(productWasm.product_session_dispose(edited.nextReceipt));expect(disposed.retainedInversePairs).toBe(0)
 productWasm.product_session_dispose(split.receipts[1])
})
