/** Private host scheduling around the existing synchronous cold-session WASM calls. */
import {createColdSessionQaAdapter,type ColdCommand,type ColdReceipt,type HostControlRequest}
  from "./coldSessionStage3.js"

type Adapter=ReturnType<typeof createColdSessionQaAdapter>
type CallResult=ReturnType<Adapter["apply"]>|ReturnType<Adapter["enter"]>|ReturnType<Adapter["maintain"]>
type Timing={serializationMs:number;rustAbiMs:number}
export interface HostCosts {
  // coldMs is one create elapsed window within endToEndMs. Later control
  // delivered after completion is a separate delta outside that window.
  coldMs:number;queueMs:number;controlMs:number;serializationMs:number;
  rustAbiMs:number;otherMs:number;endToEndMs:number;lateControlMs:number;calls:number
}
export interface HostCompletion<T extends CallResult=CallResult> {
  readonly operationId:string;readonly result:T;readonly delivery:"none"|"pre-entry"|"too-late";
  readonly requestedAt:number|null;readonly enteredAt:number;readonly completedAt:number;
  readonly deliveredAt:number;readonly costs:Readonly<HostCosts>;
  readonly familyCosts:Readonly<HostCosts>|null;readonly accountingOverflow:boolean;
  readonly unaccumulatedCosts:Readonly<HostCosts>|null
}
const empty=():HostCosts=>({coldMs:0,queueMs:0,controlMs:0,serializationMs:0,
  rustAbiMs:0,otherMs:0,endToEndMs:0,lateControlMs:0,calls:0})
const frozen=(v:HostCosts)=>Object.freeze({...v})
function boundedSum(target:HostCosts,delta:HostCosts):boolean {
  const next=empty()
  for(const key of Object.keys(next) as (keyof HostCosts)[]){
    const value=target[key]+delta[key]
    if(!Number.isFinite(value)||value<0||value>Number.MAX_SAFE_INTEGER||
      key==="calls"&&!Number.isSafeInteger(value))return false
    next[key]=value
  }
  Object.assign(target,next)
  return true
}
/** Internal fixed-counter arithmetic exposed only by this private module for focused proof. */
export function checkedHostCostSum(prior:HostCosts,delta:HostCosts){
  const next={...prior}
  return boundedSum(next,delta)?{accountingOverflow:false,value:frozen(next),unaccumulatedCosts:null}:
    {accountingOverflow:true,value:frozen(prior),unaccumulatedCosts:frozen(delta)}
}
function timed(result:unknown):Timing {
  const value=(result as {hostTiming?:Timing}).hostTiming
  return value??{serializationMs:0,rustAbiMs:0}
}

export function createColdSessionHostControl(adapter:Adapter){
  // Each live family shares one fixed-size counter. Retired handles may stay
  // in this WeakMap, but an unresolved result is always unattributed.
  const families=new WeakMap<ColdReceipt,HostCosts>()
  const unattributed=empty()
  const pending=new Map<string,{cancel:()=>void}>()
  let tail=Promise.resolve()
  function account(receipt:ColdReceipt|undefined,result:{status:string},costs:HostCosts){
    const family=result.status==="UnknownReceipt"||result.status==="Unavailable"?
      undefined:receipt?families.get(receipt):undefined
    const target=family??unattributed
    const overflow=!boundedSum(target,costs)
    return {familyCosts:family?frozen(family):null,accountingOverflow:overflow,
      unaccumulatedCosts:overflow?frozen(costs):null}
  }
  function enqueue<T extends CallResult>(receipt:ColdReceipt,signal:AbortSignal|undefined,
    invoke:(control:HostControlRequest)=>T,successors:(result:T)=>readonly ColdReceipt[]=()=>[]){
    // Null both callbacks after execution so a completed signal listener
    // cannot retain a command, replacement text, or provider input.
    const callState:{invoke:((control:HostControlRequest)=>T)|null;
      successors:((result:T)=>readonly ColdReceipt[])|null}={invoke,successors}
    const startedAt=performance.now()
    const setupStart=performance.now()
    const operationId=crypto.randomUUID()
    let requestedAt:number|null=signal?.aborted?performance.now():null
    let completedAt:number|null=null
    let controlMs=0
    let current:HostCompletion<T>|null=null
    let localCosts:HostCosts|null=null
    let targetCosts:HostCosts|null=null
    let overflow=false
    let unaccumulated:HostCosts|null=null
    let lateControlMs=0
    let listenerAttached=false
    const chargeLate=(duration:number)=>{
      lateControlMs+=duration
      if(!localCosts)return
      const delta={...empty(),lateControlMs:duration}
      if(!boundedSum(localCosts,delta)||targetCosts&&!boundedSum(targetCosts,delta)){
        overflow=true;unaccumulated=delta
      }
    }
    const request=()=>{
      const started=performance.now()
      if(requestedAt===null)requestedAt=performance.now()
      if(listenerAttached){signal?.removeEventListener("abort",request);listenerAttached=false}
      if(completedAt!==null)chargeLate(performance.now()-started)
    }
    if(signal&&!signal.aborted){signal.addEventListener("abort",request,{once:true});listenerAttached=true}
    pending.set(operationId,{cancel:request})
    controlMs+=performance.now()-setupStart
    const queuedAt=performance.now()
    const run=async():Promise<HostCompletion<T>>=>{
      await new Promise<void>(resolve=>setTimeout(resolve,0))
      const enteredAt=performance.now()
      const snapshotStart=performance.now()
      const control=Object.freeze({operationId,cancelled:requestedAt!==null})
      controlMs+=performance.now()-snapshotStart
      let result:T
      try { result=callState.invoke!(control) }
      catch(error){
        callState.invoke=null;callState.successors=null
        const cleanupStart=performance.now();pending.delete(operationId)
        if(listenerAttached){signal?.removeEventListener("abort",request);listenerAttached=false}
        controlMs+=performance.now()-cleanupStart
        throw error
      }
      callState.invoke=null
      completedAt=performance.now()
      const cleanupStart=performance.now()
      pending.delete(operationId)
      let nextHandles:readonly ColdReceipt[]
      try {nextHandles=callState.successors!(result)}
      catch(error){
        callState.successors=null;pending.delete(operationId)
        if(listenerAttached){signal?.removeEventListener("abort",request);listenerAttached=false}
        throw error
      }
      callState.successors=null
      for(const next of nextHandles){
        const family=families.get(receipt)
        if(family)families.set(next,family)
      }
      controlMs+=performance.now()-cleanupStart
      // A callback scheduled inside synchronous WASM runs only after return.
      await new Promise<void>(resolve=>setTimeout(resolve,0))
      const deliveredAt=performance.now()
      const timing=timed(result)
      const queueMs=enteredAt-queuedAt
      const endToEndMs=deliveredAt-startedAt
      const otherMs=Math.max(0,endToEndMs-queueMs-controlMs-timing.serializationMs-timing.rustAbiMs-lateControlMs)
      const costs:HostCosts={coldMs:0,queueMs,controlMs,serializationMs:timing.serializationMs,
        rustAbiMs:timing.rustAbiMs,otherMs,endToEndMs,lateControlMs,calls:1}
      const accounting=account(receipt,result,costs)
      localCosts={...costs}
      targetCosts=result.status==="UnknownReceipt"||result.status==="Unavailable"?
        unattributed:families.get(receipt)??unattributed
      overflow=accounting.accountingOverflow
      unaccumulated=accounting.unaccumulatedCosts?{...accounting.unaccumulatedCosts}:null
      current={operationId,result,
        get delivery(){return requestedAt===null?"none":requestedAt<=enteredAt?"pre-entry":"too-late"},
        get requestedAt(){return requestedAt},enteredAt,completedAt,deliveredAt,
        get costs(){return frozen(localCosts!)},
        get familyCosts(){return targetCosts===unattributed?null:frozen(targetCosts!)},
        get accountingOverflow(){return overflow},
        get unaccumulatedCosts(){return unaccumulated?frozen(unaccumulated):null}}
      return current
    }
    const completion=tail.then(run)
    tail=completion.then(()=>undefined,()=>undefined)
    return Object.freeze({operationId,completion,
      cancel(){request();return completedAt===null?"queued" as const:"too-late" as const},
      latest(){return current},
      release(){const started=performance.now();if(listenerAttached){signal?.removeEventListener("abort",request);listenerAttached=false}
        if(completedAt!==null)chargeLate(performance.now()-started)}
    })
  }
  return Object.freeze({
    create(providerContext:unknown,paragraphContext:unknown,authoredSpans:unknown){
      const startedAt=performance.now()
      const result=adapter.create(providerContext,paragraphContext,authoredSpans)
      const endToEndMs=performance.now()-startedAt
      const timing=timed(result)
      const costs:HostCosts={...empty(),coldMs:endToEndMs,endToEndMs,
        serializationMs:timing.serializationMs,rustAbiMs:timing.rustAbiMs,
        otherMs:Math.max(0,endToEndMs-timing.serializationMs-timing.rustAbiMs),calls:1}
      let accountingOverflow:boolean
      if(result.status==="Created"){
        const family=empty();accountingOverflow=!boundedSum(family,costs);families.set(result.receipt,family)
      }else accountingOverflow=!boundedSum(unattributed,costs)
      return {...result,hostAccounting:{accountingOverflow,
        unaccumulatedCosts:accountingOverflow?frozen(costs):null}}
    },
    apply(receipt:ColdReceipt,command:ColdCommand,signal?:AbortSignal){
      return enqueue(receipt,signal,c=>adapter.apply(receipt,command,c),r=>r.status==="Accepted"?[r.nextReceipt]:[])
    },
    enter(receipt:ColdReceipt,revision:number,caret:number,signal?:AbortSignal){
      return enqueue(receipt,signal,c=>adapter.enter(receipt,revision,caret,"committed",c),
        r=>r.status==="Accepted"?r.receipts:[])
    },
    join(left:ColdReceipt,right:ColdReceipt,leftRevision:number,rightRevision:number,signal?:AbortSignal){
      return enqueue(left,signal,c=>adapter.join(left,right,leftRevision,rightRevision,"committed",c),
        r=>r.status==="Accepted"?r.receipts:[])
    },
    maintain(receipt:ColdReceipt,revision:number,operation:"evict"|"recover",runIndex:number,
      target:"plan"|"shard",signal?:AbortSignal){
      return enqueue(receipt,signal,c=>adapter.maintain(receipt,revision,operation,runIndex,target,c))
    },
    dispose(receipt:ColdReceipt){
      const startedAt=performance.now();const result=adapter.dispose(receipt)
      const endToEndMs=performance.now()-startedAt,timing=timed(result)
      const costs:HostCosts={...empty(),endToEndMs,serializationMs:timing.serializationMs,
        rustAbiMs:timing.rustAbiMs,otherMs:Math.max(0,endToEndMs-timing.serializationMs-timing.rustAbiMs),calls:1}
      return {result,costs:frozen(costs),...account(receipt,result,costs)}
    },
    cancel(operationId:string){const call=pending.get(operationId);if(!call)return false;call.cancel();return true},
    unattributedCosts(){return frozen(unattributed)}
  })
}
