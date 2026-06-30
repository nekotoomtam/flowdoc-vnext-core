# Next Phase Pointer

Status: current after Variable Schema Metadata Shape Gate.

## Next Phase

Data Contract Validation Policy Gate.

## Why This Is Next

Variable Schema Metadata Shape Gate used Variable Reference Discovery Gate as
source of truth and produced JSON-safe metadata shape evidence for all
discovered candidate variables.

The metadata shape fixture is:

```text
fixtures/variable-schema-metadata-shape.v1.json
```

The metadata shape gate confirms:

- source discovery evidence fixture is
  `repo://fixtures/variable-reference-discovery.v1.json`;
- attachment target is `template-product-report-vnext@v1`;
- accepted validation evidence pointer is
  `repo://fixtures/template-publish-validation-evidence.v1.json`;
- source snapshot retention pointer is
  `repo://fixtures/product-report-vnext.flowdoc.json`;
- discovery field-ref occurrence count is `11`;
- discovery candidate variable count is `6`;
- registry field count is `6`;
- unresolved reference count is `0`;
- unsupported reference count is `0`;
- duplicate candidate id count is `0`;
- metadata rows exist for all six candidate variable ids;
- each row carries variable id, source field key, value type candidate,
  display label candidate, occurrence count, occurrence context summary,
  registry status, and deferred policy status fields;
- table-cell occurrence context remains preserved for
  `metric-value-total-field` and `metric-value-risk-field`;
- blockers before Data Contract Validation Policy Gate are empty;
- package/document schema remains unchanged;
- Render API Contract remains deferred.

Data Contract Validation Policy Gate is next because variable metadata shape
is now accepted, but validation behavior, required/missing/default behavior,
and compatibility policy remain deferred.

Previous source gates retained for traceability:

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

## Data Contract Validation Policy Scope

- Confirm Variable Schema Metadata Shape Gate is accepted.
- Use `fixtures/variable-schema-metadata-shape.v1.json` as source of truth.
- Define JSON-safe data contract validation policy status fields.
- Attach validation policy to published template version identity.
- Attach validation policy to accepted validation evidence pointer.
- Attach validation policy to source snapshot retention pointer.
- Attach validation policy to variable reference discovery evidence.
- Attach validation policy to variable schema metadata shape evidence.
- Preserve candidate variable ids, value type candidates, display label
  candidates, occurrence counts, and occurrence context summaries.
- Define validation statuses for accepted, warning, blocked, and unknown.
- Define blockers before Required / Missing / Default Value Policy.
- Keep full Variable Schema / Data Contract implementation deferred.
- Keep Required / Missing / Default Value Policy implementation deferred.
- Keep Render API Contract implementation deferred.

## Carry-Forward Hard Limits

- No package/document schema mutation.
- No package/document schema change.
- No Variable Schema / Data Contract implementation.
- No full Variable Schema / Data Contract implementation.
- No Data Contract Validation Policy implementation.
- No Required / Missing / Default Value Policy implementation.
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

- Data Contract Validation Policy Gate;
- JSON-safe data contract validation policy shape;
- validation status vocabulary;
- blockers before Required / Missing / Default Value Policy;
- explicit Render API deferral;
- explicit schema-decision fallback if needed;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.

## Traceability Anchors

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
