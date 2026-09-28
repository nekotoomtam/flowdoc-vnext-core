import initWasm, * as wasm from "../pkg-product-session/flowdoc_product_session.js"
import { materializeProductFrameV1, productCaretV1, productHitTestV1, productSelectionV1, productMoveV1, type ProductFrameV1, type ProductPositionV1, type ProductSourceV1 } from "../../../src/creatorPreview/productFrameV1.js"
export type { ProductFrameV1, ProductPositionV1, ProductCaretV1, ProductSelectionV1, ProductPaintV1, ProductSourceV1 } from "../../../src/creatorPreview/productFrameV1.js"
export { createVNextCreatorGlyphOutlineProviderV1 } from "../../../src/creatorPreview/outlineV1.js"

export const FLOWDOC_PRODUCT_SESSION_WASM_URL = new URL("../pkg-product-session/flowdoc_product_session_bg.wasm", import.meta.url)
export const FLOWDOC_PRODUCT_SESSION_WASM_SHA256 = "9f0f368efe31a4fa33bd8176bba673fc666bf5a98590cddb915576d677a105bd"
export const FLOWDOC_PRODUCT_SESSION_OUTLINES_URL = new URL("../assets/creator-sarabun-outlines.v1.json", import.meta.url)
export interface ProductSessionCreateV1 {
  sessionId: string; paragraphId: string; fontBytes: ArrayBuffer; text?: string
  authoredSpans?: { spanId: string; text: string; language?: "und"; styleKey?: "body" }[]
}
export interface ProductEditV1 { expectedRevision: number; paragraphIndex: number; startOffset: number; endOffset: number; replacementText: string; anchorSpanId?: string }
export type ProductCommandResultV1 = { status: "accepted"; frame: ProductFrameV1 } | { status: "blocked"; reason: string; frame: ProductFrameV1 }
export interface ProductCommitV1 {
  sequence: number; kind: "replace" | "enter" | "inverse-join" | "composition"
  beforeCommittedRevision: number; afterCommittedRevision: number; compositionId: string | null
  before: readonly { paragraphId: string; sourceBinding: string }[]; after: readonly { paragraphId: string; sourceBinding: string }[]
  delta: { paragraphIndex: number; startOffset: number; endOffset: number; replacementText: string } | null
}
interface Retained { receipt: string; revision: number }
const decode = (wire: string): any => JSON.parse(wire)
function requireResult(result: any, status: string) { if (result.status !== status) throw new Error(result.reason ?? result.status ?? "Core command failed"); return result }
function publicWork(value:unknown):unknown {
  if(Array.isArray(value))return value.map(publicWork)
  if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value).filter(([key])=>!["receipt","nextReceipt","unchangedReceipt","receipts","rightReceipt","unchangedReceipts"].includes(key)).map(([key,item])=>[key,publicWork(item)]))
  return value
}

/** Local authored trial. Sarabun Regular 12pt, 18pt lines, A4/36pt margins, LTR Thai/Latin.
 * Rust owns authored spans and persistent source. Full source/frame work is explicit.
 * Opaque receipts stay here. No browser layout, backend, QA verifier or fault ABI.
 */
export async function createFlowDocProductSessionRuntimeV1(input: { wasmBytes: ArrayBuffer }) {
  const bytes=input.wasmBytes.slice(0)
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),n=>n.toString(16).padStart(2,"0")).join("")
  if(digest!==FLOWDOC_PRODUCT_SESSION_WASM_SHA256)throw new Error("Product session WASM digest mismatch")
  await initWasm({ module_or_path: bytes })
  return Object.freeze({ create(input: ProductSessionCreateV1) {
    if (!input.sessionId || input.sessionId.length > 128 || !input.paragraphId || (input.text !== undefined && input.authoredSpans !== undefined)) throw new Error("Invalid product session input")
    const created=requireResult(decode(wasm.product_session_create(JSON.stringify({paragraphId:input.paragraphId,fontBytes:Array.from(new Uint8Array(input.fontBytes)),authoredSpans:input.authoredSpans??(input.text?[{spanId:"text-1",text:input.text,language:"und",styleKey:"body"}]:[])}))),"Created")
    let items:Retained[]=[{receipt:created.receipt,revision:0}], disposed=false,revision=0,committedRevision=0,historyCommits=0
    const journal: Readonly<ProductCommitV1>[]=[]
    let composition: { id:string; paragraphIndex:number; start:number; end:number; base:Retained[]; baseFrame:ProductFrameV1 }|undefined
    const alive=()=>{if(disposed)throw new Error("Session disposed")}
    const project=(item:Retained)=>requireResult(decode(wasm.product_session_project(item.receipt,BigInt(item.revision))),"Ready") as ProductSourceV1
    const frameFor=(next:Retained[],nextRevision:number,committed:number,history:number,compositionId:string|null,execution:string,command:unknown)=>materializeProductFrameV1({sessionId:input.sessionId,revision:nextRevision,committedRevision:committed,historyCommits:history,compositionId,execution,command:publicWork(command),sources:next.map(project),providers:next.map(item=>({shape(text:string){const facts=decode(wasm.product_session_shape(item.receipt,BigInt(item.revision),text));if(facts.status==="Blocked")throw new Error(facts.reason);return facts},segment(text:string){const facts=decode(wasm.product_session_segment(item.receipt,BigInt(item.revision),text));if(!Array.isArray(facts))throw new Error(facts.reason??"Segmentation failed");return facts}}))})
    let current:ProductFrameV1
    try { current=frameFor(items,0,0,0,null,"cold-create",created.coldSummary) } catch(error) {wasm.product_session_dispose(items[0].receipt);throw error}
    const retire=(item:Retained)=>{wasm.product_session_dispose(item.receipt)}
    const reject=(error:unknown):ProductCommandResultV1=>({status:"blocked",reason:error instanceof Error?error.message:String(error),frame:current})
    const check=(expected:number)=>{alive();if(expected!==revision)throw new Error("stale-revision")}
    const paragraph=(index:number,list=items)=>{if(!Number.isInteger(index)||!list[index])throw new Error("invalid-paragraph");return list[index]}
    const branch=(item:Retained):Retained=>{const r=requireResult(decode(wasm.product_session_branch(item.receipt,BigInt(item.revision))),"Created");return {receipt:r.receipt,revision:r.revision}}
    const editCandidate=(base:Retained,source:ProductSourceV1,c:Omit<ProductEditV1,"expectedRevision"|"paragraphIndex">)=>{
      const next=branch(base)
      try {
        const anchor=c.anchorSpanId??source.spans.find(s=>s.startOffset<=c.startOffset&&s.endOffset>=c.startOffset)?.spanId??""
        const r=decode(wasm.product_session_apply(JSON.stringify({receipt:next.receipt,expectedRevision:next.revision,startOffset:c.startOffset,endOffset:c.endOffset,replacementText:c.replacementText,anchorSpanId:anchor})))
        if(r.status!=="Accepted"&&r.status!=="NoOp")throw new Error(r.reason??r.status)
        return {item:r.status==="Accepted"?{receipt:r.nextReceipt,revision:r.nextRevision}:next,report:r}
      } catch(error){retire(next);throw error}
    }
    const publish=(next:Retained[],frame:ProductFrameV1,transaction?:{kind:ProductCommitV1["kind"];delta?:ProductCommitV1["delta"];base?:ProductFrameV1;compositionId?:string})=>{
      if(frame.historyCommits>historyCommits){
        const base=transaction?.base??current
        const identities=(source:ProductFrameV1)=>Object.freeze(source.paragraphs.map(p=>Object.freeze({paragraphId:p.paragraph.paragraphId,sourceBinding:p.sourceBinding})))
        journal.push(Object.freeze({sequence:frame.historyCommits,kind:transaction!.kind,beforeCommittedRevision:base.committedRevision,afterCommittedRevision:frame.committedRevision,compositionId:transaction?.compositionId??null,before:identities(base),after:identities(frame),delta:transaction?.delta?Object.freeze({...transaction.delta}):null}))
      }
      items=next;current=frame;revision=frame.revision;committedRevision=frame.committedRevision;historyCommits=frame.historyCommits;return {status:"accepted" as const,frame}
    }
    const api={
      frame(){alive();return current},
      history(){alive();return Object.freeze(journal.slice())},
      apply(c:ProductEditV1):ProductCommandResultV1 {
        let candidate:Retained|undefined
        try {check(c.expectedRevision);if(composition)throw new Error("composition-active");const prior=paragraph(c.paragraphIndex)
          const source=current.paragraphs[c.paragraphIndex],result=editCandidate(prior,source,c);candidate=result.item;const next=items.slice();next[c.paragraphIndex]=candidate
          const changed=source.text.slice(c.startOffset,c.endOffset)!==c.replacementText
          const frame=frameFor(next,revision+1,committedRevision+(changed?1:0),historyCommits+(changed?1:0),null,result.report.execution,result.report)
          retire(prior);return publish(next,frame,{kind:"replace",delta:{paragraphIndex:c.paragraphIndex,startOffset:c.startOffset,endOffset:c.endOffset,replacementText:c.replacementText}})
        }catch(error){if(candidate)retire(candidate);return reject(error)}
      },
      enter(c:{expectedRevision:number;paragraphIndex:number;caretOffset:number}):ProductCommandResultV1 {
        let temporary:Retained|undefined;let children:Retained[]=[]
        try {check(c.expectedRevision);if(composition)throw new Error("composition-active");if(items.length!==1)throw new Error("trial-two-paragraph-limit");const prior=paragraph(c.paragraphIndex);temporary=branch(prior)
          const r=requireResult(decode(wasm.product_session_enter(JSON.stringify({operation:"enter",receipt:temporary.receipt,expectedRevision:temporary.revision,caretOffset:c.caretOffset,composition:"committed"}))),"Accepted")
          temporary=undefined;children=r.receipts.map((receipt:string)=>({receipt,revision:0}))
          const frame=frameFor(children,revision+1,committedRevision+1,historyCommits+1,null,r.execution??"retained-enter",r.affectedSummary)
          retire(prior);return publish(children,frame,{kind:"enter"})
        }catch(error){if(temporary)retire(temporary);children.forEach(retire);return reject(error)}
      },
      inverseJoin(c:{expectedRevision:number}):ProductCommandResultV1 {
        let candidate:Retained[]=[]
        try {check(c.expectedRevision);if(composition)throw new Error("composition-active");if(items.length!==2)throw new Error("requires-two-unchanged-siblings")
          const r=requireResult(decode(wasm.product_session_inverse_join(JSON.stringify({operation:"join",receipt:items[0].receipt,expectedRevision:items[0].revision,rightReceipt:items[1].receipt,rightRevision:items[1].revision,composition:"committed"}))),"Accepted")
          candidate=r.receipts.map((receipt:string)=>({receipt,revision:0}))
          const frame=frameFor(candidate,revision+1,committedRevision+1,historyCommits+1,null,r.execution??"retained-inverse-join",r.affectedSummary)
          items.forEach(retire)
          return publish(candidate,frame,{kind:"inverse-join"})
        }catch(error){candidate.forEach(retire);return reject(error)}
      },
      beginComposition(c:{expectedRevision:number;paragraphIndex:number;startOffset:number;endOffset:number;compositionId:string}):ProductCommandResultV1 {
        try {check(c.expectedRevision);if(composition)throw new Error("composition-active");paragraph(c.paragraphIndex);if(!c.compositionId)throw new Error("invalid-composition-id")
          productCaretV1(current,{paragraphIndex:c.paragraphIndex,offsetUtf16:c.startOffset,affinity:"downstream"});productCaretV1(current,{paragraphIndex:c.paragraphIndex,offsetUtf16:c.endOffset,affinity:"upstream"})
          const frame=frameFor(items,revision+1,committedRevision,historyCommits,c.compositionId,"composition-begin",null)
          composition={id:c.compositionId,paragraphIndex:c.paragraphIndex,start:c.startOffset,end:c.endOffset,base:items.slice(),baseFrame:current}
          return publish(items,frame)
        }catch(error){return reject(error)}
      },
      updateComposition(c:{expectedRevision:number;text:string}):ProductCommandResultV1 {
        let candidate:Retained|undefined
        try {check(c.expectedRevision);if(!composition)throw new Error("composition-inactive")
          const {paragraphIndex,start,end,base,baseFrame}=composition,result=editCandidate(base[paragraphIndex],baseFrame.paragraphs[paragraphIndex],{startOffset:start,endOffset:end,replacementText:c.text})
          candidate=result.item;const next=base.slice();next[paragraphIndex]=candidate
          const frame=frameFor(next,revision+1,committedRevision,historyCommits,composition.id,"provisional-core-edit",result.report)
          if(items[paragraphIndex].receipt!==base[paragraphIndex].receipt)retire(items[paragraphIndex])
          return publish(next,frame)
        }catch(error){if(candidate)retire(candidate);return reject(error)}
      },
      commitComposition(c:{expectedRevision:number}):ProductCommandResultV1 {
        try {check(c.expectedRevision);if(!composition)throw new Error("composition-inactive")
          const {paragraphIndex,base,baseFrame}=composition,changed=baseFrame.paragraphs[paragraphIndex].text!==current.paragraphs[paragraphIndex].text
          const frame=frameFor(items,revision+1,committedRevision+(changed?1:0),historyCommits+(changed?1:0),null,"composition-commit-once",null)
          if(items[paragraphIndex].receipt!==base[paragraphIndex].receipt)retire(base[paragraphIndex])
          const {start,end,id}=composition,newText=current.paragraphs[paragraphIndex].text,baseText=baseFrame.paragraphs[paragraphIndex].text
          const delta={paragraphIndex,startOffset:start,endOffset:end,replacementText:newText.slice(start,start+newText.length-baseText.length+end-start)}
          composition=undefined;return publish(items,frame,{kind:"composition",base:baseFrame,compositionId:id,delta})
        }catch(error){return reject(error)}
      },
      cancelComposition(c:{expectedRevision:number}):ProductCommandResultV1 {
        try {check(c.expectedRevision);if(!composition)throw new Error("composition-inactive")
          const {paragraphIndex,base}=composition,frame=frameFor(base,revision+1,committedRevision,historyCommits,null,"composition-cancel-restores-base",null)
          if(items[paragraphIndex].receipt!==base[paragraphIndex].receipt)retire(items[paragraphIndex])
          composition=undefined;return publish(base,frame)
        }catch(error){return reject(error)}
      },
      caret(expectedRevision:number,position:ProductPositionV1){check(expectedRevision);return productCaretV1(current,position)},
      hitTest(expectedRevision:number,point:{pageIndex:number;xPt:number;yPt:number}){check(expectedRevision);return productHitTestV1(current,point)},
      select(expectedRevision:number,selection:{anchor:ProductPositionV1;focus:ProductPositionV1}){check(expectedRevision);return productSelectionV1(current,selection)},
      move(expectedRevision:number,position:ProductPositionV1,direction:"left"|"right"|"up"|"down"|"home"|"end"){check(expectedRevision);return productMoveV1(current,position,direction)},
      dispose(){if(disposed)return;const all=new Map([...items,...composition?.base??[]].map(i=>[i.receipt,i]));all.forEach(retire);disposed=true;composition=undefined;items=[]},
    }
    return Object.freeze(api)
  }})
}
export type FlowDocProductSessionRuntimeV1 = Awaited<ReturnType<typeof createFlowDocProductSessionRuntimeV1>>
export type FlowDocProductSessionV1 = ReturnType<FlowDocProductSessionRuntimeV1["create"]>
