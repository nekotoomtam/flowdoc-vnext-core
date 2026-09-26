// Additive structural operations that have no Stage 4 meter equivalent.
// Gauges (live sessions, tree sizes/heights) are deliberately absent.
use serde::Serialize;
#[derive(Clone, Copy, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct StructuralWork {
    pub endpoint_validations: u64,
    pub context_rebinds: u64,
    pub source_partitions: u64,
    pub session_record_clones: u64,
    pub child_candidates: u64,
    pub inverse_candidates: u64,
    pub lineage_identity_checks: u64,
    // Logical destination slots written at finalization, including each u128
    // array element, accepted/rejected event scalar and the structural array.
    pub lineage_scalar_writes: u64,
}
pub(super) const N: usize = 8;
pub(super) const NAMES: [&str; N] = [
    "endpointValidations",
    "contextRebinds",
    "sourcePartitions",
    "sessionRecordClones",
    "childCandidates",
    "inverseCandidates",
    "lineageIdentityChecks",
    "lineageScalarWrites",
];
impl StructuralWork {
    pub fn values(&self) -> [u64; N] {
        [
            self.endpoint_validations,
            self.context_rebinds,
            self.source_partitions,
            self.session_record_clones,
            self.child_candidates,
            self.inverse_candidates,
            self.lineage_identity_checks,
            self.lineage_scalar_writes,
        ]
    }
}
#[derive(Clone, Copy, Default)]
pub(super) struct Totals(pub [u128; N]);
impl Totals {
    pub fn preflight(&self) -> Result<(), &'static str> {
        for v in self.0 {
            v.checked_add(u128::from(u64::MAX))
                .ok_or("structural-work-overflow")?;
        }
        Ok(())
    }
    pub fn total(&self, w: &StructuralWork) -> Self {
        let delta = w.values();
        Self(std::array::from_fn(|i| {
            self.0[i]
                .checked_add(delta[i] as u128)
                .expect("structural headroom preflighted")
        }))
    }
}
impl Serialize for Totals {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        use serde::ser::SerializeMap;
        let mut map = serializer.serialize_map(Some(N))?;
        for (name, value) in NAMES.iter().zip(self.0) {
            map.serialize_entry(name, &format!("{value:032x}"))?;
        }
        map.end()
    }
}
