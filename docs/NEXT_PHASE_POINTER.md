# Next Phase Pointer

Status: current after Data Contract Validation Policy Gate.

## Next Phase

Required / Missing / Default Value Policy Gate.

## Why This Is Next

Data Contract Validation Policy Gate used Variable Schema Metadata Shape Gate
as source of truth and accepted a JSON-safe validation policy vocabulary only.
It did not implement runtime data validation.

The data contract validation policy fixture is:

```text
fixtures/data-contract-validation-policy.v1.json
```

The policy gate confirms:

- source metadata shape fixture is
  `repo://fixtures/variable-schema-metadata-shape.v1.json`;
- attachment target is `template-product-report-vnext@v1`;
- accepted validation evidence pointer is
  `repo://fixtures/template-publish-validation-evidence.v1.json`;
- source snapshot retention pointer is
  `repo://fixtures/product-report-vnext.flowdoc.json`;
- candidate variables are `customer.name`, `customer.segment`,
  `prepared.by`, `report.period`, `report.riskLevel`, and `report.total`;
- accepted validation result statuses are `valid`, `valid-with-warnings`, and
  `blocked`;
- type, required-field, missing-value, default-value, unsupported-value,
  unknown-variable, extra-variable, and table-cell policy status vocabulary is
  defined;
- invalid-payload blocker vocabulary is defined;
- table-cell occurrence context remains preserved for
  `metric-value-total-field` and `metric-value-risk-field`;
- blockers before Required / Missing / Default Value Policy Gate are empty;
- runtime data validation remains unimplemented;
- package/document schema remains unchanged;
- Compatibility Policy With Published Template Versions remains deferred;
- Render API Contract remains deferred.

Required / Missing / Default Value Policy Gate is next because validation
policy vocabulary is now accepted, but concrete required-field,
missing-value, and default-value behavior remains deferred.

Previous source gates retained for traceability:

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

## Required Missing Default Policy Scope

- Confirm Data Contract Validation Policy Gate is accepted.
- Use `fixtures/data-contract-validation-policy.v1.json` as source of truth.
- Define JSON-safe Required / Missing / Default Value Policy vocabulary.
- Attach policy vocabulary to published template version identity.
- Attach policy vocabulary to accepted validation evidence pointer.
- Attach policy vocabulary to source snapshot retention pointer.
- Attach policy vocabulary to variable reference discovery evidence.
- Attach policy vocabulary to variable schema metadata shape evidence.
- Attach policy vocabulary to data contract validation policy evidence.
- Preserve candidate variable ids, value type candidates, occurrence counts,
  occurrence contexts, and table-cell value policy statuses.
- Define policy statuses for accepted, warning, blocked, and unknown.
- Define blockers before Compatibility Policy With Published Template
  Versions.
- Keep runtime data validation deferred.
- Keep full Variable Schema / Data Contract implementation deferred.
- Keep Compatibility Policy With Published Template Versions deferred.
- Keep Render API Contract implementation deferred.

## Carry-Forward Hard Limits

- No package/document schema mutation.
- No package/document schema change.
- No Data Contract Validation Policy implementation.
- No runtime data validation implementation.
- No Variable Schema / Data Contract implementation.
- No full Variable Schema / Data Contract implementation.
- No Required / Missing / Default Value behavior implementation.
- No Compatibility Policy With Published Template Versions implementation.
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

- Required / Missing / Default Value Policy Gate;
- JSON-safe required/missing/default policy vocabulary;
- policy status vocabulary;
- blockers before Compatibility Policy With Published Template Versions;
- explicit Render API deferral;
- explicit schema-decision fallback if needed;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.

## Traceability Anchors

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
