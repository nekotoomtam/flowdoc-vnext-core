// One family owns one cold charge and one fixed-size attempt accumulator.
// Sibling accepted totals overlap by design; only unique completed commands
// add to the family accumulator. No vector, parent chain or event-history scan.
use super::{
    command_work::{AcceptedWork, Meter},
    ledger::Work,
};
use std::{cell::RefCell, rc::Rc};
#[derive(Default, Clone)]
pub(super) struct Lifecycle {
    pub cold_id: String,
    pub cold: Work,
    pub cold_allocations: [u64; 4],
    pub cold_input_bytes: u64,
    pub cold_output_bytes: u64,
    pub attempts: AcceptedWork,
    pub structural_attempts: super::structural_work::Totals,
    pub accepted_events: u64,
    pub no_op_events: u64,
    pub maintenance_events: u64,
    pub eviction_events: u64,
    pub recovery_events: u64,
    pub unchanged_maintenance_events: u64,
    pub rejected_attempts: u64,
    pub disposals: u64,
}
pub(super) type Shared = Rc<RefCell<Lifecycle>>;
impl Lifecycle {
    // Reserve one complete bounded attempt before any provider or semantic work.
    // Exhaustion keeps the family frozen; the wire reports the unaccumulated
    // actual attempt separately instead of wrapping or losing it silently.
    pub fn can_record(&self) -> Result<(), &'static str> {
        for value in self.attempts.0 {
            value
                .checked_add(u128::from(u64::MAX))
                .ok_or("lifecycle-overflow")?;
        }
        self.structural_attempts
            .preflight()
            .map_err(|_| "lifecycle-overflow")?;
        self.accepted_events
            .checked_add(1)
            .ok_or("lifecycle-overflow")?;
        self.no_op_events.checked_add(1).ok_or("lifecycle-overflow")?;
        self.maintenance_events.checked_add(1).ok_or("lifecycle-overflow")?;
        self.eviction_events.checked_add(1).ok_or("lifecycle-overflow")?;
        self.recovery_events.checked_add(1).ok_or("lifecycle-overflow")?;
        self.unchanged_maintenance_events.checked_add(1).ok_or("lifecycle-overflow")?;
        self.rejected_attempts
            .checked_add(1)
            .ok_or("lifecycle-overflow")?;
        self.disposals.checked_add(1).ok_or("lifecycle-overflow")?;
        Ok(())
    }
    pub fn preflight(&self, _m: &Meter) -> Result<(), &'static str> {
        self.can_record()
    }
    pub fn finish(&mut self, m: &Meter, accepted: bool, no_op: bool) {
        self.attempts = self.attempts.total(m);
        self.structural_attempts = self.structural_attempts.total(&m.structural);
        if accepted {
            self.accepted_events += 1;
        } else if no_op {
            self.no_op_events += 1;
        } else {
            self.rejected_attempts += 1;
        }
    }
    pub fn finish_maintenance(&mut self, m: &Meter, status: &str, rejected: bool) {
        self.attempts = self.attempts.total(m);
        self.structural_attempts = self.structural_attempts.total(&m.structural);
        match status {
            "Evicted" => { self.maintenance_events += 1; self.eviction_events += 1; },
            "Recovered" => { self.maintenance_events += 1; self.recovery_events += 1; },
            "Unchanged" => { self.unchanged_maintenance_events += 1; },
            _ => {},
        }
        if rejected { self.rejected_attempts += 1; }
    }
}
