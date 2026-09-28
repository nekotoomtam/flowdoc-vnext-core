use super::{runtime::{Runtime, Session}, policy, ledger::Work, tree::TreeWork, SESSIONS};
use serde::Deserialize;
use serde_json::{json, Value};
use icu_segmenter::{GraphemeClusterSegmenter, LineSegmenter};
use unicode_script::{Script, UnicodeScript};
use wasm_bindgen::prelude::wasm_bindgen;

const LIMIT: usize = 8192;
#[derive(Deserialize)]
#[serde(rename_all="camelCase", deny_unknown_fields)]
struct Authored { span_id: String, text: String, #[serde(default)] language: Option<String>, #[serde(default)] style_key: Option<String> }
#[derive(Deserialize)]
#[serde(rename_all="camelCase", deny_unknown_fields)]
struct Create { paragraph_id: String, authored_spans: Vec<Authored>, font_bytes: Vec<u8> }
fn reply(result: Result<Value, &'static str>) -> String { match result { Ok(v)=>v, Err(e)=>json!({"status":"Blocked","reason":e}) }.to_string() }
fn token() -> Result<String,&'static str> { let mut b=[0u8;32]; getrandom::getrandom(&mut b).map_err(|_|"entropy-unavailable")?; Ok(policy::hash(&b)) }
fn fixed_input(c: Create) -> Result<Value,&'static str> {
    let mut offset=0;
    let mut spans=Vec::new();
    for a in c.authored_spans {
        if a.language.as_deref().is_some_and(|l|l!="und") || a.style_key.as_deref().is_some_and(|s|s!="body") {return Err("unsupported-style");}
        let start=offset; offset+=a.text.encode_utf16().count();
        if offset>LIMIT {return Err("trial-source-limit");}
        if !a.text.is_empty() {spans.push(json!({"spanId":a.span_id,"text":a.text,"startOffset":start,"endOffset":offset,"language":"und","styleKey":"body"}));}
    }
    let p=json!({"schemaVersion":1,"unicodeVersion":"17.0.0","scriptRevision":"unicode-script-0.5.8","bidiRevision":"thai-latin-ltr-only-v1","graphemeRevision":"icu_segmenter-2.2.0","lineRevision":"icu_segmenter-2.2.0","shapingRevision":"rustybuzz-0.20.1","runBoundaryPolicy":"common-inherited-previous-else-next-v1","languageRules":[{"authoredLanguage":"und","script":"Latin","language":"en"},{"authoredLanguage":"und","script":"Thai","language":"th"}],
      "fontRouteRules":[{"styleKey":"body","language":"en","script":"Latin","direction":"ltr","writingMode":"horizontal-tb","fontId":"Sarabun-Regular","resources":["sarabun-regular"],"coverage":"all-scalars-or-reject"},{"styleKey":"body","language":"th","script":"Thai","direction":"ltr","writingMode":"horizontal-tb","fontId":"Sarabun-Thai","resources":["sarabun-regular"],"coverage":"all-scalars-or-reject"}],
      "featureRules":[{"styleKey":"body","language":"en","script":"Latin","direction":"ltr","writingMode":"horizontal-tb","features":["kern","liga"]},{"styleKey":"body","language":"th","script":"Thai","direction":"ltr","writingMode":"horizontal-tb","features":["kern","liga"]}]});
    let defaults=json!({"version":"product-session/1","language":"und","styleKey":"body"});
    let digest=|v:&Value| policy::hash(&policy::canonical(v,&mut Work::default()));
    Ok(json!({"providerContext":{"providerId":"rust-stage3-thai-latin","providerRevision":"v1","policyDigest":digest(&p),"policy":p,"fonts":[{"resourceId":"sarabun-regular","digest":policy::hash(&c.font_bytes),"bytes":c.font_bytes}]},"paragraphContext":{"paragraphId":c.paragraph_id,"baseDirection":"ltr","writingMode":"horizontal-tb","defaults":{"version":"product-session/1","language":"und","styleKey":"body","digest":digest(&defaults)}},"authoredSpans":spans}))
}
fn parse(raw:String)->Value {serde_json::from_str(&raw).expect("internal response")}
fn create(rt:&mut Runtime, raw:&str)->Result<Value,&'static str> {
    let c:Create=serde_json::from_str(raw).map_err(|_|"invalid-input")?;
    let input=fixed_input(c)?;
    Ok(parse(rt.create(&input.to_string())))
}
#[wasm_bindgen]
pub fn product_session_create(raw:&str)->String {SESSIONS.with(|r|reply(create(&mut r.borrow_mut(),raw)))}
fn session<'a>(rt:&'a Runtime, receipt:&str, revision:u64)->Result<&'a Session,&'static str> {
    let s=rt.sessions.get(receipt).ok_or("unknown-receipt")?;
    if s.revision!=revision {return Err("stale-revision");} Ok(s)
}
fn project(rt:&Runtime, receipt:&str, revision:u64)->Result<Value,&'static str> {
    let s=session(rt,receipt,revision)?; let mut w=TreeWork::default();
    let text=s.source.materialize_product(&mut w); let mut spans=Vec::new();
    for i in 0..s.spans.len {spans.push(s.spans.at(i,&mut w).unwrap().materialize(&mut w));}
    Ok(json!({"status":"Ready","revision":revision,"paragraph":s.paragraph,"text":text,"spans":spans,"sourceBinding":s.source_binding,"providerBinding":{"providerId":s.provider.provider_id,"providerRevision":s.provider.provider_revision,"policyDigest":s.provider.policy_digest,"fontDigest":s.provider.fonts[0].digest},"constraints":{"profile":"creator-text-preview/1","fontSizePt":12,"lineHeightPt":18,"marginPt":36},"work":{"mode":"full-source-materialization","sourceCopiedUtf16":w.source_copied_utf16,"sourceCopiedBytes":w.source_copy_bytes,"sourceCopyCalls":w.source_copy_calls,"treeVisits":w.visits,"spanCount":spans.len()}}))
}
#[wasm_bindgen]
pub fn product_session_project(receipt:&str, revision:u64)->String {SESSIONS.with(|r|reply(project(&r.borrow(),receipt,revision)))}
#[wasm_bindgen]
pub fn product_session_branch(receipt:&str, revision:u64)->String {SESSIONS.with(|r|reply((|| {
    let mut rt=r.borrow_mut(); let mut s=session(&rt,receipt,revision)?.clone(); s.sibling=None;
    // A provisional branch shares persistent source/trees, not the committed lifecycle ledger.
    let life=s.lifecycle.borrow().clone(); s.lifecycle=std::rc::Rc::new(std::cell::RefCell::new(life));
    let next=token()?; rt.sessions.insert(next.clone(),s); Ok(json!({"status":"Created","receipt":next,"revision":revision}))
})()))}
#[wasm_bindgen]
pub fn product_session_dispose(receipt:&str)->String {
    INVERSES.with(|pairs|pairs.borrow_mut().retain(|(left,right),_|left!=receipt&&right!=receipt));
    SESSIONS.with(|r|{let mut result=parse(super::structural::dispose(&mut r.borrow_mut(),receipt));result["retainedInversePairs"]=json!(INVERSES.with(|p|p.borrow().len()));result.to_string()})
}

#[derive(Deserialize)]
#[serde(rename_all="camelCase", deny_unknown_fields)]
struct Edit {receipt:String,expected_revision:u64,start_offset:usize,end_offset:usize,replacement_text:String,anchor_span_id:String}
fn utf16_byte(text:&str,at:usize)->Option<usize> {let mut n=0;for (b,c) in text.char_indices(){if n==at{return Some(b);} n+=c.len_utf16();} (n==at).then_some(text.len())}
fn boundary(text:&str,at:usize)->bool {utf16_byte(text,at).is_some_and(|b|GraphemeClusterSegmenter::new().segment_str(text).any(|p|p==b))}
fn fallback(rt:&mut Runtime,c:&Edit,reason:&str)->Result<Value,&'static str> {
    let old=session(rt,&c.receipt,c.expected_revision)?.clone(); let mut w=TreeWork::default(); let source=old.source.materialize_product(&mut w);
    if c.start_offset>c.end_offset || !boundary(&source,c.start_offset) || !boundary(&source,c.end_offset) {return Err("invalid-grapheme-range");}
    let a=utf16_byte(&source,c.start_offset).unwrap(); let b=utf16_byte(&source,c.end_offset).unwrap();
    let text=format!("{}{}{}",&source[..a],c.replacement_text,&source[b..]);
    if text.encode_utf16().count()>LIMIT {return Err("trial-source-limit");}
    let mut spans=Vec::new(); for i in 0..old.spans.len {spans.push(old.spans.at(i,&mut w).unwrap().materialize(&mut w));}
    let owner=if spans.is_empty(){None}else{Some(spans.iter().position(|s|s.span_id==c.anchor_span_id && s.start_offset<=c.start_offset && s.end_offset>=c.start_offset).ok_or("ambiguous-anchor")?)};
    let mut authored=Vec::new(); let mut offset=0;
    if spans.is_empty() && !c.replacement_text.is_empty() {authored.push(json!({"spanId":format!("{}-text",old.paragraph.paragraph_id),"startOffset":0,"endOffset":text.encode_utf16().count(),"text":text,"language":"und","styleKey":"body"}));}
    for (i,s) in spans.iter().enumerate() {
        let start=s.start_offset; let end=s.end_offset;
        let before_end=c.start_offset.min(end).max(start); let after_start=c.end_offset.max(start).min(end);
        let before=&source[utf16_byte(&source,start).unwrap()..utf16_byte(&source,before_end).unwrap()];
        let after=&source[utf16_byte(&source,after_start).unwrap()..utf16_byte(&source,end).unwrap()];
        // Non-overlapping spans must appear once, not twice.
        let part=if end<=c.start_offset && owner!=Some(i) {source[utf16_byte(&source,start).unwrap()..utf16_byte(&source,end).unwrap()].to_owned()}
          else if start>=c.end_offset && owner!=Some(i) {source[utf16_byte(&source,start).unwrap()..utf16_byte(&source,end).unwrap()].to_owned()}
          else {format!("{}{}{}",before,if owner==Some(i){&c.replacement_text}else{""},after)};
        if !part.is_empty(){let n=part.encode_utf16().count();authored.push(json!({"spanId":s.span_id,"startOffset":offset,"endOffset":offset+n,"text":part,"language":s.language,"styleKey":s.style_key}));offset+=n;}
    }
    let input=json!({"providerContext":old.provider.as_ref(),"paragraphContext":old.paragraph,"authoredSpans":authored});
    let result=parse(rt.create(&input.to_string()));
    if result["status"]!="Created" {return Ok(result);}
    let next=result["receipt"].as_str().unwrap().to_owned();
    let next_revision=old.revision.checked_add(1).ok_or("revision-overflow")?;
    rt.sessions.get_mut(&next).unwrap().revision=next_revision;
    rt.sessions.remove(&c.receipt);
    Ok(json!({"status":"Accepted","nextReceipt":next,"nextRevision":next_revision,"execution":"full-context-required","fallbackReason":reason,"fallbackWork":{"sourceCopiedUtf16":w.source_copied_utf16,"sourceCopiedBytes":w.source_copy_bytes,"coldRebuild":result["coldSummary"]}}))
}
fn apply(rt:&mut Runtime,raw:&str)->Result<Value,&'static str>{
    let c:Edit=serde_json::from_str(raw).map_err(|_|"invalid-command")?;
    let s=session(rt,&c.receipt,c.expected_revision)?;
    if c.start_offset>c.end_offset || c.end_offset>s.source.utf16() {return Err("invalid-range");}
    if s.source.utf16()-c.end_offset+c.start_offset+c.replacement_text.encode_utf16().count()>LIMIT {return Err("trial-source-limit");}
    let command=json!({"receipt":c.receipt,"expectedRevision":c.expected_revision,"startOffset":c.start_offset,"endOffset":c.end_offset,"replacementText":c.replacement_text,"anchorSpanId":c.anchor_span_id,"composition":"committed"});
    let mut result=parse(rt.apply(&command.to_string()));
    if result["status"]=="Accepted" || result["status"]=="NoOp" {result["execution"]=json!("retained-command");return Ok(result);}
    let reason=result["reason"].as_str().unwrap_or("unknown-rejection");
    if matches!(reason,"uncertified-seam"|"uncertified-boundary"|"unsupported-command-shape"|"budget-exhaustion"|"missing-anchor") {
        let mut next=fallback(rt,&c,reason)?;next["retainedAttemptWork"]=result["affectedSummary"].clone();Ok(next)
    } else {Ok(result)}
}
#[wasm_bindgen]
pub fn product_session_apply(raw:&str)->String {SESSIONS.with(|r|reply((|| {
    let result=apply(&mut r.borrow_mut(),raw)?;
    if result["status"]=="Accepted" {retire_inverse_input(raw);}
    Ok(result)
})()))}
fn retire_inverse_input(raw:&str){if let Ok(command)=serde_json::from_str::<Value>(raw){if let Some(receipt)=command["receipt"].as_str(){INVERSES.with(|pairs|pairs.borrow_mut().retain(|(left,right),_|left!=receipt&&right!=receipt));}}}
#[wasm_bindgen]
pub fn product_session_enter(raw:&str)->String {SESSIONS.with(|r|reply((|| {
    let result=enter(&mut r.borrow_mut(),raw)?;
    if result["status"]=="Accepted" {retire_inverse_input(raw);}
    Ok(result)
})()))}
thread_local! {static INVERSES:std::cell::RefCell<std::collections::BTreeMap<(String,String),Session>>=Default::default();}
fn enter(rt:&mut Runtime,raw:&str)->Result<Value,&'static str>{
    let request:Value=serde_json::from_str(raw).map_err(|_|"invalid-command")?;
    let receipt=request["receipt"].as_str().ok_or("invalid-command")?;
    let revision=request["expectedRevision"].as_u64().ok_or("invalid-command")?;
    let caret=request["caretOffset"].as_u64().ok_or("invalid-command")? as usize;
    let result=parse(super::structural::apply(rt,raw));
    if result["status"]=="Accepted" {return Ok(result);}
    if !matches!(result["reason"].as_str(),Some("uncertified-seam"|"uncertified-boundary"|"budget-exhaustion")){return Ok(result);}
    let mut parent=session(rt,receipt,revision)?.clone();parent.sibling=None;
    let mut work=TreeWork::default();let text=parent.source.materialize_product(&mut work);
    if !boundary(&text,caret){return Err("invalid-grapheme-range");}
    let mut spans=Vec::new();for i in 0..parent.spans.len{spans.push(parent.spans.at(i,&mut work).unwrap().materialize(&mut work));}
    let mut children=Vec::new();let mut charges=Vec::new();
    for (start,end) in [(0,caret),(caret,parent.source.utf16())] {
        let mut paragraph=parent.paragraph.clone();paragraph.paragraph_id=token()?;
        let mut authored=Vec::new();
        for s in &spans {let a=s.start_offset.max(start);let b=s.end_offset.min(end);if a<b{authored.push(json!({"spanId":s.span_id,"startOffset":a-start,"endOffset":b-start,"text":&text[utf16_byte(&text,a).unwrap()..utf16_byte(&text,b).unwrap()],"language":s.language,"styleKey":s.style_key}));}}
        let child=parse(rt.create(&json!({"providerContext":parent.provider.as_ref(),"paragraphContext":paragraph,"authoredSpans":authored}).to_string()));
        if child["status"]!="Created" {for key in children{rt.sessions.remove(&key);}return Ok(child);}
        children.push(child["receipt"].as_str().unwrap().to_owned());charges.push(child["coldSummary"].clone());
    }
    INVERSES.with(|pairs|pairs.borrow_mut().insert((children[0].clone(),children[1].clone()),parent));
    rt.sessions.remove(receipt);
    Ok(json!({"status":"Accepted","receipts":children,"revision":0,"execution":"full-context-required","affectedSummary":{"fallbackReason":result["reason"],"retainedAttempt":result["affectedSummary"],"sourceCopiedUtf16":work.source_copied_utf16,"sourceCopiedBytes":work.source_copy_bytes,"coldRebuilds":charges}}))
}
#[wasm_bindgen]
pub fn product_session_inverse_join(raw:&str)->String {SESSIONS.with(|r|reply((|| {
    let command:Value=serde_json::from_str(raw).map_err(|_|"invalid-command")?;
    let left=command["receipt"].as_str().ok_or("invalid-command")?;
    let right=command["rightReceipt"].as_str().ok_or("invalid-command")?;
    let mut rt=r.borrow_mut();
    let inverse=INVERSES.with(|pairs|pairs.borrow().get(&(left.to_owned(),right.to_owned())).cloned());
    if let Some(mut parent)=inverse {
        let left_revision=command["expectedRevision"].as_u64().ok_or("invalid-command")?;
        let right_revision=command["rightRevision"].as_u64().ok_or("invalid-command")?;
        session(&rt,left,left_revision)?;session(&rt,right,right_revision)?;
        if left_revision!=0||right_revision!=0||command["composition"]!="committed" {return Err("not-unchanged-siblings");}
        let next=token()?;parent.revision=0;parent.sibling=None;rt.sessions.insert(next.clone(),parent);
        return Ok(json!({"status":"Accepted","receipts":[next],"revision":0,"execution":"restore-unchanged-parent","affectedSummary":{"sourceCopiedUtf16":0,"sharedOriginalParent":true}}));
    }
    let mut trial=Runtime::default();
    for key in [left,right] {let mut s=rt.sessions.get(key).ok_or("unknown-receipt")?.clone();let life=s.lifecycle.borrow().clone();s.lifecycle=std::rc::Rc::new(std::cell::RefCell::new(life));trial.sessions.insert(key.to_owned(),s);}
    let result=parse(super::structural::apply(&mut trial,raw));
    if result["status"]=="Accepted" {for receipt in result["receipts"].as_array().unwrap(){let key=receipt.as_str().unwrap();rt.sessions.insert(key.to_owned(),trial.sessions.remove(key).unwrap());}}
    Ok(result)
})()))}

fn shape(rt:&Runtime,receipt:&str,revision:u64,text:&str)->Result<Value,&'static str>{
    let s=session(rt,receipt,revision)?; if text.encode_utf16().count()>LIMIT{return Err("trial-source-limit");}
    let font=&s.provider.fonts[0].bytes; let face=rustybuzz::Face::from_slice(font,0).ok_or("font-invalid")?;
    let mut runs=Vec::new();let mut start=0;let mut script=Script::Common;
    for (b,c) in text.char_indices(){let next=c.script();if matches!(next,Script::Thai|Script::Latin){if script!=Script::Common && script!=next {runs.push((start,b));start=b;}script=next;}else if !matches!(next,Script::Common|Script::Inherited){return Err("unsupported-font-script");}}
    if start<text.len(){runs.push((start,text.len()));}
    let mut glyphs=Vec::new();
    for (a,b) in runs {let part=&text[a..b];let mut buffer=rustybuzz::UnicodeBuffer::new();buffer.push_str(part);let shaped=rustybuzz::shape(&face,&[],buffer);
      for (g,p) in shaped.glyph_infos().iter().zip(shaped.glyph_positions()) {if g.glyph_id==0{return Err("unsupported-font-script");}let cluster=text[..a+g.cluster as usize].encode_utf16().count();glyphs.push(json!({"glyphId":g.glyph_id,"clusterUtf16":cluster,"xAdvance":p.x_advance,"yAdvance":p.y_advance,"xOffset":p.x_offset,"yOffset":p.y_offset}));}
    }
    Ok(json!({"text":text,"unitsPerEm":face.units_per_em(),"ascentFontUnit":face.ascender(),"descentFontUnit":face.descender(),"glyphs":glyphs}))
}
#[wasm_bindgen]
pub fn product_session_shape(receipt:&str,revision:u64,text:&str)->String {SESSIONS.with(|r|reply(shape(&r.borrow(),receipt,revision,text)))}
#[wasm_bindgen]
pub fn product_session_segment(receipt:&str,revision:u64,text:&str)->String {SESSIONS.with(|r|reply((|| {session(&r.borrow(),receipt,revision)?;if text.encode_utf16().count()>LIMIT{return Err("trial-source-limit");}let breaks=LineSegmenter::new_auto(Default::default()).segment_str(text).map(|b|text[..b].encode_utf16().count()).collect::<Vec<_>>();Ok(json!(breaks))})()))}

#[cfg(test)]
mod product_tests {
    use super::*;
    fn made(rt:&mut Runtime,text:&str)->Value {create(rt,&json!({"paragraphId":"authored","authoredSpans":[{"spanId":"a","text":text}],"fontBytes":include_bytes!("../../../../../assets/fonts/Sarabun/Sarabun-Regular.ttf").as_slice()}).to_string()).unwrap()}
    fn edit(rt:&mut Runtime,receipt:&str,revision:u64,start:usize,end:usize,text:&str)->Value {apply(rt,&json!({"receipt":receipt,"expectedRevision":revision,"startOffset":start,"endOffset":end,"replacementText":text,"anchorSpanId":"a"}).to_string()).unwrap()}
    #[test] fn product_projection_and_fallback_keep_exact_retained_source(){
        let mut rt=Runtime::default();let c=made(&mut rt,"ภาษาไทย Latin");assert_eq!(c["status"],"Created","{c}");
        let token=c["receipt"].as_str().unwrap();let p=project(&rt,token,0).unwrap();assert_eq!(p["text"],"ภาษาไทย Latin");assert_eq!(p["work"]["sourceCopiedUtf16"],13);
        let next=edit(&mut rt,token,0,0,13,"");assert_eq!(next["status"],"Accepted","{next}");assert_eq!(next["execution"],"full-context-required");
        let key=next["nextReceipt"].as_str().unwrap();let p=project(&rt,key,1).unwrap();assert_eq!(p["text"],"");assert_eq!(p["paragraph"]["defaults"]["styleKey"],"body");
        let next=edit(&mut rt,key,1,0,0,"ก");assert_eq!(next["status"],"Accepted","{next}");
        assert_eq!(project(&rt,next["nextReceipt"].as_str().unwrap(),2).unwrap()["text"],"ก");
    }
    #[test] fn product_invalid_and_stale_commands_preserve_source(){
        let mut rt=Runtime::default();let c=made(&mut rt,"ABC");let token=c["receipt"].as_str().unwrap();
        assert_eq!(edit(&mut rt,token,0,0,1,"😀")["status"],"NotCreated");
        assert_eq!(project(&rt,token,0).unwrap()["text"],"ABC");
        assert!(apply(&mut rt,&json!({"receipt":token,"expectedRevision":1,"startOffset":0,"endOffset":1,"replacementText":"X","anchorSpanId":"a"}).to_string()).is_err());
    }
    #[test] fn product_full_fallback_preserves_multiple_authored_owners(){
        let mut rt=Runtime::default();let raw=json!({"paragraphId":"authored","authoredSpans":[{"spanId":"a","text":"AB"},{"spanId":"b","text":"CD"}],"fontBytes":include_bytes!("../../../../../assets/fonts/Sarabun/Sarabun-Regular.ttf").as_slice()});
        let c=create(&mut rt,&raw.to_string()).unwrap();let r=edit(&mut rt,c["receipt"].as_str().unwrap(),0,1,3,"X");assert_eq!(r["status"],"Accepted","{r}");
        let p=project(&rt,r["nextReceipt"].as_str().unwrap(),1).unwrap();assert_eq!(p["text"],"AXD");assert_eq!(p["spans"][0]["spanId"],"a");assert_eq!(p["spans"][1]["spanId"],"b");assert_eq!(p["spans"][1]["startOffset"],2);
    }
    #[test] fn product_shape_matches_existing_creator_raw_provider(){
        let mut rt=Runtime::default();let c=made(&mut rt,"AVATAR ภาษาไทย");let key=c["receipt"].as_str().unwrap();
        let facts=shape(&rt,key,0,"AVATAR ").unwrap();let old:Value=serde_json::from_str(&crate::flowdoc_text_engine_shape_json(&rt.sessions[key].provider.fonts[0].bytes,"AVATAR ","sarabun-regular","","test").unwrap()).unwrap();
        for (a,b) in facts["glyphs"].as_array().unwrap().iter().zip(old["glyphs"].as_array().unwrap()){assert_eq!(a["glyphId"],b["glyphId"]);assert_eq!(a["xAdvance"],b["xAdvance"]);assert_eq!(a["xOffset"],b["xOffset"]);}
    }
}
