# Next Phase Pointer

Status: current after Required / Missing / Default Value Policy Gate.

## Next Phase

Compatibility Policy With Published Template Versions Gate.

## Why This Is Next

Required / Missing / Default Value Policy Gate used Data Contract Validation
Policy Gate as source of truth and accepted concrete JSON-safe policy
metadata for required, missing, and default-value behavior. It did not
implement runtime data validation or runtime default application.

The required/missing/default policy fixture is:

```text
fixtures/required-missing-default-value-policy.v1.json
```

The policy gate confirms:

- source data contract validation policy fixture is
  `repo://fixtures/data-contract-validation-policy.v1.json`;
- source policy status is `accepted-vocabulary-only`;
- attachment target is `template-product-report-vnext@v1`;
- accepted validation evidence pointer is
  `repo://fixtures/template-publish-validation-evidence.v1.json`;
- source snapshot retention pointer is
  `repo://fixtures/product-report-vnext.flowdoc.json`;
- candidate variables are `customer.name`, `customer.segment`,
  `prepared.by`, `report.period`, `report.riskLevel`, and `report.total`;
- validation result statuses are `valid`, `valid-with-warnings`, and
  `blocked`;
- missing required `report.total` blocks because it has no default metadata;
- required variables with default metadata and optional variables are
  `valid-with-warnings` when missing;
- defaults are metadata only and are not applied at runtime;
- extra variables are `valid-with-warnings` unless they conflict with known
  variable ids;
- table-cell occurrence context remains preserved for
  `metric-value-total-field` and `metric-value-risk-field`;
- table-cell context mismatch remains blocked;
- blockers before Compatibility Policy With Published Template Versions Gate
  are empty;
- runtime data validation remains unimplemented;
- runtime default application remains unimplemented;
- package/document schema remains unchanged;
- Render API Contract remains deferred.

Compatibility Policy With Published Template Versions Gate is next because
required/missing/default behavior is now accepted as policy metadata, but
version compatibility rules are still status-only and deferred.

Previous source gates retained for traceability:

- Required / Missing / Default Value Policy Gate.
- Data Contract Validation Policy Gate.
- Variable Schema Metadata Shape Gate.
- Variable Reference Discovery Gate.
- Variable Schema / Data Contract Planning Gate.
- Template Publish Close Audit.
- Template Publish / Variable Schema / Render API Planning Gate.
- Template Publish Accepted Version Metadata Gate.
- Template Publish Validation Evidence Gate.
- Template Publish / Version Boundary Gate.
- Measurement Hardening Close Audit.
- Accepted Summary Manifest Population.
- Numeric Drift Threshold Decision.
- Renderer-backed Drift Summary Gate.
- Native/WASM Parity Summary Gate.
- WASM Evidence Summary Gate.
- Native Evidence Summary Gate.
- Artifact Digest Pinning Execution.
- Text Engine WASM Bindgen Export Dependency Gate.
- Historical production retry summary retained `sha256ComputedThisPhase=false`.

## Inputs

- `docs/CURRENT_STATUS.md`
- `docs/REQUIRED_MISSING_DEFAULT_VALUE_POLICY_GATE.md`
- `fixtures/required-missing-default-value-policy.v1.json`
- `docs/DATA_CONTRACT_VALIDATION_POLICY_GATE.md`
- `fixtures/data-contract-validation-policy.v1.json`
- `docs/VARIABLE_SCHEMA_METADATA_SHAPE_GATE.md`
- `fixtures/variable-schema-metadata-shape.v1.json`
- `docs/VARIABLE_REFERENCE_DISCOVERY_GATE.md`
- `fixtures/variable-reference-discovery.v1.json`
- `docs/VARIABLE_SCHEMA_DATA_CONTRACT_PLANNING_GATE.md`
- `fixtures/template-publish-accepted-version-metadata.v1.json`
- `fixtures/product-report-vnext.flowdoc.json`
- `docs/TEMPLATE_PUBLISH_CLOSE_AUDIT.md`
- `docs/WORKSPACE_BOUNDARY.md`
- `docs/LEGACY_MIGRATION_GATE.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`

## Compatibility Policy Scope

- Confirm Required / Missing / Default Value Policy Gate is accepted.
- Use `fixtures/required-missing-default-value-policy.v1.json` as source of
  truth.
- Define JSON-safe Compatibility Policy With Published Template Versions.
- Attach compatibility policy to published template version identity.
- Attach compatibility policy to accepted validation evidence pointer.
- Attach compatibility policy to source snapshot retention pointer.
- Attach compatibility policy to variable reference discovery evidence.
- Attach compatibility policy to variable schema metadata shape evidence.
- Attach compatibility policy to data contract validation policy evidence.
- Attach compatibility policy to required/missing/default value policy
  evidence.
- Preserve candidate variable ids, required statuses, default metadata, missing
  value behavior, extra-variable policy, and table-cell mismatch policy.
- Define compatibility statuses for accepted, warning, blocked, and unknown.
- Define blockers before Render API Contract planning.
- Keep runtime data validation deferred.
- Keep runtime default application deferred.
- Keep full Variable Schema / Data Contract implementation deferred.
- Keep Render API Contract implementation deferred.

## Carry-Forward Hard Limits

- No package/document schema mutation.
- No package/document schema change.
- No runtime data validation implementation.
- No runtime default application.
- No Variable Schema / Data Contract implementation.
- No full Variable Schema / Data Contract implementation.
- No runtime compatibility enforcement.
- No Render API Contract implementation.
- No backend production routes.
- No production storage durability claim.
- No renderer artifact bytes.
- No auth/authz behavior.
- No `measureVNextText(...)` replacement.
- No full measurement production readiness claim.
- No production binding.
- No default measurement replacement.
- No raw evidence in root tests/docs.
- No raw native/WASM evidence in root tests/docs.
- No raw native/WASM evidence in root docs/tests.
- No raw native evidence in root docs/tests.
- No raw WASM evidence in root docs/tests.
- No raw renderer evidence in root docs/tests.
- No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.
- No pagination mutation.
- No production renderer-backed measurement binding.
- No production PDF/DOCX renderer work.
- No production contenteditable implementation.
- No collaboration/offline behavior.
- No legacy editor runtime copy.

## Expected Output

- Compatibility Policy With Published Template Versions Gate;
- JSON-safe compatibility policy metadata;
- compatibility status vocabulary;
- blockers before Render API Contract planning;
- explicit Render API deferral;
- explicit schema-decision fallback if needed;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.

## Traceability Anchors

- Required / Missing / Default Value Policy Gate.
- Data Contract Validation Policy Gate.
- Variable Schema Metadata Shape Gate.
- Variable Reference Discovery Gate.
- Variable Schema / Data Contract Planning Gate.
- Template Publish Close Audit.
- Template Publish Accepted Version Metadata Gate.
- No package/document schema change in the planning gate.
- Decision: sufficient for mini infrastructure checkpoint.
- The accepted measurement manifest is enough for a mini checkpoint only; the
  full v1 matrix remains partial and default-measurer replacement remains
  blocked.
