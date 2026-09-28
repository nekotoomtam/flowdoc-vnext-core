// Private QA command accounting. Fixed-size accepted state; no global history.
use super::faults::FaultWork;
use super::ledger::Scope;
use serde::{ser::SerializeMap, Serialize, Serializer};
use serde_json::Value;

#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct Meter {
    #[serde(skip)]
    pub structural: super::structural_work::StructuralWork,
    #[serde(flatten)]
    pub fault_work: FaultWork,
    pub publication_preparation_passes: u64,
    pub publication_preparation_bytes: u64,
    pub ownership_span_visits: u64,
    pub anchor_comparison_bytes: u64,
    pub bounded_ownership: bool,
    pub policy_rule_visits: u64,
    pub context_run_visits: u64,
    pub context_key_comparison_bytes: u64,
    pub source_copy_bytes: u64,
    pub source_copied_utf16: u64,
    pub source_copy_calls: u64,
    pub source_scan_utf16: u64,
    pub replacement_scalars_decoded: u64,
    pub source_index_utf16: u64,
    pub source_offset_lookups: u64,
    pub property_scalar_visits: u64,
    pub property_scan_utf16: u64,
    pub payload_copy_calls: u64,
    pub payload_elements_copied: u64,
    pub payload_string_bytes_copied: u64,
    pub payload_vector_bytes_copied: u64,
    pub position_rewrites: u64,
    pub provider_run_id_encoding_passes: u64,
    pub provider_run_id_encoded_bytes: u64,
    pub canonical_value_passes: u64,
    pub canonical_json_passes: u64,
    pub canonical_encoded_bytes: u64,
    pub boundary_comparisons: u64,
    pub fact_comparisons: u64,
    pub line_filter_visits: u64,
    pub concat_edge_checks: u64,
    pub provider_offset_lookups: u64,
    pub source_facts_utf16: u64,
    pub property_facts_utf16: u64,
    pub shaping_segmentation_input_utf16: u64,
    pub shaping_calls: u64,
    pub shaping_input_utf16: u64,
    pub segmentation_input_utf16: u64,
    pub old_new_shaping_calls: u64,
    pub tail_repair_shaping_calls: u64,
    pub old_new_provider_input_utf16: u64,
    pub tail_repair_provider_input_utf16: u64,
    pub segmentation_calls: u64,
    pub segmentation_setup_calls: u64,
    pub font_parse_calls: u64,
    pub language_parse_calls: u64,
    pub language_parse_bytes: u64,
    pub feature_parse_calls: u64,
    pub feature_parse_bytes: u64,
    pub provider_offset_slots_initialized: u64,
    pub provider_buffer_calls: u64,
    pub provider_buffer_input_utf16: u64,
    pub provider_buffer_input_bytes: u64,
    pub provider_flag_parse_bytes: u64,
    pub provider_flag_entries: u64,
    pub provider_flag_bytes: u64,
    pub font_parse_input_bytes: u64,
    pub plan_lookups: u64,
    pub plan_constructions: u64,
    pub plan_reuses: u64,
    pub plan_evictions: u64,
    pub plan_recoveries: u64,
    pub glyph_visits: u64,
    pub whole_paragraph_scans: u64,
    pub full_serializations: u64,
    pub unbounded_suffix_work: u64,
    pub absolute_offset_reindexing: u64,
    pub tree_path_copies: u64,
    pub tree_node_visits: u64,
    pub shared_subtrees: u64,
    pub lazy_shifted_subtrees: u64,
    pub hash_input_bytes: u64,
    pub hash_calls: u64,
    pub hash_input_utf16: u64,
    pub receipt_binding_bytes: u64,
    pub receipt_random_bytes: u64,
    pub allocation_calls: u64,
    pub allocated_bytes: u64,
    pub deallocation_calls: u64,
    pub deallocated_bytes: u64,
    pub abi_input_bytes: u64,
    pub abi_output_bytes: u64,
    pub response_encoding_passes: u64,
    pub response_value_passes: u64,
    pub command_parse_calls: u64,
    pub command_auth_lookups: u64,
    pub command_auth_receipt_bytes: u64,
    pub command_revision_checks: u64,
    pub response_encoded_bytes: u64,
    pub response_scalar_slot_writes: u64,
    pub response_scalar_slot_bytes: u64,
    pub seam_certified: bool,
    pub line_certified: bool,
    pub unsafe_edges_certified: bool,
    pub seam_search_glyphs: u64,
    pub seam_search_windows: u64,
}
pub(super) const FIELD_COUNT: usize = 100;
pub(super) const FAMILY_SCALAR_WRITES: u64 = (FIELD_COUNT + super::structural_work::N + 1) as u64;
pub(super) const FIELD_NAMES: [&str; FIELD_COUNT] = [
    "publicationPreparationPasses",
    "publicationPreparationBytes",
    "ownershipSpanVisits",
    "anchorComparisonBytes",
    "policyRuleVisits",
    "contextRunVisits",
    "contextKeyComparisonBytes",
    "sourceCopyBytes",
    "sourceCopiedUtf16",
    "sourceCopyCalls",
    "sourceScanUtf16",
    "replacementScalarsDecoded",
    "sourceIndexUtf16",
    "sourceOffsetLookups",
    "propertyScalarVisits",
    "propertyScanUtf16",
    "payloadCopyCalls",
    "payloadElementsCopied",
    "payloadStringBytesCopied",
    "payloadVectorBytesCopied",
    "positionRewrites",
    "providerRunIdEncodingPasses",
    "providerRunIdEncodedBytes",
    "canonicalValuePasses",
    "canonicalJsonPasses",
    "canonicalEncodedBytes",
    "boundaryComparisons",
    "factComparisons",
    "lineFilterVisits",
    "concatEdgeChecks",
    "providerOffsetLookups",
    "sourceFactsUtf16",
    "propertyFactsUtf16",
    "shapingSegmentationInputUtf16",
    "shapingCalls",
    "shapingInputUtf16",
    "segmentationInputUtf16",
    "oldNewShapingCalls",
    "tailRepairShapingCalls",
    "oldNewProviderInputUtf16",
    "tailRepairProviderInputUtf16",
    "segmentationCalls",
    "segmentationSetupCalls",
    "fontParseCalls",
    "languageParseCalls",
    "languageParseBytes",
    "featureParseCalls",
    "featureParseBytes",
    "providerOffsetSlotsInitialized",
    "providerBufferCalls",
    "providerBufferInputUtf16",
    "providerBufferInputBytes",
    "providerFlagParseBytes",
    "providerFlagEntries",
    "providerFlagBytes",
    "fontParseInputBytes",
    "planLookups",
    "planConstructions",
    "planReuses",
    "planEvictions",
    "planRecoveries",
    "glyphVisits",
    "wholeParagraphScans",
    "fullSerializations",
    "unboundedSuffixWork",
    "absoluteOffsetReindexing",
    "treePathCopies",
    "treeNodeVisits",
    "sharedSubtrees",
    "lazyShiftedSubtrees",
    "hashInputBytes",
    "hashCalls",
    "hashInputUtf16",
    "receiptBindingBytes",
    "receiptRandomBytes",
    "allocationCalls",
    "allocatedBytes",
    "deallocationCalls",
    "deallocatedBytes",
    "abiInputBytes",
    "abiOutputBytes",
    "responseEncodingPasses",
    "responseValuePasses",
    "commandParseCalls",
    "commandAuthLookups",
    "commandAuthReceiptBytes",
    "commandRevisionChecks",
    "responseEncodedBytes",
    "responseScalarSlotWrites",
    "responseScalarSlotBytes",
    "seamSearchGlyphs",
    "seamSearchWindows",
    "faultSlotProbes",
    "faultCheckpoints",
    "faultBindingChecks",
    "faultReceiptComparisonBytes",
    "faultRevisionChecks",
    "faultPointChecks",
    "faultsConsumed",
    "faultsCleared",
];
pub(super) const LATE_FIELDS: [&str; 4] = [
    "allocationCalls",
    "allocatedBytes",
    "deallocationCalls",
    "deallocatedBytes",
];
impl Meter {
    pub fn values(&self) -> [u64; FIELD_COUNT] {
        [
            self.publication_preparation_passes,
            self.publication_preparation_bytes,
            self.ownership_span_visits,
            self.anchor_comparison_bytes,
            self.policy_rule_visits,
            self.context_run_visits,
            self.context_key_comparison_bytes,
            self.source_copy_bytes,
            self.source_copied_utf16,
            self.source_copy_calls,
            self.source_scan_utf16,
            self.replacement_scalars_decoded,
            self.source_index_utf16,
            self.source_offset_lookups,
            self.property_scalar_visits,
            self.property_scan_utf16,
            self.payload_copy_calls,
            self.payload_elements_copied,
            self.payload_string_bytes_copied,
            self.payload_vector_bytes_copied,
            self.position_rewrites,
            self.provider_run_id_encoding_passes,
            self.provider_run_id_encoded_bytes,
            self.canonical_value_passes,
            self.canonical_json_passes,
            self.canonical_encoded_bytes,
            self.boundary_comparisons,
            self.fact_comparisons,
            self.line_filter_visits,
            self.concat_edge_checks,
            self.provider_offset_lookups,
            self.source_facts_utf16,
            self.property_facts_utf16,
            self.shaping_segmentation_input_utf16,
            self.shaping_calls,
            self.shaping_input_utf16,
            self.segmentation_input_utf16,
            self.old_new_shaping_calls,
            self.tail_repair_shaping_calls,
            self.old_new_provider_input_utf16,
            self.tail_repair_provider_input_utf16,
            self.segmentation_calls,
            self.segmentation_setup_calls,
            self.font_parse_calls,
            self.language_parse_calls,
            self.language_parse_bytes,
            self.feature_parse_calls,
            self.feature_parse_bytes,
            self.provider_offset_slots_initialized,
            self.provider_buffer_calls,
            self.provider_buffer_input_utf16,
            self.provider_buffer_input_bytes,
            self.provider_flag_parse_bytes,
            self.provider_flag_entries,
            self.provider_flag_bytes,
            self.font_parse_input_bytes,
            self.plan_lookups,
            self.plan_constructions,
            self.plan_reuses,
            self.plan_evictions,
            self.plan_recoveries,
            self.glyph_visits,
            self.whole_paragraph_scans,
            self.full_serializations,
            self.unbounded_suffix_work,
            self.absolute_offset_reindexing,
            self.tree_path_copies,
            self.tree_node_visits,
            self.shared_subtrees,
            self.lazy_shifted_subtrees,
            self.hash_input_bytes,
            self.hash_calls,
            self.hash_input_utf16,
            self.receipt_binding_bytes,
            self.receipt_random_bytes,
            self.allocation_calls,
            self.allocated_bytes,
            self.deallocation_calls,
            self.deallocated_bytes,
            self.abi_input_bytes,
            self.abi_output_bytes,
            self.response_encoding_passes,
            self.response_value_passes,
            self.command_parse_calls,
            self.command_auth_lookups,
            self.command_auth_receipt_bytes,
            self.command_revision_checks,
            self.response_encoded_bytes,
            self.response_scalar_slot_writes,
            self.response_scalar_slot_bytes,
            self.seam_search_glyphs,
            self.seam_search_windows,
            self.fault_work.fault_slot_probes,
            self.fault_work.fault_checkpoints,
            self.fault_work.fault_binding_checks,
            self.fault_work.fault_receipt_comparison_bytes,
            self.fault_work.fault_revision_checks,
            self.fault_work.fault_point_checks,
            self.fault_work.faults_consumed,
            self.fault_work.faults_cleared,
        ]
    }
}
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(super) struct AcceptedWork(pub [u128; FIELD_COUNT]);
impl Default for AcceptedWork {
    fn default() -> Self {
        Self([0; FIELD_COUNT])
    }
}
impl AcceptedWork {
    pub fn preflight(&self, meter: &Meter) -> Result<(), &'static str> {
        for (i, value) in meter.values().iter().enumerate() {
            let required = if LATE_FIELDS.contains(&FIELD_NAMES[i]) {
                u128::from(u64::MAX)
            } else {
                u128::from(*value)
            };
            self.0[i]
                .checked_add(required)
                .ok_or("cumulative-work-overflow")?;
        }
        Ok(())
    }
    pub fn total(&self, meter: &Meter) -> Self {
        let values = meter.values();
        Self(std::array::from_fn(|i| {
            self.0[i]
                .checked_add(u128::from(values[i]))
                .expect("known deltas and allocator headroom were preflighted")
        }))
    }
}
struct Hex128(u128);
impl Serialize for Hex128 {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        let mut bytes = [b'0'; 32];
        write_hex(&mut bytes, self.0);
        serializer.serialize_str(std::str::from_utf8(&bytes).unwrap())
    }
}
impl Serialize for AcceptedWork {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        let mut map = serializer.serialize_map(Some(FIELD_COUNT))?;
        for (name, value) in FIELD_NAMES.iter().zip(self.0) {
            map.serialize_entry(name, &Hex128(value))?;
        }
        map.end()
    }
}
fn write_hex(slot: &mut [u8], mut value: u128) {
    for byte in slot.iter_mut().rev() {
        *byte = b"0123456789abcdef"[(value & 15) as usize];
        value >>= 4;
    }
}
fn write_number(slot: &mut [u8], mut value: u64) {
    // JSON permits leading whitespace. Twenty-byte numeric slots keep the
    // actual u64 type and exact wire length without heap formatting.
    slot.fill(b' ');
    for byte in slot.iter_mut().rev() {
        *byte = b'0' + (value % 10) as u8;
        value /= 10;
        if value == 0 {
            break;
        }
    }
}
fn offset(bytes: &[u8], needle: &[u8]) -> usize {
    bytes
        .windows(needle.len())
        .position(|w| w == needle)
        .expect("prepared schema")
}
pub(super) struct PreparedReply {
    bytes: Vec<u8>,
    work_slots: [usize; FIELD_COUNT],
    cumulative_slots: Option<[usize; FIELD_COUNT]>,
    lifecycle_slots: Option<[usize; FIELD_COUNT]>,
    lifecycle_prior: Option<AcceptedWork>,
}
impl PreparedReply {
    // All Value construction, key searching, allocations and destruction happen
    // before publication. No Value or owned metadata survives into finish.
    pub fn new(mut response: Value, mut bytes: Vec<u8>, meter: &mut Meter) -> Self {
        for name in FIELD_NAMES {
            *response["affectedSummary"]["work"]
                .get_mut(name)
                .expect("Meter field") = Value::from(u64::MAX);
        }
        bytes.clear();
        serde_json::to_writer(&mut bytes, &response).unwrap();
        // Charge only this actual serde encoding, not the later slot patches.
        meter.response_encoding_passes = meter.response_encoding_passes.checked_add(1).unwrap();
        meter.response_encoded_bytes = meter
            .response_encoded_bytes
            .checked_add(bytes.len() as u64)
            .unwrap();
        meter.abi_output_bytes = bytes.len() as u64;
        #[cfg(test)]
        super::accounting_tests::record_response_serialization(bytes.len());
        let work_start = offset(&bytes, b"\"work\":{") + b"\"work\":{".len();
        let slots = |start: usize, quoted: bool| {
            std::array::from_fn(|i| {
                let key = format!("\"{}\":{}", FIELD_NAMES[i], if quoted { "\"" } else { "" });
                start + offset(&bytes[start..], key.as_bytes()) + key.len()
            })
        };
        let work_slots = slots(work_start, false);
        let cumulative_slots = if response["affectedSummary"]["acceptedCumulativeWork"].is_object()
        {
            let start = offset(&bytes, b"\"acceptedCumulativeWork\":{")
                + b"\"acceptedCumulativeWork\":{".len();
            Some(slots(start, true))
        } else {
            None
        };
        let lifecycle_slots = if response["affectedSummary"]["lifecycleCumulativeWork"].is_object() {
            let start = offset(&bytes, b"\"lifecycleCumulativeWork\":{") + b"\"lifecycleCumulativeWork\":{".len();
            Some(slots(start,true))
        } else {None};
        // The slot arrays are immutable below preflight. This forecasts exactly
        // one allocation-free write per slot, including these two counters.
        meter.response_scalar_slot_writes =
            (FIELD_COUNT * (1 + usize::from(cumulative_slots.is_some()) + usize::from(lifecycle_slots.is_some()))) as u64;
        meter.response_scalar_slot_bytes =
            (FIELD_COUNT * (20 + 32 * (usize::from(cumulative_slots.is_some()) + usize::from(lifecycle_slots.is_some())))) as u64;
        drop(response);
        Self {
            bytes,
            work_slots,
            cumulative_slots, lifecycle_slots, lifecycle_prior: None,
        }
    }
    pub fn bind_lifecycle(&mut self, prior: AcceptedWork) {self.lifecycle_prior=Some(prior);}
    pub fn into_buffer(self) -> Vec<u8> {
        self.bytes
    }
    pub fn finish(
        &mut self,
        meter: &mut Meter,
        prior: Option<AcceptedWork>,
        accepted: bool,
        scope: &Scope,
    ) -> Option<AcceptedWork> {
        let before = scope.snapshot().array();
        #[cfg(test)]
        super::accounting_tests::PUBLICATION_PROBE.with(|p| {
            let mut probe = p.get();
            probe.length_before_final = self.bytes.len();
            p.set(probe);
        });
        meter.allocation_calls = before[0];
        meter.allocated_bytes = before[1];
        meter.deallocation_calls = before[2];
        meter.deallocated_bytes = before[3];
        assert_eq!(meter.abi_output_bytes, self.bytes.len() as u64);
        let total = prior.map(|p| if accepted { p.total(meter) } else { p });
        let (mut writes, mut slot_bytes) = (0u64, 0u64);
        for (start, value) in self.work_slots.iter().zip(meter.values()) {
            let slot = &mut self.bytes[*start..*start + 20];
            write_number(slot, value);
            writes += 1;
            slot_bytes += slot.len() as u64;
            #[cfg(test)]
            super::accounting_tests::record_scalar_slot(slot.len());
        }
        if let (Some(slots), Some(total)) = (&self.cumulative_slots, total) {
            for (start, value) in slots.iter().zip(total.0) {
                let slot = &mut self.bytes[*start..*start + 32];
                write_hex(slot, value);
                writes += 1;
                slot_bytes += slot.len() as u64;
                #[cfg(test)]
                super::accounting_tests::record_scalar_slot(slot.len());
            }
        }
        if let (Some(slots),Some(prior)) = (&self.lifecycle_slots,self.lifecycle_prior) {
            for (start,value) in slots.iter().zip(prior.total(meter).0) {
                let slot=&mut self.bytes[*start..*start+32];write_hex(slot,value);
                writes+=1;slot_bytes+=slot.len() as u64;
                #[cfg(test)] super::accounting_tests::record_scalar_slot(slot.len());
            }
        }
        // All lengths and work were preflighted. This is one scalar-slot patch,
        // NOT a serde/full-response encoding. No extra pass/bytes are invented.
        assert_eq!(writes, meter.response_scalar_slot_writes);
        assert_eq!(slot_bytes, meter.response_scalar_slot_bytes);
        let after = scope.snapshot().array();
        assert_eq!(
            before, after,
            "final scalar writes must be allocation/free invariant"
        );
        #[cfg(test)]
        super::accounting_tests::PUBLICATION_PROBE.with(|p| {
            let mut probe = p.get();
            probe.before_final_pass = before;
            probe.after_final_pass = after;
            probe.length_after_final = self.bytes.len();
            p.set(probe);
        });
        total
    }
    pub fn into_string(self) -> String {
        // SAFETY: serde_json produced UTF-8; finish replaces only ASCII numeric
        // and hexadecimal scalar slots with equal-width ASCII. Ownership move.
        unsafe { String::from_utf8_unchecked(self.bytes) }
    }
}
