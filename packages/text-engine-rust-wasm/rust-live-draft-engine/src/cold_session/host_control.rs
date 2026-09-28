use super::command_work::Meter;
use serde::Deserialize;

// A separate, one-call execution envelope. The opaque identity is minted by
// the host; Rust authenticates its binding before observing cancellation.
#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Control {
    operation_id: String,
    receipt: String,
    expected_revision: u64,
    right_receipt: Option<String>,
    right_revision: Option<u64>,
    run_index: Option<usize>,
    maintenance_operation: Option<String>,
    maintenance_target: Option<String>,
    provider_id: Option<String>,
    provider_revision: Option<String>,
    cancelled: bool,
}

pub(super) fn observe(
    raw: Option<&str>, meter: &mut Meter, receipt: &str, revision: u64,
    right: Option<(&str, u64)>, recovery: Option<(&str, &str, usize, &str, &str)>,
) -> Result<(), &'static str> {
    let Some(raw) = raw else { return Ok(()); };
    meter.command_parse_calls += 1;
    let c: Control = serde_json::from_str(raw).map_err(|_| "invalid-host-control")?;
    meter.command_auth_receipt_bytes += (c.operation_id.len() + c.receipt.len()
        + c.right_receipt.as_ref().map_or(0, String::len)) as u64;
    meter.command_revision_checks += 1 + u64::from(right.is_some());
    if c.operation_id.len() < 16 || c.receipt != receipt || c.expected_revision != revision
        || c.right_receipt.as_deref() != right.map(|r| r.0)
        || c.right_revision != right.map(|r| r.1)
        || c.maintenance_operation.as_deref() != recovery.map(|r| r.0)
        || c.maintenance_target.as_deref() != recovery.map(|r| r.1)
        || c.run_index != recovery.map(|r| r.2)
        || c.provider_id.as_deref() != recovery.map(|r| r.3)
        || c.provider_revision.as_deref() != recovery.map(|r| r.4) {
        return Err("invalid-host-control");
    }
    if c.cancelled { Err("cancelled") } else { Ok(()) }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn separate_control_authenticates_all_capabilities_and_exact_provider() {
        let raw=json!({"operationId":"opaque-operation-123", "receipt":"left", "expectedRevision":2,
            "rightReceipt":"right","rightRevision":3,"runIndex":null,"maintenanceOperation":null,"maintenanceTarget":null,"providerId":null,
            "providerRevision":null,"cancelled":true}).to_string();
        let mut meter=Meter::default();
        assert_eq!(observe(Some(&raw),&mut meter,"left",2,Some(("right",3)),None),Err("cancelled"));
        assert_eq!(observe(Some(&raw),&mut Meter::default(),"left",2,Some(("other",3)),None),Err("invalid-host-control"));
        assert_eq!(meter.command_parse_calls,1);
        assert_eq!(meter.command_auth_receipt_bytes, "opaque-operation-123".len() as u64+"left".len() as u64+"right".len() as u64);
        let recovery=json!({"operationId":"opaque-operation-456", "receipt":"left", "expectedRevision":2,
            "rightReceipt":null,"rightRevision":null,"runIndex":0,"maintenanceOperation":"recover","maintenanceTarget":"plan","providerId":"provider",
            "providerRevision":"v1","cancelled":true}).to_string();
        assert_eq!(observe(Some(&recovery),&mut Meter::default(),"left",2,None,Some(("recover","plan",0,"provider","v1"))),Err("cancelled"));
        assert_eq!(observe(Some(&recovery),&mut Meter::default(),"left",2,None,Some(("evict","plan",0,"provider","v1"))),Err("invalid-host-control"));
        assert_eq!(observe(Some(&recovery),&mut Meter::default(),"left",2,None,Some(("recover","shard",0,"provider","v1"))),Err("invalid-host-control"));
        assert_eq!(observe(Some(&recovery),&mut Meter::default(),"left",2,None,Some(("recover","plan",1,"provider","v1"))),Err("invalid-host-control"));
        assert_eq!(observe(Some(&recovery),&mut Meter::default(),"left",2,None,Some(("recover","plan",0,"provider","v2"))),Err("invalid-host-control"));
    }
}
