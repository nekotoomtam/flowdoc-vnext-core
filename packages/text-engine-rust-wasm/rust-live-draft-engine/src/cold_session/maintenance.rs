use super::{
    command_work::{Meter, PreparedReply}, ledger::{Scope, Work}, model::{Run, Shard},
    provider_plans::{PlanCache, PlanKey}, runtime::Runtime, tree::{Tree, TreeWork},
};
use serde::Deserialize;
use serde_json::json;
use super::faults::Point;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Request {
    receipt: String,
    expected_revision: u64,
    operation: String,
    run_index: usize,
    #[serde(default = "plan_target")]
    target: String,
}
fn plan_target() -> String { "plan".into() }

fn charge_lookup(m: &mut Meter, receipt: &str) {
    m.command_auth_lookups += 1;
    m.command_auth_receipt_bytes += receipt.len() as u64;
}

fn charge_tree(m: &mut Meter, w: &TreeWork) {
    m.tree_node_visits += w.visits;
    m.tree_path_copies += w.copies;
    m.shared_subtrees += w.shared_subtrees;
    m.lazy_shifted_subtrees += w.shifted_subtrees;
    m.ownership_span_visits += w.ownership_span_visits;
    m.anchor_comparison_bytes += w.anchor_comparison_bytes;
    m.payload_copy_calls += w.payload_copy_calls;
    m.payload_elements_copied += w.payload_elements_copied;
    m.payload_string_bytes_copied += w.payload_string_bytes_copied;
    m.payload_vector_bytes_copied += w.payload_vector_bytes_copied;
    m.position_rewrites += w.position_rewrites;
    m.provider_run_id_encoding_passes += w.provider_run_id_encoding_passes;
    m.provider_run_id_encoded_bytes += w.provider_run_id_encoded_bytes;
    m.source_copy_bytes += w.source_copy_bytes;
    m.source_copied_utf16 += w.source_copied_utf16;
    m.source_copy_calls += w.source_copy_calls;
    m.source_index_utf16 += w.source_index_utf16;
    m.source_offset_lookups += w.source_offset_lookups;
}

fn candidate(rt: &Runtime, c: &Request, m: &mut Meter) -> Result<(PlanKey, Run), &'static str> {
    charge_lookup(m, &c.receipt);
    let s = rt.sessions.get(&c.receipt).ok_or("unknown-receipt")?;
    m.command_revision_checks += 1;
    if c.expected_revision != s.revision { return Err("stale-revision"); }
    if !matches!(c.operation.as_str(), "evict" | "recover") ||
        !matches!(c.target.as_str(), "plan" | "shard") { return Err("invalid-operation"); }
    let mut w = TreeWork::default();
    let run = s.runs.at(c.run_index, &mut w).ok_or("missing-owner")?.materialize(&mut w);
    charge_tree(m, &w);
    let key=PlanKey::for_run(&s.provider, &run);
    m.payload_string_bytes_copied += key.string_bytes() as u64;
    Ok((key, run))
}

pub(super) fn apply(rt: &mut Runtime, input: &str) -> String { apply_inner(rt,input,None) }
pub(super) fn apply_controlled(rt: &mut Runtime, input: &str, control: &str) -> String { apply_inner(rt,input,Some(control)) }
fn apply_inner(rt: &mut Runtime, input: &str, control: Option<&str>) -> String {
    #[cfg(test)]
    super::accounting_tests::PUBLICATION_PROBE.with(|p| p.set(Default::default()));
    let scope = Scope::begin();
    let mut m = Meter { abi_input_bytes: (input.len() as u64).checked_add(control.map_or(0,|c|c.len() as u64)).unwrap_or(u64::MAX), ..Meter::default() };
    m.command_parse_calls += 1;
    let parsed = serde_json::from_str::<Request>(input);
    let session = parsed.as_ref().ok().and_then(|c| {
        charge_lookup(&mut m, &c.receipt);
        rt.sessions.get(&c.receipt)
    });
    let revision = session.map(|s|s.revision);
    let life = session.map(|s| s.lifecycle.clone());
    let prior = session.map(|s| s.accepted_work);
    let lifetime = life.as_ref().map(|l| l.borrow().attempts);
    let overflow = life.as_ref().is_some_and(|l| l.borrow().can_record().is_err());
    let mut status = "NotAdmissible";
    let mut reason: Option<&'static str> = None;
    let mut released_bytes = 0;
    let mut recovery_plan = None;
    let mut recovery_shards: Option<Tree<Shard>> = None;
    let mut key = None;
    let target = parsed.as_ref().ok().map(|c| c.run_index);
    let result = parsed.as_ref().map_err(|_| "invalid-command")
        .and_then(|c| {
            if overflow { return Err("lifecycle-overflow"); }
            let candidate=candidate(rt,c,&mut m)?;
            if control.is_some() {
                charge_lookup(&mut m,&c.receipt);
                let provider=&rt.sessions[&c.receipt].provider;
                super::host_control::observe(control,&mut m,&c.receipt,c.expected_revision,None,
                    Some((&c.operation,&c.target,c.run_index,&provider.provider_id,&provider.provider_revision)))?;
            }
            Ok(candidate)
        });
    match result {
        Err(e) => reason = Some(e),
        Ok((k, run)) => {
            let c = parsed.as_ref().unwrap();
            charge_lookup(&mut m, &c.receipt);
            let s = &rt.sessions[&c.receipt];
            let cache = &s.provider.plans;
            if c.target == "shard" && c.operation == "evict" {
                if s.derived_missing.is_some() { status = "Unchanged"; }
                else if s.sibling.is_some() || s.shards.len == 1 && !s.shards.exclusive_singleton_payload() {
                    reason = Some("resource-in-use");
                } else if c.run_index != 0 || s.shards.len != 1 || s.runs.len != 1 || run.end > 128 {
                    reason = Some("missing-edge-witness");
                } else if let Err(e) = rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::EvictionRefusal,&mut m.fault_work) {
                    reason = Some(e);
                } else {
                    let empty = Tree::build(Vec::<Shard>::new(), &mut Work::default());
                    let before = scope.snapshot();
                    charge_lookup(&mut m, &c.receipt);
                    let session = rt.sessions.get_mut(&c.receipt).unwrap();
                    let old = std::mem::replace(&mut session.shards, empty);
                    session.derived_missing = Some(c.run_index);
                    drop(old);
                    released_bytes = scope.snapshot().free_bytes - before.free_bytes;
                    status = "Evicted";
                }
            } else if c.target == "shard" && c.operation == "recover" {
                if s.derived_missing != Some(c.run_index) { status = "Unchanged"; }
                else if let Err(e) = rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::RecoveryBeforeProvider,&mut m.fault_work) {
                    reason = Some(e);
                }
                else {
                    let mut w = TreeWork::default();
                    let rebuilt = (|| -> Result<Tree<Shard>, &'static str> {
                        if run.end > 128 { return Err("budget-exhaustion"); }
                        if run.start != 0 || run.end != s.source.utf16() || s.runs.len != 1 {
                            return Err("missing-edge-witness");
                        }
                        let span = s.spans.at(0, &mut w).ok_or("missing-owner")?.materialize(&mut w);
                        if s.spans.len != 1 || span.start_offset != 0 || span.end_offset != run.end ||
                            run.span_indexes.as_ref() != [0] { return Err("ambiguous-owner"); }
                        if s.paragraph.base_direction != "ltr" || s.paragraph.writing_mode != "horizontal-tb" ||
                            run.key.paragraph_base_direction != s.paragraph.base_direction ||
                            run.key.writing_mode != s.paragraph.writing_mode ||
                            run.key.provider_id != s.provider.provider_id ||
                            run.key.provider_revision != s.provider.provider_revision {
                            return Err("provider-binding-mismatch");
                        }
                        let mut resolve_work=Work::default();
                        let (route, features) = super::policy::resolve(&s.provider, &span, &run.key.script, &mut resolve_work)?;
                        m.policy_rule_visits += resolve_work.rule_match_visits;
                        let font = &s.provider.fonts[run.resource_index];
                        if route.font_id != run.key.font_id || route.language != run.key.language ||
                            route.direction != run.key.direction || features.features != run.key.features ||
                            !route.resources.contains(&font.resource_id) { return Err("provider-binding-mismatch"); }
                        let mut policy_work = Work::default();
                        let policy_bytes = super::policy::canonical(&s.provider.policy,&mut policy_work);
                        m.canonical_value_passes += policy_work.canonical_value_passes;
                        m.canonical_json_passes += policy_work.canonical_json_passes;
                        m.canonical_encoded_bytes += policy_work.canonical_encoded_bytes;
                        m.hash_calls += 2;
                        m.hash_input_bytes += (policy_bytes.len()+font.bytes.len()) as u64;
                        if super::policy::hash(&policy_bytes) != s.provider.policy_digest ||
                            super::policy::hash(&font.bytes) != font.digest { return Err("provider-binding-mismatch"); }
                        let text = s.source.window(0, run.end, &mut w)?;
                        let actual_start_byte=s.source.byte_offset(0,&mut w)?;
                        let actual_end_byte=s.source.byte_offset(run.end,&mut w)?;
                        if run.start_byte != actual_start_byte || run.end_byte != actual_end_byte ||
                            s.source_binding.is_empty() { return Err("source-binding-mismatch"); }
                        // This transient witness binds the bounded source slice,
                        // authored presence/origin, paragraph, run key, provider
                        // and resource at the authenticated revision. Its outside
                        // dependency is explicitly absent only because both
                        // edges are physical paragraph boundaries.
                        let witness=serde_json::json!({"sourceRange":[run.start,run.end],"sourceBinding":s.source_binding,
                            "content":text,"authored":{"id":span.span_id,"language":span.language,
                                "styleKey":span.style_key,"origin":span.origin},"paragraph":s.paragraph,
                            "runKey":run.key,"providerId":s.provider.provider_id,
                            "providerRevision":s.provider.provider_revision,"policyDigest":s.provider.policy_digest,
                            "resourceDigest":font.digest,"revision":s.revision,"outsideDependency":"physical-edges-none"});
                        let encoded=super::policy::canonical(&witness,&mut policy_work);
                        m.canonical_value_passes += 1;
                        m.canonical_json_passes += 1;
                        m.canonical_encoded_bytes += encoded.len() as u64;
                        m.hash_calls += 1;
                        m.hash_input_bytes += encoded.len() as u64;
                        m.hash_input_utf16 += run.end as u64;
                        let _witness_digest=super::policy::hash(&encoded);
                        m.source_facts_utf16 += run.end as u64;
                        let mut shard = super::commands::facts(&text, 0, &run, &s.provider, &mut m, false)?;
                        if shard.glyphs.is_empty() || shard.start_offset != 0 || shard.end_offset != run.end ||
                            shard.grapheme_boundaries.first() != Some(&0) ||
                            shard.grapheme_boundaries.last() != Some(&run.end) {
                            return Err("missing-edge-witness");
                        }
                        shard.run_index = 0;
                        let mut build_work = Work::default();
                        let tree = Tree::build(vec![shard], &mut build_work);
                        m.tree_node_visits += build_work.tree_nodes;
                        Ok(tree)
                    })();
                    charge_tree(&mut m, &w);
                    match rebuilt {
                        Ok(tree) => {
                            match rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::RecoveryAfterProvider,&mut m.fault_work)
                                .and_then(|_|rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::RecoveryPublicationRefusal,&mut m.fault_work)) {
                                Ok(()) => { status = "Recovered"; recovery_shards = Some(tree); },
                                Err(e) => reason = Some(e),
                            }
                        }
                        Err(e) => reason = Some(e),
                    }
                }
            } else if c.operation == "evict" {
                m.plan_lookups += 1;
                if s.sibling.is_some() { reason = Some("resource-in-use"); }
                else if let Err(e) = rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::EvictionRefusal,&mut m.fault_work) {
                    reason = Some(e);
                }
                else {
                    let before = scope.snapshot();
                    match cache.borrow_mut().evict(&k) {
                        Ok(true) => {
                            released_bytes = scope.snapshot().free_bytes - before.free_bytes;
                            m.plan_evictions += 1;
                            status = "Evicted";
                        }
                        Ok(false) => status = "Unchanged",
                        Err(e) => reason = Some(e),
                    }
                }
            } else if !cache.borrow().is_missing(&k) {
                m.plan_lookups += 1;
                status = "Unchanged";
            } else if let Err(e) = cache.borrow().can_recover(&k) {
                m.plan_lookups += 1;
                reason = Some(e);
            } else if let Err(e) = rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::RecoveryBeforeProvider,&mut m.fault_work) {
                m.plan_lookups += 1;
                reason = Some(e);
            } else {
                m.plan_lookups += 1;
                // A ShapePlan is provider setup, independent of source text.
                // Its missing key is reconstructed only from Rust-owned run
                // and immutable provider configuration.
                let proof = (|| -> Result<rustybuzz::ShapePlan, &'static str> {
                    if run.key.provider_id != s.provider.provider_id ||
                        run.key.provider_revision != s.provider.provider_revision {
                        return Err("provider-binding-mismatch");
                    }
                    let font = &s.provider.fonts[run.resource_index];
                    m.font_parse_calls += 1;
                    m.font_parse_input_bytes += font.bytes.len() as u64;
                    let face = rustybuzz::Face::from_slice(&font.bytes, 0).ok_or("provider-failure")?;
                    let features = run.key.features.iter().map(|f| {
                        m.feature_parse_calls += 1;
                        m.feature_parse_bytes += f.len() as u64;
                        f.parse::<rustybuzz::Feature>().map_err(|_| "provider-failure")
                    })
                        .collect::<Result<Vec<_>,_>>()?;
                    m.language_parse_calls += 1;
                    m.language_parse_bytes += run.key.language.len() as u64;
                    let plan=PlanCache::build(&k, &face, &features)?;
                    m.plan_constructions += 1;
                    Ok(plan)
                })();
                match proof {
                    Ok(plan) => {
                        match rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::RecoveryAfterProvider,&mut m.fault_work)
                            .and_then(|_|rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::RecoveryPublicationRefusal,&mut m.fault_work)) {
                            Ok(()) => { status = "Recovered"; m.plan_recoveries += 1; recovery_plan = Some(plan); key = Some(k); },
                            Err(e) => reason = Some(e),
                        }
                    }
                    Err(e) => reason = Some(e),
                }
            }
        }
    }
    m.source_facts_utf16 += m.source_scan_utf16 + m.source_index_utf16 + m.source_offset_lookups + m.property_scan_utf16;
    m.property_facts_utf16 = m.property_scan_utf16;
    if status == "Recovered" && (m.source_facts_utf16 > 512 || m.property_facts_utf16 > 512 ||
        m.shaping_segmentation_input_utf16 > 1024) {
        status = "NotAdmissible";
        reason = Some("budget-exhaustion");
        recovery_plan = None;
        recovery_shards = None;
    }
    // Publication has one final session-table lookup after the response is
    // prepared. Reserve its exact work before serializing the fixed slots.
    if status == "Recovered" {
        charge_lookup(&mut m, &parsed.as_ref().unwrap().receipt);
    }
    m.structural.lineage_scalar_writes = if life.is_some() && !overflow {
        super::command_work::FAMILY_SCALAR_WRITES + u64::from(matches!(status,"Evicted"|"Recovered"))
    } else {0};
    m.response_value_passes += 1;
    if control.is_some() && reason==Some("cancelled") { status="Cancelled"; }
    let response = json!({"status":status,"reason":reason,"unchangedReceipt":parsed.as_ref().ok().map(|c|&c.receipt),
        "unchangedRevision":revision,"targetRunIndex":target,
        "releasedResources":if status=="Evicted" {1} else {0},"releasedBytes":released_bytes,
        "affectedSummary":{"work":m,"acceptedCumulativeWork":prior,"lifecycleCumulativeWork":lifetime,
            "maintenanceEvents":life.as_ref().map(|l| l.borrow().maintenance_events + u64::from(matches!(status,"Evicted"|"Recovered")))}});
    let mut prepared = PreparedReply::new(response, Vec::with_capacity(8192), &mut m);
    if status == "Recovered" {
        if let Some(l) = &life {
            if let Err(e) = l.borrow().preflight(&m) {
                return json!({"status":"NotAdmissible","reason":e}).to_string();
            }
        }
        let c = parsed.as_ref().unwrap();
        if let Some(plan) = recovery_plan {
            rt.sessions[&c.receipt].provider.plans.borrow_mut().recover(key.unwrap(), plan).unwrap();
        }
        if let Some(shards) = recovery_shards {
            let session = rt.sessions.get_mut(&c.receipt).unwrap();
            session.shards = shards;
            session.derived_missing = None;
        }
    }
    // No source revision, accepted mutation or receipt is minted by maintenance.
    if let Some(lifetime) = lifetime { prepared.bind_lifecycle(lifetime); }
    prepared.finish(&mut m, prior, false, &scope);
    if !overflow { if let Some(life) = life { life.borrow_mut().finish_maintenance(&m, status, reason.is_some()); } }
    prepared.into_string()
}
