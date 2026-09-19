use super::{ledger::Work, model::*};
use sha2::{Digest, Sha256};

pub(super) fn hash(bytes: &[u8]) -> String {
    format!("sha256:{:x}", Sha256::digest(bytes))
}
pub(super) fn canonical<T: serde::Serialize>(value: &T, work: &mut Work) -> Vec<u8> {
    // serde_json's default Value object is a sorted BTreeMap; arrays keep order.
    work.canonical_value_passes += 1;
    work.canonical_json_passes += 1;
    let bytes =
        serde_json::to_vec(&serde_json::to_value(value).expect("internal serializable value"))
            .unwrap();
    work.canonical_encoded_bytes += bytes.len() as u64;
    bytes
}
pub(super) fn id(value: &str) -> bool {
    !value.trim().is_empty() && value.len() <= 128
}
pub(super) fn font_key(r: &FontRule) -> (&str, &str, &str, &str, &str) {
    (
        &r.style_key,
        &r.language,
        &r.script,
        &r.direction,
        &r.writing_mode,
    )
}
fn feature_key(r: &FeatureRule) -> (&str, &str, &str, &str, &str) {
    (
        &r.style_key,
        &r.language,
        &r.script,
        &r.direction,
        &r.writing_mode,
    )
}

pub(super) fn validate(provider: &Provider, work: &mut Work) -> Result<(), &'static str> {
    let p = &provider.policy;
    if provider.provider_id != "rust-stage3-thai-latin"
        || provider.provider_revision != "v1"
        || p.schema_version != 1
        || p.unicode_version != "17.0.0"
        || p.script_revision != "unicode-script-0.5.8"
        || p.bidi_revision != "thai-latin-ltr-only-v1"
        || p.grapheme_revision != "icu_segmenter-2.2.0"
        || p.line_revision != "icu_segmenter-2.2.0"
        || p.shaping_revision != "rustybuzz-0.20.1"
        || p.run_boundary_policy != "common-inherited-previous-else-next-v1"
    {
        return Err("unsupported-policy");
    }
    let bytes = canonical(p, work);
    work.policy_hash_bytes += bytes.len() as u64;
    if hash(&bytes) != provider.policy_digest {
        return Err("policy-digest-mismatch");
    }
    if provider.fonts.is_empty() || provider.fonts.len() > 2 {
        return Err("invalid-font-resources");
    }
    for (i, font) in provider.fonts.iter().enumerate() {
        work.resource_visits += 1;
        if provider.fonts[..i].iter().any(|other| {
            work.validation_comparisons += 1;
            other.resource_id == font.resource_id
        }) {
            return Err("invalid-font-resources");
        }
        // These exact repository-owned bytes are the reviewed resource allowlist.
        let pin = match font.resource_id.as_str() {
            "sarabun-regular" => {
                "sha256:b8150084e25734e6f31696c57ff009f5564efa09d295848b717d9e2328c0311d"
            }
            "sarabun-bold" => {
                "sha256:5d1fc1ee63ab861fb2022a212b5ff270848582bb9d9cba73b2d2aaabb16d0a18"
            }
            _ => return Err("unverified-font-resource"),
        };
        work.font_hash_bytes += font.bytes.len() as u64;
        if font.digest != pin || hash(&font.bytes) != pin {
            return Err("font-digest-mismatch");
        }
        work.font_parse_calls += 1;
        work.font_parse_input_bytes += font.bytes.len() as u64;
        if rustybuzz::Face::from_slice(&font.bytes, 0).is_none() {
            return Err("invalid-font-resource");
        }
    }
    if p.language_rules.is_empty()
        || p.language_rules.len() > 16
        || p.font_route_rules.is_empty()
        || p.font_route_rules.len() > 64
        || p.feature_rules.len() != p.font_route_rules.len()
    {
        return Err("invalid-policy-rules");
    }
    let mut previous_language = None;
    for r in &p.language_rules {
        work.policy_rule_visits += 1;
        let key = (r.authored_language.as_str(), r.script.as_str());
        if previous_language.is_some_and(|prev| prev >= key) {
            return Err("invalid-rule-order-or-overlap");
        }
        previous_language = Some(key);
        let expected = match r.script.as_str() {
            "Latin" => "en",
            "Thai" => "th",
            _ => return Err("unsupported-policy"),
        };
        if !["und", expected].contains(&r.authored_language.as_str()) || r.language != expected {
            return Err("unsupported-language-rule");
        }
        if !p.font_route_rules.iter().any(|f| {
            work.validation_comparisons += 1;
            f.language == r.language && f.script == r.script
        }) {
            return Err("unreachable-rule");
        }
    }
    for script in ["Latin", "Thai"] {
        if !p.language_rules.iter().any(|r| {
            work.validation_comparisons += 1;
            r.authored_language == "und" && r.script == script
        }) {
            return Err("missing-rule");
        }
    }
    let mut previous_font = None;
    for (font, feature) in p.font_route_rules.iter().zip(&p.feature_rules) {
        work.policy_rule_visits += 2;
        let key = font_key(font);
        if previous_font.is_some_and(|prev| prev >= key) {
            return Err("invalid-rule-order-or-overlap");
        }
        previous_font = Some(key);
        if feature_key(feature) != key
            || !id(&font.style_key)
            || !id(&font.font_id)
            || font.direction != "ltr"
            || font.writing_mode != "horizontal-tb"
            || font.coverage != "all-scalars-or-reject"
            || !p.language_rules.iter().any(|r| {
                work.validation_comparisons += 1;
                r.language == font.language && r.script == font.script
            })
        {
            return Err("invalid-policy-rules");
        }
        if font.resources.is_empty() || font.resources.len() > 2 {
            return Err("invalid-font-route");
        }
        for (i, resource) in font.resources.iter().enumerate() {
            if font.resources[..i].iter().any(|r| {
                work.validation_comparisons += 1;
                r == resource
            }) || !provider.fonts.iter().any(|f| {
                work.validation_comparisons += 1;
                &f.resource_id == resource
            }) {
                return Err("invalid-font-route");
            }
        }
        // The reviewed first profile has one exact canonical feature set. An
        // empty list must not silently mean Rustybuzz's enabled defaults while
        // descriptors claim that no features were selected.
        work.validation_comparisons += feature.features.len() as u64;
        if feature.features != ["kern", "liga"] {
            return Err("unsupported-feature");
        }
    }
    if provider.fonts.iter().any(|f| {
        !p.font_route_rules.iter().any(|r| {
            work.validation_comparisons += 1;
            r.resources.iter().any(|resource| {
                work.validation_comparisons += 1;
                resource == &f.resource_id
            })
        })
    }) {
        return Err("unreachable-resource");
    }
    Ok(())
}

pub(super) fn resolve<'a>(
    provider: &'a Provider,
    span: &Span,
    script: &str,
    work: &mut Work,
) -> Result<(&'a FontRule, &'a FeatureRule), &'static str> {
    let authored = span.language.as_deref().unwrap_or("und");
    let mut language = None;
    for r in &provider.policy.language_rules {
        work.rule_match_visits += 1;
        if r.authored_language == authored && r.script == script {
            language = Some(r.language.as_str());
            break;
        }
    }
    let language = language.ok_or("missing-language-rule")?;
    for (f, features) in provider
        .policy
        .font_route_rules
        .iter()
        .zip(&provider.policy.feature_rules)
    {
        work.rule_match_visits += 1;
        if f.style_key == span.style_key.as_deref().unwrap_or("")
            && f.language == language
            && f.script == script
        {
            return Ok((f, features));
        }
    }
    Err("missing-font-route")
}
