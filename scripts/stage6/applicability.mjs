// Diagnostic applicability only. This consumes no final admission obligations.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { buildColdQaWasm } from '../../tests/coldQaWasmBuild.ts'
import { fixture } from '../../tests/coldStage3Fixtures.ts'
import { commonCatalog, firstEdit, applyEdit } from './corpus.mjs'
import { verifyCommandOutcome } from './verify.mjs'

const output=resolve(process.argv[2] ?? '')
if(!process.argv[2] || existsSync(output))throw Error('Expected new immutable output path')
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim()
if(git('status','--short'))throw Error('Requires clean committed source')
const commit=git('rev-parse','HEAD'),wasm=await buildColdQaWasm()
const shape=e=>e.start===e.end?(e.insertedText===''?'true-no-op':'insert'):(e.insertedText===''?'delete':'replace')
const catalog=commonCatalog('applicability').map(row=>{const generated=firstEdit(row.language,row.size,row.operation);return {...row,edit:generated.edit,shape:shape(generated.edit),composition:'committed',activeComposition:false}})
const calls=[]
const call=(method,input)=>{const request=method==='stage3_dispose'?input:JSON.stringify(input);const response=wasm[method](request);const parsed=JSON.parse(response);calls.push({method,request,response,parsed});return parsed}
const probes=[]
for(const row of catalog){
 const generated=firstEdit(row.language,row.size,row.operation),input=fixture(generated.text)
 const created=call('stage3_create',input)
 if(created.status!=='Created')throw Error(`Cannot construct ${row.caseId}`)
 const applied=call('stage4_apply',{receipt:created.receipt,expectedRevision:0,startOffset:row.edit.start,endOffset:row.edit.end,replacementText:row.edit.insertedText,anchorSpanId:'span-1',composition:'committed'})
 const outcome=verifyCommandOutcome(applied,row.shape,created.receipt,0)
 const accepted=applied.status==='Accepted',noOp=applied.status==='NoOp',receipt=accepted?applied.nextReceipt:created.receipt
 const expected=fixture(accepted?applyEdit(generated.text,row.edit):generated.text)
 const request=JSON.stringify(expected),response=wasm.stage5_verify(receipt,request),parsed=JSON.parse(response)
 calls.push({method:'stage5_verify',receipt,request,response,parsed})
 if(parsed.status!=='Equal')throw Error(`Independent oracle mismatch ${row.caseId}`)
 probes.push({...row,status:applied.status,outcomeKind:outcome.outcomeKind,reason:applied.reason??null,revision:outcome.contentRevision,receiptPreserved:noOp?applied.unchangedReceipt===created.receipt:null,independentOracle:parsed.status,oracleTarget:accepted?'edited-source':'unchanged-source',work:applied.affectedSummary.work})
 call('stage3_dispose',receipt)
}
const ordinary=probes.filter(row=>row.shape!=='true-no-op'),noops=probes.filter(row=>row.shape==='true-no-op')
const summary={ordinary:{total:ordinary.length,accepted:ordinary.filter(r=>r.status==='Accepted').length,rejected:ordinary.filter(r=>r.status!=='Accepted').length,editedSourceEqual:ordinary.filter(r=>r.status==='Accepted'&&r.independentOracle==='Equal').length},noops:{total:noops.length,handled:noops.filter(r=>r.status==='NoOp'&&r.receiptPreserved&&r.revision===0&&r.independentOracle==='Equal').length,outcomes:noops.map(({caseId,status,reason})=>({caseId,status,reason}))},maxWork:Object.fromEntries(['sourceFactsUtf16','propertyFactsUtf16','shapingSegmentationInputUtf16'].map(k=>[k,Math.max(...probes.map(r=>r.work[k]))]))}
const result={summary,schemaVersion:'core-stage6-applicability/1',commit,finalAdmissionRun:false,finalObligationsExecuted:0,catalog,probes,calls,
 conclusions:{
  compositionUpdate:'Exact generator is a committed nonempty replacement. Name does not establish active-composition support.',
  compositionCommit:'Exact generator is a committed true no-op [n,n) + empty. NoOp preserves receipt and live content revision; the generator ordinal remains unchanged.',
  activeComposition:'Current private Stage4 and Stage5 explicitly reject composition-active. No generator relabeling or active-to-committed promotion.',
  cancellation:'QA injected cancellation preserves state and retry; this does not establish a host cancellation contract.',
  missingAnchor:'This initial-request diagnostic does not exercise the separate private short-isolated derived-shard eviction/recovery test.',
  eviction:'This initial-request diagnostic does not exercise private explicit shard or Rustybuzz plan eviction/recovery; focused lifecycle tests cover their bounded behavior and the exact named adversarial row retains a separate uncertified-seam result.',
  continuousStream:'Ordinary edit after structural split and inverse invalidation tested; full continuous ordinary/structural admission remains unmeasured.',
  scope:'This diagnostic reports all fixed initial requests at the bound commit. Accepted ordinary rows require edited-source independent cold equality. Rejected requests verify unchanged source and do not count as ordinary applicability. General unbounded contexts and unsupported property/font routes remain typed rejections.',
},recommendation:summary.ordinary.accepted===75&&summary.noops.handled===15?'Static initial applicability: all 75 ordinary Accepted and all 15 committed true no-ops NoOp. Full 180-row burst, lifecycle and performance remain downstream.':'Static applicability incomplete: resolve listed ordinary or no-op rows before full measurement.'}
result.rawCallsSha256=createHash('sha256').update(JSON.stringify(calls)).digest('hex')
if(git('rev-parse','HEAD')!==commit||git('status','--short'))throw Error('Source drift')
mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(result,null,2),{flag:'wx'})
console.log(JSON.stringify({output,commit,probes:probes.map(({caseId,status,reason,revision})=>({caseId,status,reason,revision}))},null,2))
