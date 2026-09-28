use super::model::{Key, Provider, Run};
use std::collections::VecDeque;

// The admitted Latin/en and Thai/th profile has two analysis keys. A family
// owns at most two plans; insertion replaces the oldest unpinned entry.
const CAPACITY: usize = 2;

#[derive(Clone, Debug, Eq, PartialEq)]
pub(super) struct PlanKey {
    font_digest: String,
    face_index: u32,
    variations: Vec<(String, i32)>,
    direction: String,
    script: String,
    language: String,
    features: Vec<String>,
    provider_id: String,
    provider_revision: String,
    policy_digest: String,
}

impl PlanKey {
    pub fn string_bytes(&self) -> usize {
        self.font_digest.len()+self.direction.len()+self.script.len()+self.language.len()+
        self.features.iter().map(String::len).sum::<usize>()+self.provider_id.len()+
        self.provider_revision.len()+self.policy_digest.len()+
        self.variations.iter().map(|(tag,_)|tag.len()).sum::<usize>()
    }
    pub fn for_run(provider: &Provider, run: &Run) -> Self {
        let Key { direction, script, language, features, provider_id, provider_revision, .. } = &run.key;
        Self {
            font_digest: provider.fonts[run.resource_index].digest.clone(),
            face_index: 0,
            variations: Vec::new(),
            direction: direction.clone(),
            script: script.clone(),
            language: language.clone(),
            features: features.clone(),
            provider_id: provider_id.clone(),
            provider_revision: provider_revision.clone(),
            policy_digest: provider.policy_digest.clone(),
        }
    }
}

struct Entry {
    key: PlanKey,
    plan: rustybuzz::ShapePlan,
    pinned: usize,
}

#[derive(Default)]
pub(super) struct PlanCache {
    entries: VecDeque<Entry>,
    missing: Vec<PlanKey>,
    pub constructions: u64,
    pub reuses: u64,
    pub evictions: u64,
    pub recoveries: u64,
    pub lookups: u64,
}

#[derive(Clone, Copy)]
pub(super) struct PlanCounts {
    pub constructions: u64,
    pub reuses: u64,
    pub evictions: u64,
    pub recoveries: u64,
    pub lookups: u64,
}

impl PlanCache {
    pub fn resident_count(&self) -> usize { self.entries.len() }
    pub fn counts(&self) -> PlanCounts { PlanCounts {
        constructions:self.constructions,reuses:self.reuses,evictions:self.evictions,
        recoveries:self.recoveries,lookups:self.lookups,
    } }
    pub fn is_missing(&self, key: &PlanKey) -> bool { self.missing.contains(key) }
    pub fn can_recover(&self, key: &PlanKey) -> Result<(), &'static str> {
        if !self.is_missing(key) { return Err("already-ready"); }
        self.recoveries.checked_add(1).ok_or("lifecycle-overflow")?;
        if self.entries.len() == CAPACITY && self.entries.iter().all(|entry| entry.pinned != 0) {
            return Err("resource-in-use");
        }
        if self.entries.len() == CAPACITY { self.evictions.checked_add(1).ok_or("lifecycle-overflow")?; }
        Ok(())
    }
    pub fn evict(&mut self, key: &PlanKey) -> Result<bool, &'static str> {
        let Some(index) = self.entries.iter().position(|entry| &entry.key == key) else {
            return Ok(false);
        };
        if self.entries[index].pinned != 0 { return Err("resource-in-use"); }
        let next_evictions = self.evictions.checked_add(1).ok_or("lifecycle-overflow")?;
        if !self.missing.contains(key) {
            if self.missing.len() == CAPACITY { return Err("plan-capacity-exceeded"); }
            self.missing.push(key.clone());
        }
        self.evictions = next_evictions;
        self.entries.remove(index);
        Ok(true)
    }
    pub fn recover(&mut self, key: PlanKey, plan: rustybuzz::ShapePlan) -> Result<(), &'static str> {
        self.can_recover(&key)?;
        let index = self.missing.iter().position(|item| item == &key).unwrap();
        self.missing.remove(index);
        if let Err(e) = self.insert(key.clone(), plan) {
            self.missing.insert(index, key);
            return Err(e);
        }
        self.recoveries += 1; // can_recover reserved this increment before mutation.
        Ok(())
    }
    pub fn build(
        key: &PlanKey, face: &rustybuzz::Face<'_>, features: &[rustybuzz::Feature],
    ) -> Result<rustybuzz::ShapePlan, &'static str> {
        let script = match key.script.as_str() {
            "Thai" => rustybuzz::script::THAI,
            "Latin" => rustybuzz::script::LATIN,
            _ => return Err("unsupported-font-script"),
        };
        let language: rustybuzz::Language = key.language.parse().map_err(|_| "provider-failure")?;
        Ok(rustybuzz::ShapePlan::new(
            face, rustybuzz::Direction::LeftToRight, Some(script), Some(&language), features,
        ))
    }
    fn insert(&mut self, key: PlanKey, plan: rustybuzz::ShapePlan) -> Result<(), &'static str> {
        if self.entries.len() == CAPACITY {
            let victim = self.entries.iter().position(|entry| entry.pinned == 0).ok_or("resource-in-use")?;
            let removed_key = self.entries[victim].key.clone();
            if !self.missing.contains(&removed_key) && self.missing.len() == CAPACITY {
                return Err("plan-capacity-exceeded");
            }
            self.evictions = self.evictions.checked_add(1).ok_or("lifecycle-overflow")?;
            self.entries.remove(victim);
            if !self.missing.contains(&removed_key) { self.missing.push(removed_key); }
        }
        self.entries.push_back(Entry { key, plan, pinned: 0 });
        Ok(())
    }
    pub fn shape(
        &mut self, key: PlanKey, face: &rustybuzz::Face<'_>, features: &[rustybuzz::Feature],
        buffer: rustybuzz::UnicodeBuffer, allow_new: bool,
    ) -> Result<rustybuzz::GlyphBuffer, &'static str> {
        self.lookups = self.lookups.checked_add(1).ok_or("lifecycle-overflow")?;
        if self.is_missing(&key) { return Err("recovery-required"); }
        if let Some(index) = self.entries.iter().position(|entry| entry.key == key) {
            self.reuses = self.reuses.checked_add(1).ok_or("lifecycle-overflow")?;
            let entry = &mut self.entries[index];
            entry.pinned = entry.pinned.checked_add(1).ok_or("lifecycle-overflow")?;
            let result = rustybuzz::shape_with_plan(face, &entry.plan, buffer);
            entry.pinned -= 1;
            return Ok(result);
        }
        if !allow_new { return Err("recovery-required"); }
        let plan = Self::build(&key, face, features)?;
        self.constructions = self.constructions.checked_add(1).ok_or("lifecycle-overflow")?;
        self.insert(key.clone(), plan)?;
        let entry = self.entries.back_mut().unwrap();
        entry.pinned += 1;
        let result = rustybuzz::shape_with_plan(face, &entry.plan, buffer);
        entry.pinned -= 1;
        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn two_entry_fifo_replaces_oldest_unpinned_and_bounds_missing_keys() {
        let bytes=include_bytes!("../../../../../assets/fonts/Sarabun/Sarabun-Regular.ttf");
        let face=rustybuzz::Face::from_slice(bytes,0).unwrap();
        let make=||rustybuzz::ShapePlan::new(&face,rustybuzz::Direction::LeftToRight,
            Some(rustybuzz::script::LATIN),Some(&"en".parse().unwrap()),&[]);
        let key=|name:&str|PlanKey{font_digest:name.into(),face_index:0,variations:vec![],direction:"ltr".into(),
            script:"Latin".into(),language:"en".into(),features:vec![],provider_id:"p".into(),
            provider_revision:"v1".into(),policy_digest:"d".into()};
        let mut cache=PlanCache::default();
        cache.insert(key("a"),make()).unwrap();
        cache.insert(key("b"),make()).unwrap();
        cache.insert(key("c"),make()).unwrap();
        assert!(cache.is_missing(&key("a")));
        assert_eq!(cache.entries.front().unwrap().key,key("b"));
        assert_eq!(cache.entries.back().unwrap().key,key("c"));
        cache.entries.front_mut().unwrap().pinned=1;
        cache.insert(key("d"),make()).unwrap();
        assert!(cache.is_missing(&key("c")));
        assert_eq!(cache.entries.front().unwrap().key,key("b"));
        assert_eq!(cache.entries.back().unwrap().key,key("d"));
        assert_eq!(cache.missing.len(),2);
        assert_eq!(cache.insert(key("e"),make()),Err("plan-capacity-exceeded"));
        assert_eq!(cache.entries.len(),2);
    }
}
