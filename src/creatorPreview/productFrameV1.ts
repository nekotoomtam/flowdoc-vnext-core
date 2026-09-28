import { prepareSoftWrappedLinesV1 } from "./layoutFactsV1.js"
import { VNEXT_CREATOR_PREVIEW_LAYOUT_PROFILE_V1 as profile, type VNextCreatorPreviewRawMeasurementProviderV1 } from "./engineV1.js"
import { fingerprintVNextCreatorPreviewV1 } from "./contentV1.js"

export interface ProductPositionV1 { paragraphIndex: number; offsetUtf16: number; affinity: "upstream" | "downstream" }
export interface ProductCaretV1 extends ProductPositionV1 { pageIndex: number; lineIndex: number; xPt: number; yPt: number; heightPt: number }
export interface ProductRectV1 { x: number; y: number; width: number; height: number }
export interface ProductSourceV1 {
  revision: number; paragraph: { paragraphId: string; defaults?: { version: string; digest: string; language?: string; styleKey?: string }; baseDirection: string; writingMode: string }
  text: string; spans: { spanId: string; startOffset: number; endOffset: number; language?: string; styleKey?: string; origin?: unknown }[]
  sourceBinding: string; providerBinding: { providerId: string; providerRevision: string; policyDigest: string; fontDigest: string }
  constraints: { profile: string; fontSizePt: number; lineHeightPt: number; marginPt: number }
  work: { mode: string; sourceCopiedUtf16: number; sourceCopiedBytes: number; sourceCopyCalls: number; treeVisits: number; spanCount: number }
}
export interface ProductFrameV1 {
  authority: "core-product-session/1"; sessionId: string; revision: number; committedRevision: number; historyCommits: number
  compositionId: string | null; fingerprint: string; paragraphs: ProductSourceV1[]
  pages: { index: number; widthPt: number; heightPt: number; paintCommands: ProductPaintV1[] }[]
  lines: { paragraphIndex: number; pageIndex: number; lineIndex: number; startUtf16: number; endUtf16: number; rectPt: ProductRectV1 }[]
  carets: ProductCaretV1[]
  spans: { paragraphIndex: number; startUtf16: number; endUtf16: number; pageIndex: number; lineIndex: number; rectPt: ProductRectV1 }[]
  work: { geometryMode: "full-paragraph-reflow"; sourceCopiedUtf16: number; sourceCopiedBytes: number; shapingCalls: number; shapingInputUtf16: number; segmentationCalls: number; segmentationInputUtf16: number; execution: string; command: unknown }
}
export interface ProductPaintV1 {
  kind: "positioned-glyphs"; authority: "core-product-session/1"; paragraphIndex: number; pageIndex: number; lineIndex: number
  text: string; sourceRange: { startUtf16: number; endUtf16: number }; xPt: number; baselinePt: number; advancePt: number
  fontId: "sarabun-regular"; fontSizePt: 12; color: "000000"; outlineScaleX: number; outlineScaleY: number
  glyphs: { glyphId: number; xPt: number; yPt: number; advancePt: number; clusterUtf16: number }[]
}
export interface ProductSelectionV1 { anchor: ProductCaretV1; focus: ProductCaretV1; rectangles: { pageIndex: number; lineIndex: number; rectPt: ProductRectV1 }[] }
function freeze<T>(value: T): T { if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value) } return value }
export function materializeProductFrameV1(input: {
  sessionId: string; revision: number; committedRevision: number; historyCommits: number; compositionId: string | null
  sources: ProductSourceV1[]; providers: VNextCreatorPreviewRawMeasurementProviderV1[]; execution: string; command: unknown
}): ProductFrameV1 {
  const frame: ProductFrameV1 = { authority: "core-product-session/1", sessionId: input.sessionId, revision: input.revision, committedRevision: input.committedRevision,
    historyCommits: input.historyCommits, compositionId: input.compositionId, fingerprint: "", paragraphs: input.sources, pages: [], lines: [], carets: [], spans: [],
    work: { geometryMode: "full-paragraph-reflow", sourceCopiedUtf16: input.sources.reduce((n,s) => n+s.work.sourceCopiedUtf16,0), sourceCopiedBytes: input.sources.reduce((n,s) => n+s.work.sourceCopiedBytes,0),
      shapingCalls: 0, shapingInputUtf16: 0, segmentationCalls: 0, segmentationInputUtf16: 0, execution: input.execution, command: input.command } }
  let lineIndex=0
  const linesPerPage=Math.floor((profile.pageHeightPt-72)/18)
  input.sources.forEach((source,paragraphIndex) => {
    const provider=input.providers[paragraphIndex]
    const lines=prepareSoftWrappedLinesV1([{text:source.text,inlineIndex:0}], {
      shape(text) { frame.work.shapingCalls++; frame.work.shapingInputUtf16+=text.length; return provider.shape(text) },
      segment(text) { frame.work.segmentationCalls++; frame.work.segmentationInputUtf16+=text.length; return provider.segment(text) },
    },0)
    for (const line of lines) {
      const pageIndex=Math.floor(lineIndex/linesPerPage),y=36+(lineIndex%linesPerPage)*18,baselinePt=y+14.016
      if(!frame.pages[pageIndex])frame.pages.push({index:pageIndex,widthPt:profile.pageWidthPt,heightPt:profile.pageHeightPt,paintCommands:[]})
      const start=line[0]?.start??0,end=line.at(-1)?.end??0
      const command:ProductPaintV1={kind:"positioned-glyphs",authority:"core-product-session/1",paragraphIndex,pageIndex,lineIndex,text:source.text.slice(start,end),sourceRange:{startUtf16:start,endUtf16:end},xPt:36,baselinePt,advancePt:line.reduce((n,c)=>n+c.advancePt,0),fontId:"sarabun-regular",fontSizePt:12,color:"000000",outlineScaleX:.012,outlineScaleY:-.012,glyphs:[]}
      let pen=36
      const stop=(offsetUtf16:number,affinity:ProductPositionV1["affinity"],xPt:number)=>frame.carets.push({paragraphIndex,offsetUtf16,affinity,pageIndex,lineIndex,xPt,yPt:y,heightPt:18})
      if(!line.length){stop(0,"downstream",pen);stop(0,"upstream",pen)}
      for(const cluster of line){
        stop(cluster.start,"downstream",pen)
        const x=pen
        for(const glyph of cluster.glyphs){command.glyphs.push({glyphId:glyph.glyphId,xPt:pen+glyph.xOffset*.012,yPt:baselinePt-glyph.yOffset*.012,advancePt:glyph.xAdvance*.012,clusterUtf16:cluster.start});pen+=glyph.xAdvance*.012}
        stop(cluster.end,"upstream",pen)
        frame.spans.push({paragraphIndex,startUtf16:cluster.start,endUtf16:cluster.end,pageIndex,lineIndex,rectPt:{x,y,width:cluster.advancePt,height:18}})
      }
      // Both affinities exist at paragraph ends; soft-wrap endpoints remain distinct.
      if(start===0 && line.length)stop(0,"upstream",36)
      if(end===source.text.length && line.length)stop(end,"downstream",pen)
      frame.lines.push({paragraphIndex,pageIndex,lineIndex,startUtf16:start,endUtf16:end,rectPt:{x:36,y,width:command.advancePt,height:18}})
      if(line.length)frame.pages[pageIndex].paintCommands.push(command)
      lineIndex++
    }
  })
  const {work: _work,fingerprint: _fingerprint,...identity}=frame
  frame.fingerprint=fingerprintVNextCreatorPreviewV1(identity)
  return freeze(frame)
}
export function productCaretV1(frame:ProductFrameV1,position:ProductPositionV1):ProductCaretV1 {
  const found=frame.carets.find(c=>c.paragraphIndex===position.paragraphIndex && c.offsetUtf16===position.offsetUtf16 && c.affinity===position.affinity)
  if(!found)throw new Error("Unsupported shaping-cluster caret position")
  return found
}
export function productHitTestV1(frame:ProductFrameV1,point:{pageIndex:number;xPt:number;yPt:number}):ProductCaretV1 {
  if(!Number.isFinite(point.xPt)||!Number.isFinite(point.yPt)||!frame.pages[point.pageIndex])throw new Error("Invalid hit point")
  const stops=frame.carets.filter(c=>c.pageIndex===point.pageIndex)
  const distance=(c:ProductCaretV1)=>Math.max(c.yPt-point.yPt,point.yPt-c.yPt-c.heightPt,0)
  const y=Math.min(...stops.map(distance)),line=stops.filter(c=>distance(c)===y)
  return line.reduce((a,b)=>Math.abs(b.xPt-point.xPt)<Math.abs(a.xPt-point.xPt)?b:a)
}
export function productSelectionV1(frame:ProductFrameV1,selection:{anchor:ProductPositionV1;focus:ProductPositionV1}):ProductSelectionV1 {
  const anchor=productCaretV1(frame,selection.anchor),focus=productCaretV1(frame,selection.focus)
  const compare=(a:ProductPositionV1,b:ProductPositionV1)=>a.paragraphIndex-b.paragraphIndex||a.offsetUtf16-b.offsetUtf16
  const [low,high]=compare(anchor,focus)<=0?[anchor,focus]:[focus,anchor]
  const rectangles:ProductSelectionV1["rectangles"]=[]
  for(const span of frame.spans) if(compare({paragraphIndex:span.paragraphIndex,offsetUtf16:span.startUtf16,affinity:"downstream"},low)>=0 && compare({paragraphIndex:span.paragraphIndex,offsetUtf16:span.endUtf16,affinity:"upstream"},high)<=0 && compare(low,high)<0){
    const prior=rectangles.at(-1)
    if(prior?.lineIndex===span.lineIndex)prior.rectPt.width=span.rectPt.x+span.rectPt.width-prior.rectPt.x
    else rectangles.push({pageIndex:span.pageIndex,lineIndex:span.lineIndex,rectPt:{...span.rectPt}})
  }
  return freeze({anchor,focus,rectangles})
}
export function productMoveV1(frame:ProductFrameV1,position:ProductPositionV1,direction:"left"|"right"|"up"|"down"|"home"|"end"):ProductCaretV1 {
  const current=productCaretV1(frame,position)
  if(direction==="home"||direction==="end"){
    const line=frame.carets.filter(c=>c.lineIndex===current.lineIndex)
    return line.reduce((a,b)=>(direction==="home"?b.xPt<a.xPt:b.xPt>a.xPt)?b:a)
  }
  if(direction==="up"||direction==="down"){
    const line=frame.carets.filter(c=>c.lineIndex===current.lineIndex+(direction==="up"?-1:1))
    return line.length?line.reduce((a,b)=>Math.abs(b.xPt-current.xPt)<Math.abs(a.xPt-current.xPt)?b:a):current
  }
  const order=(a:ProductCaretV1,b:ProductCaretV1)=>a.paragraphIndex-b.paragraphIndex||a.offsetUtf16-b.offsetUtf16
  const candidates=frame.carets.filter(c=>direction==="left"?order(c,current)<0:order(c,current)>0).sort(order)
  return (direction==="left"?candidates.at(-1):candidates[0])??current
}
