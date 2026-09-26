// Diagnostic applicability only. This consumes no final admission obligations.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { buildColdQaWasm } from '../../tests/coldQaWasmBuild.ts'
import { fixture } from '../../tests/coldStage3Fixtures.ts'
import { commonCatalog, firstEdit, applyEdit } from './corpus.mjs'

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
for(const row of catalog.filter(row=>row.size===256)){
 const generated=firstEdit(row.language,row.size,row.operation),input=fixture(generated.text)
 const created=call('stage3_create',input)
 if(created.status!=='Created')throw Error(`Cannot construct ${row.caseId}`)
 const applied=call('stage4_apply',{receipt:created.receipt,expectedRevision:0,startOffset:row.edit.start,endOffset:row.edit.end,replacementText:row.edit.insertedText,anchorSpanId:'span-1',composition:'committed'})
 const accepted=applied.status==='Accepted',receipt=accepted?applied.nextReceipt:created.receipt
 const expected=fixture(accepted?applyEdit(generated.text,row.edit):generated.text)
 const request=JSON.stringify(expected),response=wasm.stage5_verify(receipt,request),parsed=JSON.parse(response)
 calls.push({method:'stage5_verify',receipt,request,response,parsed})
 if(parsed.status!=='Equal')throw Error(`Independent oracle mismatch ${row.caseId}`)
 probes.push({...row,status:applied.status,reason:applied.reason??null,revision:applied.nextRevision??applied.unchangedRevision,independentOracle:parsed.status,work:applied.affectedSummary.work})
 call('stage3_dispose',receipt)
}
const result={schemaVersion:'core-stage6-applicability/1',commit,finalAdmissionRun:false,finalObligationsExecuted:0,catalog,probes,calls,
 conclusions:{
  compositionUpdate:'Exact generator is a committed nonempty replacement. Name does not establish active-composition support.',
  compositionCommit:'Exact generator is a true no-op [n,n) + empty. Current private API returns unsupported-command-shape revision0; no-op receipt/revision semantics need a separate compatibility decision.',
  activeComposition:'Current private Stage4 and Stage5 explicitly reject composition-active. No generator relabeling or active-to-committed promotion.',
  cancellation:'QA injected cancellation preserves state and retry; this does not establish a host cancellation contract.',
  missingAnchor:'Typed missing-anchor is tested unchanged rejection, not implemented recovery.',
  eviction:'No private eviction/cache recovery API. Disposal invalidates a receipt; it is not a defined eviction substitute.',
  continuousStream:'Ordinary edit after structural split and inverse invalidation tested; full continuous ordinary/structural admission remains unmeasured.',
  scope:'Tail transition requires complete old run <=32 UTF16 and inserted opposite alphabet <=8, actual opposite outer neighbor or paragraph start, pure ASCII letters / Thai consonants U+0E01..U+0E2E. Interior transitions, marks/neutral attachment, same-script style context and larger windows remain rejected.',
 },recommendation:'Keep fixed corpus. Separate decision for true no-op receipt/revision and lifecycle mapping; further bounded certificate work for unsupported required ordinary rows before unchanged full measurement.'}
result.rawCallsSha256=createHash('sha256').update(JSON.stringify(calls)).digest('hex')
if(git('rev-parse','HEAD')!==commit||git('status','--short'))throw Error('Source drift')
mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(result,null,2),{flag:'wx'})
console.log(JSON.stringify({output,commit,probes:probes.map(({caseId,status,reason,revision})=>({caseId,status,reason,revision}))},null,2))
