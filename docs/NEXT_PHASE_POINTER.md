# Next Phase Pointer

Status: current after Template Publish Close Audit.

## Next Phase

Variable Schema / Data Contract Planning Gate.

## Why This Is Next

Template Publish Close Audit used Template Publish Accepted Version Metadata
Gate as source of truth and decided the Template Publish mini lane can close
for a mini infrastructure checkpoint only.

The accepted metadata fixture remains:

```text
fixtures/template-publish-accepted-version-metadata.v1.json
```

The close audit confirms:

- accepted metadata exists and has `metadataStatus="accepted"`;
- source validation evidence is accepted;
- draft template identity remains separate from published template version
  identity;
- accepted `templateVersionId` is immutable;
- source snapshot and validation evidence pointers are immutable;
- accepted metadata is represented without package/document schema changes;
- export-readiness warning visibility is preserved as
  `exportReadinessStatus="ready-with-warnings"` and
  `exportReadinessWarningCount=1`;
- measurement remains `mini-checkpoint-only`;
- ready-with-warnings is acceptable for closing the Template Publish mini lane
  because warning visibility is preserved and no renderer artifact or
  production renderer readiness is claimed.

Variable Schema / Data Contract Planning Gate is next because Template Publish
now provides a stable accepted template/version target for variable and data
contracts to attach to.

Previous source gates retained for traceability:

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
- `docs/TEMPLATE_PUBLISH_CLOSE_AUDIT.md`
- `docs/TEMPLATE_PUBLISH_ACCEPTED_VERSION_METADATA_GATE.md`
- `fixtures/template-publish-accepted-version-metadata.v1.json`
- `docs/TEMPLATE_PUBLISH_VALIDATION_EVIDENCE_GATE.md`
- `fixtures/template-publish-validation-evidence.v1.json`
- `docs/TEMPLATE_PUBLISH_VERSION_BOUNDARY_GATE.md`
- `fixtures/template-publish-version-boundary.v1.json`
- `fixtures/product-report-vnext.flowdoc.json`
- `docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md`
- `docs/WORKSPACE_BOUNDARY.md`
- `docs/LEGACY_MIGRATION_GATE.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`

## Variable Schema / Data Contract Planning Scope

- Confirm Template Publish mini lane is closed for a mini infrastructure
  checkpoint only.
- Confirm full measurement production readiness remains blocked.
- Confirm production binding and default-measurer replacement remain blocked.
- Confirm the accepted template version metadata is the attachment target for
  variable/data contract planning.
- Rank variable schema/data contract responsibilities before implementation.
- Define JSON-safe evidence required for the first variable schema/data
  contract gate.
- Decide whether any variable/data facts require a later Template Version
  Schema Decision Gate.
- Keep Render API Contract implementation deferred until variable/data contract
  evidence is clear.

## Carry-Forward Hard Limits

- No package/document schema mutation.
- No package/document schema change.
- No backend production routes.
- No production storage durability claim.
- No renderer artifact bytes.
- No auth/authz behavior.
- No Variable Schema / Data Contract implementation.
- No Render API Contract implementation.
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

- Variable Schema / Data Contract planning gate;
- selected first variable/data contract sub-lane;
- evidence required before implementation;
- explicit Render API deferral;
- explicit schema-decision fallback if needed;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.

## Traceability Anchors

- Template Publish Close Audit.
- Template Publish Accepted Version Metadata Gate.
- Template Publish Validation Evidence Gate.
- No package/document schema change in the planning gate.
- Decision: sufficient for mini infrastructure checkpoint.
- The accepted measurement manifest is enough for a mini checkpoint only; the
  full v1 matrix remains partial and default-measurer replacement remains
  blocked.
