import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"

export const corpus=JSON.parse(readFileSync(new URL("../../tests/fixtures/stage6/gate2a.v2.json",import.meta.url),"utf8"))
export const policy={
  warmup:5,repetitions:50,coldWarmup:1,coldRepetitions:3,
  preparationP95Ms:8,preparationMaxMs:16.7,preparedP95Ms:8,preparedMaxMs:16.7,
  maxScalingRatio:1.5,maxWindowUtf16:512,maxShapeAndSegmentUtf16:1024,burstRevisions:180,
}
export const pins={
  wasmSha256:"751b5a4eb72c85cad11edf427271a5d5b336a3cf53501308408ff4b6559d98f7",
  oracleWasmSha256:"90bbb751ad3d5613175d689a2b07f95320b856a5e9420118b259d5738b7dabe7",
  fontSha256:"b8150084e25734e6f31696c57ff009f5564efa09d295848b717d9e2328c0311d",
}
export const requiredSourcePaths=[
  "package.json","package-lock.json","tsconfig.json",
  "tests/fixtures/creator-preview/incremental-boundary-gate2a.v2.json",
  "scripts/run-incremental-boundary-gate2a-v2.mjs",
  "scripts/incremental-boundary-gate2a-cold-worker.mjs",
  "scripts/verify-incremental-boundary-gate2a-v2.mjs",
  "src/creatorPreview/incrementalBoundaryLifecycleV2.ts",
  "src/creatorPreview/incrementalBoundarySessionV2.ts",
  "src/creatorPreview/incrementalBoundaryProviderV2.ts",
  "src/creatorPreview/incrementalWindowContractV2.ts",
  "src/creatorPreview/retainedParagraphStoreV2.ts",
  "src/creatorPreview/retainedParagraphFactsV2.ts",
  "packages/text-engine-rust-wasm/src/incrementalWindowRuntimeV2.ts",
  "packages/text-engine-rust-wasm/pkg-incremental-window-v2/flowdoc_incremental_window_v2_bg.wasm",
  "packages/text-engine-rust-wasm/pkg-incremental-window-v2/flowdoc_incremental_window_v2.js",
  "packages/text-engine-rust-wasm/pkg-live-draft-mr1-range/flowdoc_text_engine_mr1_range_bg.wasm",
  "packages/text-engine-rust-wasm/pkg-live-draft-mr1-range/flowdoc_text_engine_mr1_range.js",
  "packages/text-engine-rust-wasm/rust-live-draft-engine/Cargo.lock",
  "assets/fonts/Sarabun/Sarabun-Regular.ttf",
]
export const digest=value=>createHash("sha256").update(typeof value==="string"||Buffer.isBuffer(value)?value:JSON.stringify(value)).digest("hex")
export const zeroCounters=[
  "runtimeInitializations","paragraphSessionCreations","shapePlanBuilds",
  "fullTextMaterializations","fullTextScans","fullTextClones","fullTextFreezes",
  "fullTextSerializations","fullTextHashes","fullShapeCalls","fullSegmentCalls",
]
export const counters=[
  "storeUtf16Read","storeUtf8Read","leavesTouched","indexNodesTouched","offsetIndexEntriesRead","localUtf16Indexed",
  "wasmInputBytes","wasmOutputBytes","shapeUtf16","segmentUtf16","maxWindowUtf16",
  "clustersInserted","clustersRetained","clustersLazilyDisplaced","breaksInserted","breaksRetained","breaksLazilyDisplaced",
  ...zeroCounters,"editMs","windowMs","shapeMs","segmentMs","certificateMs","spliceMs","foregroundMs",
]
export const base=(language,size)=>corpus.languages[language].repeat(Math.ceil(size/corpus.languages[language].length)).slice(0,size-1)+"A"
export const applyEdit=(text,e)=>text.slice(0,e.start)+e.insertedText+text.slice(e.end)
export function commonCatalog(cohort){
  const list=[]
  for(const language of Object.keys(corpus.languages))for(const size of corpus.sizes)for(const operation of corpus.operations)
    list.push({caseId:`${cohort}-${language}-${size}-${operation}`,cohort,language,size,operation})
  return list
}
export function preparationCatalog(){
  const list=[]
  for(const language of Object.keys(corpus.languages))for(const size of corpus.sizes)
    list.push({caseId:`preparation-${language}-${size}`,cohort:"preparation",language,size,operation:"prepare-paragraph"})
  return list
}
export function balancedCatalog(cohort){
  const result=[]
  for(const [languageIndex,language] of Object.keys(corpus.languages).entries()){
    for(const [operationIndex,operation] of corpus.operations.entries()){
      const sizes=(languageIndex+operationIndex)%2?[...corpus.sizes].reverse():corpus.sizes
      for(const size of sizes)result.push({caseId:`${cohort}-${language}-${size}-${operation}`,cohort,language,size,operation})
    }
  }
  return result
}
export function firstEdit(language,size,operation){
  let text=base(language,size),start=text.length,end=start,insertedText="ก"
  switch(operation){
    case "append":break
    case "backspace":start--;insertedText="";break
    case "mid-insert":start=text.lastIndexOf(" ",Math.floor(text.length/2));end=start;break
    case "replacement":start=text.lastIndexOf(" ",Math.floor(text.length/2));end=start+1;break
    case "composition-update":text=text.slice(0,-1)+"ก";start--;insertedText="กำ";break
    case "composition-commit":insertedText="";break
    default:throw new Error("Unknown operation: "+operation)
  }
  return {text,edit:{start,end,insertedText}}
}
export function sustainedEdit(text,operation,sample){
  let start=text.length,end=start,insertedText="ก"
  switch(operation){
    case "append":break
    case "backspace":start--;insertedText="";break
    case "mid-insert":start=text.lastIndexOf(" ",Math.floor(text.length/2));end=start;break
    case "replacement":start=Math.floor(text.length/2);end=start+1;insertedText=text[start]==="A"?"ก":"A";break
    case "composition-update":{
      const expanded=text.endsWith("กำ");start=text.length-(expanded?2:1);end=text.length;insertedText=expanded?"ก":"กำ";break
    }
    case "composition-commit":insertedText="";break
    default:throw new Error("Unknown operation: "+operation)
  }
  return {start,end,insertedText}
}
export function burstEdit(text,revision,state){
  const step=(revision-1)%12;let start=text.length,end=start,insertedText="ก"
  switch(step){
    case 0:break
    case 1:start--;insertedText="";break
    case 2:state.middle=text.lastIndexOf(" ",Math.floor(text.length/2));start=state.middle;end=start;break
    case 3:start=state.middle;end=start+1;insertedText="";break
    case 4:state.saved=text.slice(-1);start--;insertedText="B";break
    case 5:start--;insertedText=state.saved;break
    case 6:state.middle=text.lastIndexOf(" ",Math.floor(text.length/3));start=state.middle;end=start;insertedText="A";break
    case 7:start=state.middle;end=start+1;insertedText="";break
    case 8:break
    case 9:start--;insertedText="กำ";break
    case 10:insertedText="";break
    case 11:start-=2;insertedText="";break
  }
  return {start,end,insertedText}
}
