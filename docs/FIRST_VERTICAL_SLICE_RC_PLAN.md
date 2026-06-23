# First Vertical Slice RC Plan

Status: Phase 145 first vertical slice release candidate plan.

Phase 145 defines the smallest release-candidate path that can prove the
vNext core contracts work together for one single-user document flow.

This is a plan boundary. It does not implement the release candidate, change
runtime behavior, bind production storage, or promote any renderer path to a
default production path.

## RC Claim

The first vertical slice release candidate should prove:

- a canonical template/report document can be loaded;
- field binding and key diagnostics can explain the data contract;
- a browser-local authoring session can perform a bounded product-like edit;
- a rich inline edit can mark exact generation stale;
- renderer-backed measurement evidence can be selected by
  `measurementProfileId`;
- a minimal text-only PDF artifact can be produced by the external spike lane;
- artifact manifest and artifact job records can describe the produced bytes;
- a storage adapter boundary can accept the records without choosing a
  production database or object store.

The slice is single-user and evidence-driven. It is not a production launch.

## Required Prior Evidence

- `docs/KEY_REGISTRY_BINDING_PLAN.md`
- `docs/LIVE_LAYOUT_AND_EXACT_GENERATION_PLAN.md`
- `docs/BACKEND_GENERATION_RUNTIME_PLAN.md`
- `docs/TEMPLATE_BUILDER_RICH_INLINE_COMMIT_BRIDGE_BOUNDARY.md`
- `docs/TEMPLATE_BUILDER_RICH_INLINE_UNDO_REDO_REPLAY_BOUNDARY.md`
- `docs/TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md`
- `docs/TEMPLATE_BUILDER_RICH_INLINE_LIVE_EXACT_PARITY_AUDIT.md`
- `docs/THAI_LINE_BREAK_EVIDENCE_BOUNDARY.md`
- `docs/TEXT_ENGINE_LINE_WRAP_EVIDENCE_BOUNDARY.md`
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_BOUNDARY.md`
- `docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md`
- `docs/PDF_RENDERER_SPIKE_PACKAGE_BOUNDARY.md`
- `docs/ARTIFACT_MANIFEST_BOUNDARY.md`
- `docs/ARTIFACT_API_ROUTE_BOUNDARY.md`
- `docs/ARTIFACT_JOB_BOUNDARY.md`
- `docs/STORAGE_ADAPTER_BOUNDARY.md`
- `docs/PRODUCT_EDITOR_INTEGRATION_SMOKE_BOUNDARY.md`
- `docs/BROWSER_TIMING_SMOKE_BOUNDARY.md`
- `docs/WYSIWYG_PRIMARY_INPUT_DECISION_GATE.md`
- `docs/RICH_INLINE_OPERATION_DECISION_BOUNDARY.md`

## Candidate Flow

1. Load a canonical vNext package fixture with `packageVersion = 2` and
   `document.version = 3`.
2. Build the key/data diagnostic view for the selected template/report fields.
3. Open a browser-local authoring session through the sandbox product path.
4. Apply one structural packet operation and one rich inline commit.
5. Keep the rich inline commit on `text-block.rich-inline.replace` for v1.
6. Record exact generation as stale after the accepted rich inline commit.
7. Select a renderer-backed measurement profile by `measurementProfileId`.
8. Consume accepted text-engine evidence into line boxes for a text-only block.
9. Produce minimal PDF bytes through the external PDF spike package.
10. Build an artifact manifest record and artifact job transition for the
    produced bytes.
11. Pass package/session, rich inline history, artifact manifest, and artifact
    job records through the storage adapter boundary.
12. Return a bounded RC report with package id, session id, measurement profile
    id, artifact id, byte length, digest status, stale/exact status, and
    remaining blockers.

## Acceptance Gates

- Input is canonical vNext package data only.
- The authoring path is single-user and browser-local.
- Rich inline history uses the accepted v1 full inline-child replacement policy.
- Exact generation stale state is explicit after the edit.
- Measurement profile identity is explicit and mismatches are rejected.
- WASM/native parity status and digest status remain visible.
- PDF output is minimal, text-only, and marked spike-grade.
- Artifact records include byte length, digest, media type, storage status, and
  bounded failure facts.
- Storage is exercised through the adapter contract, not a hidden concrete
  backend.
- The RC report states what is proved, blocked, risky, and intentionally not
  production-ready.

## Out Of Scope

- No collaboration.
- No offline conflict resolution.
- No full production WYSIWYG input implementation.
- No default pagination measurement replacement.
- No production browser performance benchmark.
- No concrete server route.
- No concrete database or object store choice.
- No full PDF fidelity.
- No DOCX output.
- No repeat/collection materialization unless a later RC demo explicitly
  requires it.
- No submission/reviewer workflow runtime.
- No package/document schema change.
- No parent editor runtime flip.

## Phase 146 Direction

The next implementation phase should build a pure RC orchestrator contract or
report builder that composes existing core outputs without choosing concrete
production infrastructure.

The orchestrator should return a bounded readiness report before any UI,
server, worker, or storage adapter implementation is promoted.

## PASS

- The first vertical slice can be scoped without changing core schema or
  production defaults.
- Prior evidence now covers the needed lanes: authoring, rich inline, text
  measurement, PDF spike, artifact records, route contracts, job records, and
  storage adapter shape.
- The single-user limit is explicit.

## FAIL / BLOCKER

- The slice is blocked from production launch claims.
- The slice is blocked from collaboration/offline claims.
- The slice is blocked from default measurement replacement until parity,
  drift, and digest gates are accepted.

## RISK

- The PDF spike is text-only and not fidelity complete.
- The storage adapter boundary is not a concrete backend.
- Browser timing remains dependency-free smoke evidence, not a production
  benchmark.
- Full inline-child replacement is acceptable for v1 single-user use but weak
  for collaboration/offline merges.

## UNKNOWN

- The concrete RC orchestrator shape is not yet implemented.
- The exact consumer storage adapter remains unknown.
- Native/WASM parity and digest pinning remain not promoted to production.
- The production WYSIWYG input implementation remains unbuilt.

## Files Changed

- `docs/FIRST_VERTICAL_SLICE_RC_PLAN.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/firstVerticalSliceReadiness.test.ts`

## Behavior Changed

- No runtime behavior changed.
- The project now has an explicit first vertical slice release-candidate scope.

## Tests Run

- `npm.cmd test -- tests/firstVerticalSliceReadiness.test.ts`
- `npm.cmd run check`

## Risks Left

- Implement the RC orchestrator/report builder as a separate phase.
- Keep storage concrete choices outside core until a specific adapter is
  accepted.
- Keep renderer-backed measurement guarded by profile id and drift evidence.
- Keep collaboration/offline out of the v1 RC claim.

## Intentionally Not Changed

- No operation schema change.
- No production WYSIWYG implementation.
- No collaboration/offline implementation.
- No concrete storage backend.
- No server route implementation.
- No renderer production binding.
- No package/document schema change.
