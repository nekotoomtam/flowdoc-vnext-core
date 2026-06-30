# Next Phase Pointer

Status: current after Template Publish Validation Evidence Gate.

## Next Phase

Template Publish Accepted Version Metadata Gate.

## Why This Is Next

Template Publish Validation Evidence Gate used Template Publish / Version
Boundary Gate as source of truth and accepted JSON-safe validation evidence for
a canonical FlowDoc package v2/document v3 template candidate.

The accepted validation evidence fixture is:

```text
fixtures/template-publish-validation-evidence.v1.json
```

The evidence confirms:

- source boundary id `template-publish-version-boundary-v1` is accepted;
- draft template identity remains separate from published template version
  identity;
- Variable Schema / Data Contract remains deferred;
- Render API Contract remains deferred;
- candidate source is canonical package v2/document v3;
- package parse, graph diagnostics, key/data diagnostics, export-readiness,
  measurement, rejected blocker, and retention pointer summaries are JSON-safe;
- rejected publish attempts require explicit blockers and do not mutate
  canonical package schema.

The evidence concludes accepted version metadata can proceed without a
package/document schema mutation. If the metadata gate finds otherwise, it must
stop and route to Template Version Schema Decision Gate.

Previous source gates retained for traceability:

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
- Historical production retry summary retained `sha256ComputedThisPhase=false`;
  digest pinning happened only after the accepted artifact existed.

## Inputs

- `docs/CURRENT_STATUS.md`
- `docs/TEMPLATE_PUBLISH_VALIDATION_EVIDENCE_GATE.md`
- `fixtures/template-publish-validation-evidence.v1.json`
- `docs/TEMPLATE_PUBLISH_VERSION_BOUNDARY_GATE.md`
- `fixtures/template-publish-version-boundary.v1.json`
- `fixtures/product-report-vnext.flowdoc.json`
- `docs/WORKSPACE_BOUNDARY.md`
- `docs/LEGACY_MIGRATION_GATE.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`

## Template Publish Accepted Version Metadata Gate Scope

- Populate JSON-safe accepted version metadata for the validated canonical
  package v2/document v3 template candidate.
- Carry `templateId`, `templateVersionId`, `versionOrdinal`, source package id,
  package/document versions, lifecycle policy, source snapshot pointer, and
  validation evidence pointer.
- Require accepted metadata to reference the accepted validation evidence.
- Preserve draft template identity as separate from accepted published version
  identity.
- Preserve rejected blockers if metadata cannot be represented without schema
  changes.
- Keep Variable Schema / Data Contract deferred.
- Keep Render API Contract deferred.

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

- Template Publish Accepted Version Metadata Gate;
- JSON-safe accepted version metadata fixture;
- validation evidence pointer;
- source snapshot retention pointer;
- explicit deferred Variable Schema / Data Contract lane;
- explicit deferred Render API Contract lane;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.

## Traceability Anchors

- Template Publish Validation Evidence Gate.
- Template Publish / Version Boundary Gate.
- No package/document schema change in the planning gate.
- Decision: sufficient for mini infrastructure checkpoint.
- The accepted measurement manifest is enough for a mini checkpoint only; the
  full v1 matrix remains partial and default-measurer replacement remains
  blocked.
