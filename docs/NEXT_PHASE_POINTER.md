# Next Phase Pointer

Status: current after Compatibility Policy With Published Template Versions Gate.

## Next Phase

Variable Schema / Data Contract Close Audit.

## Why This Is Next

Compatibility Policy With Published Template Versions Gate used Required /
Missing / Default Value Policy Gate as source of truth and accepted JSON-safe
compatibility policy metadata between variable/data contract evidence and the
accepted published template version target. It did not implement runtime data
validation, runtime default application, runtime compatibility enforcement, or
Render API Contract.

The compatibility policy fixture is:

```text
fixtures/variable-compatibility-policy.v1.json
```

The policy gate confirms:

- source required/missing/default policy fixture is
  `repo://fixtures/required-missing-default-value-policy.v1.json`;
- source policy status is `accepted-policy-metadata-only`;
- attachment target is `template-product-report-vnext@v1`;
- accepted validation evidence pointer is
  `repo://fixtures/template-publish-validation-evidence.v1.json`;
- source snapshot retention pointer is
  `repo://fixtures/product-report-vnext.flowdoc.json`;
- candidate variables are `customer.name`, `customer.segment`,
  `prepared.by`, `report.period`, `report.riskLevel`, and `report.total`;
- per-variable required/missing/default policy is preserved;
- extra variables remain `valid-with-warnings` unless they conflict with
  known variable ids;
- runtime default application remains unimplemented;
- compatibility statuses are `compatible`, `compatible-with-warnings`,
  `incompatible-blocked`, and `unknown`;
- compatibility dimensions cover variable id stability, value type candidate
  stability, required/optional policy changes, default metadata changes,
  table-cell context changes, removed variables, added variables,
  renamed/aliased variables, and published template version identity match;
- removing required variables, changing known variable ids, changing value
  type candidates, adding required variables without default metadata,
  changing table-cell context for table-bound variables, and mismatching
  published template version identity are incompatible blockers unless an
  explicit accepted compatibility record says otherwise;
- display-label-only changes, added optional variables, optional removals,
  default metadata changes, accepted alias records, and accepted superseding
  version records are compatible-with-warnings;
- blockers before Variable Schema / Data Contract Close Audit are empty;
- runtime data validation remains unimplemented;
- runtime default application remains unimplemented;
- runtime compatibility enforcement remains unimplemented;
- package/document schema remains unchanged;
- Render API Contract remains deferred.

Variable Schema / Data Contract Close Audit is next because the variable/data
lane now has accepted JSON-safe evidence for discovery, metadata shape, data
contract validation vocabulary, required/missing/default policy, and
compatibility policy. The audit should decide whether that mini lane can
close for a mini infrastructure checkpoint before Render API Contract
planning.

Previous source gates retained for traceability:

- Compatibility Policy With Published Template Versions Gate.
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
- `docs/VARIABLE_COMPATIBILITY_POLICY_GATE.md`
- `fixtures/variable-compatibility-policy.v1.json`
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

## Close Audit Scope

- Confirm Compatibility Policy With Published Template Versions Gate is
  accepted.
- Use `fixtures/variable-compatibility-policy.v1.json` as source of truth.
- Confirm Variable Reference Discovery Gate evidence is accepted.
- Confirm Variable Schema Metadata Shape Gate evidence is accepted.
- Confirm Data Contract Validation Policy Gate vocabulary is accepted.
- Confirm Required / Missing / Default Value Policy Gate metadata is accepted.
- Confirm compatibility policy metadata is accepted.
- Confirm the published template version target is
  `template-product-report-vnext@v1`.
- Confirm accepted validation evidence and source snapshot retention pointers
  remain immutable.
- Confirm package/document schema is not mutated.
- Confirm runtime validation, runtime defaults, runtime compatibility
  enforcement, and Render API remain deferred.
- Decide whether the Variable Schema / Data Contract mini lane can close for a
  mini infrastructure checkpoint.
- If the lane can close, recommend Render API Contract Planning Gate next.
- If it cannot close, list exact blockers and route to the appropriate
  schema or metadata decision gate.

## Carry-Forward Hard Limits

- No package/document schema mutation.
- No package/document schema change.
- No runtime data validation implementation.
- No runtime default application.
- No runtime compatibility enforcement.
- No Variable Schema / Data Contract implementation.
- No Variable Schema / Data Contract runtime implementation.
- No full Variable Schema / Data Contract implementation.
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

- Variable Schema / Data Contract Close Audit;
- close decision for the variable/data mini lane;
- explicit accepted evidence list;
- explicit blockers if the lane cannot close;
- next-lane recommendation, likely Render API Contract Planning Gate if the
  close audit passes;
- explicit schema-decision fallback if needed;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.

## Traceability Anchors

- Compatibility Policy With Published Template Versions Gate.
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
