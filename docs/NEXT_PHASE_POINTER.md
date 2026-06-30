# Next Phase Pointer

Status: current after Variable Reference Discovery Gate.

## Next Phase

Variable Schema Metadata Shape Gate.

## Why This Is Next

Variable Reference Discovery Gate used Variable Schema / Data Contract Planning
Gate as source of truth and produced JSON-safe discovery evidence for the
accepted published template version target.

The discovery fixture is:

```text
fixtures/variable-reference-discovery.v1.json
```

The discovery gate confirms:

- attachment target is `template-product-report-vnext@v1`;
- accepted validation evidence pointer is
  `repo://fixtures/template-publish-validation-evidence.v1.json`;
- source snapshot retention pointer is
  `repo://fixtures/product-report-vnext.flowdoc.json`;
- source package parse status is `ready`;
- authored field-ref occurrence count is `11`;
- candidate variable count is `6`;
- registry field count is `6`;
- unresolved reference count is `0`;
- unsupported reference count is `0`;
- duplicate candidate id count is `0`;
- blockers before Variable Schema Metadata Shape Gate are empty;
- package/document schema remains unchanged;
- Render API Contract remains deferred.

Variable Schema Metadata Shape Gate is next because discovered variable
references now provide the candidate variable surface that schema metadata can
shape without inventing variables ahead of the template.

Previous source gates retained for traceability:

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

## Variable Schema Metadata Shape Scope

- Confirm Variable Reference Discovery Gate is accepted.
- Use `fixtures/variable-reference-discovery.v1.json` as source of truth.
- Define JSON-safe metadata fields for each candidate variable.
- Attach metadata shape to published template version identity.
- Attach metadata shape to accepted validation evidence pointer.
- Attach metadata shape to source snapshot retention pointer.
- Attach metadata shape to variable reference discovery evidence.
- Preserve occurrence counts and registry cross-reference status.
- Define metadata status names for accepted, warning, blocked, and unknown.
- Define blockers before Data Contract Validation Policy.
- Keep full Variable Schema / Data Contract implementation deferred.
- Keep Render API Contract implementation deferred.

## Carry-Forward Hard Limits

- No package/document schema mutation.
- No package/document schema change.
- No Variable Schema / Data Contract implementation.
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

- Variable Schema Metadata Shape Gate;
- JSON-safe variable metadata shape;
- candidate-variable metadata status policy;
- blockers before Data Contract Validation Policy;
- explicit Render API deferral;
- explicit schema-decision fallback if needed;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.

## Traceability Anchors

- Variable Reference Discovery Gate.
- Variable Schema / Data Contract Planning Gate.
- Template Publish Close Audit.
- Template Publish Accepted Version Metadata Gate.
- No package/document schema change in the planning gate.
- Decision: sufficient for mini infrastructure checkpoint.
- The accepted measurement manifest is enough for a mini checkpoint only; the
  full v1 matrix remains partial and default-measurer replacement remains
  blocked.
