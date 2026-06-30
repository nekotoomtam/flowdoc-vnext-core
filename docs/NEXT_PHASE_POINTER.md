# Next Phase Pointer

Status: current after Variable Schema / Data Contract Planning Gate.

## Next Phase

Variable Reference Discovery Gate.

## Why This Is Next

Variable Schema / Data Contract Planning Gate used Template Publish Close Audit
as source of truth and selected variable reference discovery / candidate
variable list as the first Variable Schema / Data Contract sub-lane.

The accepted published template version metadata remains:

```text
fixtures/template-publish-accepted-version-metadata.v1.json
```

The planning gate confirms:

- Template Publish mini lane is closed for a mini infrastructure checkpoint
  only;
- accepted metadata exists and has `metadataStatus="accepted"`;
- stable accepted target fields are present;
- draft template identity remains separate from published template version
  identity;
- accepted `templateVersionId` is immutable;
- source snapshot and validation evidence pointers are immutable;
- variable/data contract planning can attach to accepted version metadata
  without package/document schema mutation;
- Render API Contract remains deferred until variable/data contract evidence is
  clear.

Variable Reference Discovery Gate is next because variable schema metadata,
data contract validation, missing-value/default/required policy, and
compatibility policy need a stable authored reference inventory first.

Previous source gates retained for traceability:

- Variable Schema / Data Contract Planning Gate.
- Template Publish Close Audit.
- Template Publish Accepted Version Metadata Gate.
- Template Publish Validation Evidence Gate.
- Template Publish / Version Boundary Gate.
- Template Publish / Variable Schema / Render API Planning Gate.
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
- `docs/VARIABLE_SCHEMA_DATA_CONTRACT_PLANNING_GATE.md`
- `docs/TEMPLATE_PUBLISH_CLOSE_AUDIT.md`
- `fixtures/template-publish-accepted-version-metadata.v1.json`
- `docs/TEMPLATE_PUBLISH_ACCEPTED_VERSION_METADATA_GATE.md`
- `docs/TEMPLATE_PUBLISH_VALIDATION_EVIDENCE_GATE.md`
- `fixtures/template-publish-validation-evidence.v1.json`
- `docs/TEMPLATE_PUBLISH_VERSION_BOUNDARY_GATE.md`
- `fixtures/product-report-vnext.flowdoc.json`
- `docs/WORKSPACE_BOUNDARY.md`
- `docs/LEGACY_MIGRATION_GATE.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`

## Variable Reference Discovery Scope

- Confirm the accepted published template version target exists.
- Attach discovery to published template version identity.
- Attach discovery to accepted validation evidence pointer.
- Attach discovery to source snapshot retention pointer.
- Parse the canonical source package for discovery input.
- Produce JSON-safe authored `field-ref` occurrence inventory.
- Produce JSON-safe candidate variable id list.
- Cross-reference candidate variables with the package field registry.
- Record unresolved, unsupported, duplicate, warning, blocked, and unknown
  statuses.
- Define blockers before variable schema metadata shape.
- Keep Variable Schema / Data Contract implementation deferred.
- Keep Render API Contract implementation deferred.

## Carry-Forward Hard Limits

- No package/document schema mutation.
- No package/document schema change.
- No Variable Schema / Data Contract implementation.
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

- Variable Reference Discovery Gate;
- JSON-safe authored reference inventory;
- JSON-safe candidate variable list;
- registry cross-reference status;
- unresolved/unsupported/duplicate status;
- blockers before variable schema metadata shape;
- explicit Render API deferral;
- explicit schema-decision fallback if needed;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.

## Traceability Anchors

- Variable Schema / Data Contract Planning Gate.
- Template Publish Close Audit.
- Template Publish Accepted Version Metadata Gate.
- No package/document schema change in the planning gate.
- Decision: sufficient for mini infrastructure checkpoint.
- The accepted measurement manifest is enough for a mini checkpoint only; the
  full v1 matrix remains partial and default-measurer replacement remains
  blocked.
