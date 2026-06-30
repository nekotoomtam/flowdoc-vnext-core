# Next Phase Pointer

Status: current after Variable Schema / Data Contract Close Audit.

## Next Phase

Render API Contract Planning Gate.

## Why This Is Next

Variable Schema / Data Contract Close Audit confirmed that the variable/data
mini lane can close for a mini infrastructure checkpoint only. The accepted
evidence chain now covers reference discovery, metadata shape, data contract
validation vocabulary, required/missing/default policy, and compatibility
policy for the accepted published template version target.

The close audit is:

```text
docs/VARIABLE_SCHEMA_DATA_CONTRACT_CLOSE_AUDIT.md
```

The close audit confirms:

- Compatibility Policy With Published Template Versions Gate is complete;
- `fixtures/variable-compatibility-policy.v1.json` exists;
- the prior evidence chain exists:
  - `fixtures/variable-reference-discovery.v1.json`;
  - `fixtures/variable-schema-metadata-shape.v1.json`;
  - `fixtures/data-contract-validation-policy.v1.json`;
  - `fixtures/required-missing-default-value-policy.v1.json`;
  - `fixtures/variable-compatibility-policy.v1.json`;
- candidate variables are `customer.name`, `customer.segment`,
  `prepared.by`, `report.period`, `report.riskLevel`, and `report.total`;
- compatibility statuses are `compatible`, `compatible-with-warnings`,
  `incompatible-blocked`, and `unknown`;
- published template version mismatch, known variable id changes, value type
  candidate changes, added required variables without default metadata,
  removed required variables, and table-cell context changes are blocked
  unless explicit accepted metadata says otherwise;
- display-label-only changes, added optional variables, added required
  variables with default metadata, removed optional variables, alias records,
  and superseding-version records are warning-compatible;
- Render API Contract remains deferred until this close audit accepts the
  mini lane;
- runtime data validation remains unimplemented;
- runtime default application remains unimplemented;
- runtime compatibility enforcement remains unimplemented;
- package/document schema remains unchanged;
- the Variable Schema / Data Contract mini lane can close for a mini
  infrastructure checkpoint only;
- the selected next lane is Render API Contract Planning Gate.

Render API Contract Planning Gate is next because the accepted template
version target and accepted variable/data evidence now provide enough
metadata to plan render request/response contracts without implementing
renderer artifact production, backend routes, storage durability, auth/authz,
or runtime validation.

Previous source gates retained for traceability:

- Variable Schema / Data Contract Close Audit.
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
- `docs/VARIABLE_SCHEMA_DATA_CONTRACT_CLOSE_AUDIT.md`
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

## Render API Planning Scope

- Confirm Variable Schema / Data Contract Close Audit is complete.
- Use `docs/VARIABLE_SCHEMA_DATA_CONTRACT_CLOSE_AUDIT.md` as source of truth.
- Use accepted published template version metadata as the stable template
  target.
- Use accepted variable/data contract mini-lane evidence as input contract
  evidence.
- Define Render API Contract planning evidence before implementation.
- Define request/response contract boundaries as JSON-safe metadata only.
- Preserve retention pointer requirements for template source and validation
  evidence.
- Keep renderer artifact bytes out of scope.
- Keep backend production routes out of scope.
- Keep runtime validation, runtime default application, runtime compatibility
  enforcement, and full Variable Schema / Data Contract runtime behavior
  deferred.
- Keep package/document schema unchanged unless a later schema decision gate
  explicitly accepts a change.

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

- Render API Contract Planning Gate;
- ranked Render API contract sub-lanes;
- selected first Render API contract sub-lane;
- required JSON-safe evidence for the first sub-lane;
- explicit backend route/storage/auth deferral;
- explicit renderer artifact byte deferral;
- explicit schema-decision fallback if needed;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.

## Traceability Anchors

- Variable Schema / Data Contract Close Audit.
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
