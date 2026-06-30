# Next Phase Pointer

Status: current after Template Publish / Variable Schema / Render API Planning Gate.

## Next Phase

Template Publish / Version Boundary Gate.

## Why This Is Next

Template Publish / Variable Schema / Render API Planning Gate used Measurement
Hardening Close Audit as source of truth and ranked the next non-measurement
mini infrastructure lanes.

Selected first lane: Template Publish / Version Boundary.

Lane ranking:

1. Template Publish / Version Boundary.
2. Variable Schema / Data Contract.
3. Render API Contract.

Template Publish / Version Boundary comes first because Variable Schema and
Render API work need a stable published template/version target before they
can safely attach their contracts. Starting with Variable Schema or Render API
would risk binding data and API semantics to mutable draft template state.

The measurement close-audit carry-forward remains:

Decision: sufficient for mini infrastructure checkpoint.

- minimal accepted measurement subset is sufficient for mini infrastructure
  checkpoint only;
- full v1 measurement matrix remains `partial-not-accepted`;
- production binding remains blocked;
- default-measurer replacement remains blocked;
- `measureVNextText(...)` remains unchanged.

Previous source gates retained for traceability:

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
- `docs/TEMPLATE_VARIABLE_RENDER_API_PLANNING_GATE.md`
- `docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md`
- `fixtures/measurement-evidence-summary-manifest.accepted.v1.json`
- `docs/WORKSPACE_BOUNDARY.md`
- `docs/LEGACY_MIGRATION_GATE.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`

## Template Publish / Version Boundary Gate Scope

- Define the boundary between draft template identity and published template
  version identity.
- Define stable published version id and immutable version metadata policy.
- Require publishable template candidates to be canonical package v2/document
  v3.
- Define JSON-safe publish validation evidence:
  package parse, graph diagnostics, key/data diagnostics, export-readiness
  status, and measurement status.
- Define rejected publish attempt blockers.
- Define retention pointer evidence for source package/template snapshot
  without claiming production storage readiness.
- Name rollback, deprecation, or superseding-version policy.
- Keep Variable Schema / Data Contract deferred until version identity exists.
- Keep Render API Contract deferred until version identity and variable data
  contract direction exist.

## Hard Limits

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
- No backend routes/auth/storage production behavior.
- No production contenteditable implementation.
- No package/document schema change in the planning gate.
- No package/document schema change unless the dedicated publish/version gate
  explicitly decides a later schema gate is required.
- No collaboration/offline behavior.
- No legacy editor runtime copy.

## Expected Output

- dedicated Template Publish / Version Boundary Gate;
- selected publish/version evidence boundary;
- explicit deferred Variable Schema / Data Contract lane;
- explicit deferred Render API Contract lane;
- explicit measurement close-audit carry-forward blockers;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.

## Traceability Anchors

- Template Publish / Variable Schema / Render API Planning Gate.
- Measurement Hardening Close Audit.
- The accepted measurement manifest is enough for a mini checkpoint only; the
  full v1 matrix remains partial and default-measurer replacement remains
  blocked.
