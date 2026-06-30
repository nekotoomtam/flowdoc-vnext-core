# Next Phase Pointer

Status: current after Render API Contract Planning Gate.

## Next Phase

Render API Request Envelope Contract Gate.

## Why This Is Next

Render API Contract Planning Gate confirmed that the Variable Schema / Data
Contract mini lane is closed for a mini infrastructure checkpoint only and
that Render API work can now be planned against a stable accepted template
version target plus accepted variable/data evidence.

The planning gate is:

```text
docs/RENDER_API_CONTRACT_PLANNING_GATE.md
```

The planning gate confirms:

- Variable Schema / Data Contract Close Audit is complete;
- the Variable Schema / Data Contract mini lane is closed for a mini
  infrastructure checkpoint only;
- accepted template version target is
  `template-product-report-vnext@v1`;
- accepted validation evidence pointer is
  `repo://fixtures/template-publish-validation-evidence.v1.json`;
- source snapshot retention pointer is
  `repo://fixtures/product-report-vnext.flowdoc.json`;
- the accepted variable/data contract evidence chain exists:
  - `fixtures/variable-reference-discovery.v1.json`;
  - `fixtures/variable-schema-metadata-shape.v1.json`;
  - `fixtures/data-contract-validation-policy.v1.json`;
  - `fixtures/required-missing-default-value-policy.v1.json`;
  - `fixtures/variable-compatibility-policy.v1.json`;
- candidate variables are `customer.name`, `customer.segment`,
  `prepared.by`, `report.period`, `report.riskLevel`, and `report.total`;
- runtime data validation remains unimplemented;
- runtime default application remains unimplemented;
- runtime compatibility enforcement remains unimplemented;
- backend production routes, storage durability, auth/authz, renderer artifact
  bytes, and actual render execution remain out of scope;
- Render API request envelope contract is selected as the first Render API
  Contract sub-lane.

Render API Request Envelope Contract Gate is next because response/status,
render-readiness validation, artifact pointer / job status placeholders, and
error/blocker vocabulary need a stable request shape that references the
published template version identity and variable/data payload contract.

Previous source gates retained for traceability:

- Render API Contract Planning Gate.
- Variable Schema / Data Contract Close Audit.
- Compatibility Policy With Published Template Versions Gate.
- Required / Missing / Default Value Policy Gate.
- Data Contract Validation Policy Gate.
- Variable Schema Metadata Shape Gate.
- Variable Reference Discovery Gate.
- Template Publish Close Audit.
- Template Publish Accepted Version Metadata Gate.
- Template Publish Validation Evidence Gate.
- Template Publish / Version Boundary Gate.
- Measurement Hardening Close Audit.

Historical guard markers retained for pointer tests:

- Text Engine WASM Bindgen Export Dependency Gate.
- Artifact Digest Pinning Execution.
- Native Evidence Summary Gate.
- WASM Evidence Summary Gate.
- Native/WASM Parity Summary Gate.
- Renderer-backed Drift Summary Gate.
- Numeric Drift Threshold Decision.
- Accepted Summary Manifest Population.
- Measurement Hardening Close Audit.
- Template Publish / Variable Schema / Render API Planning Gate.
- Template Publish / Version Boundary Gate.
- Template Publish Validation Evidence Gate.
- Template Publish Accepted Version Metadata Gate.
- Template Publish Close Audit.
- Variable Schema / Data Contract Planning Gate.
- Variable Reference Discovery Gate.
- Variable Schema Metadata Shape Gate.
- Data Contract Validation Policy Gate.
- Required / Missing / Default Value Policy Gate.
- Compatibility Policy With Published Template Versions Gate.
- Variable Schema / Data Contract Close Audit.
- Render API Contract Planning Gate.
- Decision: sufficient for mini infrastructure checkpoint.
- Historical production retry summary retained `sha256ComputedThisPhase=false`.

## Inputs

- `docs/CURRENT_STATUS.md`
- `docs/RENDER_API_CONTRACT_PLANNING_GATE.md`
- `docs/VARIABLE_SCHEMA_DATA_CONTRACT_CLOSE_AUDIT.md`
- `fixtures/template-publish-accepted-version-metadata.v1.json`
- `fixtures/variable-reference-discovery.v1.json`
- `fixtures/variable-schema-metadata-shape.v1.json`
- `fixtures/data-contract-validation-policy.v1.json`
- `fixtures/required-missing-default-value-policy.v1.json`
- `fixtures/variable-compatibility-policy.v1.json`
- `fixtures/product-report-vnext.flowdoc.json`
- `docs/WORKSPACE_BOUNDARY.md`
- `docs/LEGACY_MIGRATION_GATE.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`

## Render API Request Envelope Scope

- Confirm Render API Contract Planning Gate is complete.
- Use `docs/RENDER_API_CONTRACT_PLANNING_GATE.md` as source of truth.
- Define a JSON-safe request envelope contract before implementation.
- Attach the envelope to published template version identity
  `template-product-report-vnext@v1`.
- Carry source snapshot and validation evidence retention pointers.
- Carry variable/data contract evidence pointers.
- Define the variable payload container shape.
- Define policy references for required, missing, default, extra,
  unsupported, and table-cell-context behavior.
- Define compatibility policy references for published template version
  matching.
- Define request correlation, idempotency, and malformed-envelope blocker
  metadata if needed.
- Keep response/status contract deferred until the envelope is accepted.
- Keep render-readiness validation policy deferred until the envelope is
  accepted.
- Keep artifact pointer / job status placeholder policy deferred until the
  envelope is accepted.
- Keep backend production routes, storage durability, auth/authz, renderer
  artifact bytes, and actual render execution out of scope.
- Keep runtime data validation, runtime default application, and runtime
  compatibility enforcement deferred.
- Keep package/document schema unchanged unless a later schema decision gate
  explicitly accepts a change.

## Carry-Forward Hard Limits

- No backend production routes.
- No Render API runtime implementation.
- No renderer artifact bytes.
- No actual render execution.
- No production storage durability claim.
- No auth/authz behavior.
- No runtime data validation implementation.
- No runtime default application.
- No runtime compatibility enforcement.
- No Variable Schema / Data Contract runtime implementation.
- No Variable Schema / Data Contract implementation.
- No full Variable Schema / Data Contract implementation.
- No Render API Contract implementation.
- No package/document schema mutation.
- No package/document schema change.
- No package/document schema change in the planning gate.
- No `measureVNextText(...)` replacement.
- No full measurement production readiness claim.
- No production binding.
- No default measurement replacement.
- No raw evidence in root tests/docs.
- No raw native/WASM/renderer evidence in root tests/docs.
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

- Render API Request Envelope Contract Gate;
- JSON-safe request envelope metadata shape;
- published template version identity reference;
- variable/data contract evidence references;
- request payload container policy;
- request correlation/idempotency policy if needed;
- malformed-envelope blocker vocabulary;
- response/status deferral;
- render-readiness validation deferral;
- backend route/storage/auth deferral;
- renderer artifact byte deferral;
- explicit schema-decision fallback if needed;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.

## Traceability Anchors

- Render API Contract Planning Gate.
- Variable Schema / Data Contract Close Audit.
- Template Publish Accepted Version Metadata Gate.
- `template-product-report-vnext@v1`.
- `repo://fixtures/template-publish-validation-evidence.v1.json`.
- `repo://fixtures/product-report-vnext.flowdoc.json`.
- Candidate variables: `customer.name`, `customer.segment`, `prepared.by`,
  `report.period`, `report.riskLevel`, and `report.total`.
- No package/document schema change in the request envelope gate.
- No backend production routes in the request envelope gate.
- No Render API runtime implementation in the request envelope gate.
- The accepted measurement manifest is enough for a mini checkpoint only; the
  full v1 matrix remains partial and default-measurer replacement remains
  blocked.
