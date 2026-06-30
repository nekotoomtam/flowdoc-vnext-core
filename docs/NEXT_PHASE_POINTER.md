# Next Phase Pointer

Status: current after Template Publish / Version Boundary Gate.

## Next Phase

Template Publish Validation Evidence Gate.

## Why This Is Next

Template Publish / Version Boundary Gate used Template Publish / Variable
Schema / Render API Planning Gate as source of truth and accepted a
publish/version boundary for canonical FlowDoc template candidates.

The accepted boundary fixture is:

```text
fixtures/template-publish-version-boundary.v1.json
```

The boundary defines:

- draft template identity as mutable authoring/review identity;
- published template version identity as immutable accepted-version identity;
- JSON-safe published version metadata;
- canonical package v2/document v3 as the publishable candidate source;
- validation evidence shape for package parse, graph diagnostics, key/data
  diagnostics, export-readiness, measurement status, and blockers;
- retention pointer evidence without claiming production storage durability;
- rollback, deprecation, and superseding policy names.

The boundary concludes a schema decision is not required before validation
evidence because the required identity/version semantics can be represented as
external JSON-safe metadata without mutating package v2/document v3.

Previous source gates retained for traceability:

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
- `docs/TEMPLATE_PUBLISH_VERSION_BOUNDARY_GATE.md`
- `fixtures/template-publish-version-boundary.v1.json`
- `docs/TEMPLATE_VARIABLE_RENDER_API_PLANNING_GATE.md`
- `fixtures/product-report-vnext.flowdoc.json`
- `docs/WORKSPACE_BOUNDARY.md`
- `docs/LEGACY_MIGRATION_GATE.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`

## Template Publish Validation Evidence Gate Scope

- Produce JSON-safe validation evidence for a canonical package v2/document v3
  template candidate.
- Confirm package parse status.
- Report graph diagnostics status and issue count.
- Report key/data diagnostics status, error count, and warning count.
- Report export-readiness status without producing renderer artifact bytes.
- Report measurement status while preserving the mini-checkpoint-only
  measurement carry-forward.
- Report blockers for rejected publish attempts.
- Attach validation evidence to the draft/published version identity boundary.
- Attach source snapshot and validation evidence retention pointers without
  claiming production storage durability.
- Keep Variable Schema / Data Contract deferred.
- Keep Render API Contract deferred.

## Carry-Forward Hard Limits

- No backend production routes.
- No production storage durability claim.
- No renderer artifact bytes.
- No auth/authz behavior.
- No package/document schema change.
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

- Template Publish Validation Evidence Gate;
- JSON-safe validation evidence for a canonical template candidate;
- package parse, graph, key/data, export-readiness, measurement, and blocker
  status summaries;
- retention pointer evidence;
- explicit deferred Variable Schema / Data Contract lane;
- explicit deferred Render API Contract lane;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.

## Traceability Anchors

- Template Publish / Version Boundary Gate.
- Template Publish / Variable Schema / Render API Planning Gate.
- No package/document schema change in the planning gate.
- Measurement Hardening Close Audit.
- Decision: sufficient for mini infrastructure checkpoint.
- The accepted measurement manifest is enough for a mini checkpoint only; the
  full v1 matrix remains partial and default-measurer replacement remains
  blocked.
