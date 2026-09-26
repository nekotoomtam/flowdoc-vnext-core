// Entire module is below lib.rs's cold-session-qa feature gate. This sidecar
// owns test controls only; it is never authored/provider/session authority.
use super::{
    ledger::{Hex, Scope},
    runtime::Runtime,
};
use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Deserialize, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub(super) enum Point {
    CancelBeforeProvider,
    CancelAfterProvider,
    ProviderFailure,
    PublicationRefusal,
    TailRepairProviderFailure,
    CancelAfterTailRepair,
    ReceiptEntropyFailure,
    Stage5AfterLeft,
    Stage5AfterRight,
    Stage5AfterReceipts,
    Stage5AfterOutput,
    Stage5AfterLedger,
}
impl Point {
    fn reason(self) -> &'static str {
        match self {
            Self::CancelBeforeProvider
            | Self::CancelAfterProvider
            | Self::CancelAfterTailRepair => "cancelled",
            Self::ProviderFailure | Self::TailRepairProviderFailure => "provider-failure",
            Self::PublicationRefusal => "publication-refused",
            Self::ReceiptEntropyFailure => "entropy-unavailable",
            Self::Stage5AfterLeft | Self::Stage5AfterRight | Self::Stage5AfterReceipts | Self::Stage5AfterOutput | Self::Stage5AfterLedger => "cancelled",
        }
    }
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Arm {
    receipt: String,
    expected_revision: u64,
    point: Point,
}
#[derive(Default)]
pub(super) struct Controls {
    armed: Option<Arm>,
}
#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct FaultWork {
    pub fault_slot_probes: u64,
    pub fault_checkpoints: u64,
    pub fault_binding_checks: u64,
    pub fault_receipt_comparison_bytes: u64,
    pub fault_revision_checks: u64,
    pub fault_point_checks: u64,
    pub faults_consumed: u64,
    pub faults_cleared: u64,
}
impl Controls {
    #[cfg(test)]
    pub fn clear_for(&mut self, receipt: &str, revision: u64, work: &mut FaultWork) {
        if self.prepare_retirement(receipt, revision, work) {
            self.commit_retirement();
            work.faults_cleared += 1;
        }
    }
    pub fn prepare_retirement(&self, receipt: &str, revision: u64, work: &mut FaultWork) -> bool {
        work.fault_slot_probes += 1;
        let Some(armed) = &self.armed else {
            return false;
        };
        work.fault_binding_checks += 1;
        let same = armed.receipt.len() == receipt.len()
            && armed.receipt.bytes().zip(receipt.bytes()).all(|(a, b)| {
                work.fault_receipt_comparison_bytes += 1;
                a == b
            });
        if same {
            work.fault_revision_checks += 1;
            if armed.expected_revision != revision {
                return false;
            }
            return true;
        }
        false
    }
    pub fn commit_retirement(&mut self) {
        drop(
            self.armed
                .take()
                .expect("retirement was authenticated before publication"),
        );
    }
    pub fn checkpoint(
        &mut self,
        receipt: &str,
        revision: u64,
        point: Point,
        work: &mut FaultWork,
    ) -> Result<(), &'static str> {
        work.fault_checkpoints += 1;
        work.fault_slot_probes += 1;
        let Some(armed) = &self.armed else {
            return Ok(());
        };
        work.fault_binding_checks += 1;
        let same = armed.receipt.len() == receipt.len()
            && armed.receipt.bytes().zip(receipt.bytes()).all(|(a, b)| {
                work.fault_receipt_comparison_bytes += 1;
                a == b
            });
        if !same {
            return Ok(());
        }
        work.fault_revision_checks += 1;
        if armed.expected_revision != revision {
            return Ok(());
        }
        work.fault_point_checks += 1;
        if armed.point != point {
            return Ok(());
        }
        // Reaching this named checkpoint, not merely calling Apply, consumes it.
        self.armed.take();
        work.faults_consumed += 1;
        Err(point.reason())
    }
}

#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
struct ArmWork {
    control_parses: u64,
    session_lookups: u64,
    revision_checks: u64,
    fault_slot_probes: u64,
    faults_armed: u64,
    binding_bytes_retained: u64,
    abi_input_bytes: Hex,
    abi_output_bytes: Hex,
    allocation_calls: Hex,
    allocated_bytes: Hex,
    deallocation_calls: Hex,
    deallocated_bytes: Hex,
    response_encoding_passes: Hex,
    response_encoded_bytes: Hex,
}
#[derive(Serialize)]
struct ArmReply {
    status: &'static str,
    reason: Option<&'static str>,
    work: ArmWork,
}

pub(super) fn arm(rt: &mut Runtime, input: &str) -> String {
    let scope = Scope::begin();
    let mut work = ArmWork {
        abi_input_bytes: Hex(input.len() as u64),
        ..ArmWork::default()
    };
    let result = (|| {
        if input.len() > 1024 {
            return Err("control-input-limit");
        }
        work.control_parses += 1;
        let arm: Arm = serde_json::from_str(input).map_err(|_| "invalid-fault-control")?;
        work.session_lookups += 1;
        let session = rt.sessions.get(&arm.receipt).ok_or("unknown-receipt")?;
        work.revision_checks += 1;
        if session.revision != arm.expected_revision {
            return Err("stale-revision");
        }
        work.fault_slot_probes += 1;
        if rt.faults.armed.is_some() {
            return Err("fault-already-armed");
        }
        work.binding_bytes_retained = arm.receipt.len() as u64;
        rt.faults.armed = Some(arm);
        work.faults_armed += 1;
        Ok(())
    })();
    let mut reply = ArmReply {
        status: if result.is_ok() { "Armed" } else { "NotArmed" },
        reason: result.err(),
        work,
    };
    let mut bytes = Vec::with_capacity(2048);
    serde_json::to_writer(&mut bytes, &reply).unwrap();
    let length = bytes.len();
    let counts = scope.snapshot();
    let work = &mut reply.work;
    work.abi_output_bytes = Hex(length as u64);
    work.allocation_calls = Hex(counts.alloc_calls);
    work.allocated_bytes = Hex(counts.alloc_bytes);
    work.deallocation_calls = Hex(counts.free_calls);
    work.deallocated_bytes = Hex(counts.free_bytes);
    work.response_encoding_passes = Hex(2);
    work.response_encoded_bytes = Hex((2 * length) as u64);
    bytes.clear();
    serde_json::to_writer(&mut bytes, &reply).unwrap();
    assert_eq!(bytes.len(), length);
    assert_eq!(scope.snapshot().alloc_calls, counts.alloc_calls);
    // The raw QA outer transfer meter includes ABI lowering and temporary drops.
    String::from_utf8(bytes).unwrap()
}
