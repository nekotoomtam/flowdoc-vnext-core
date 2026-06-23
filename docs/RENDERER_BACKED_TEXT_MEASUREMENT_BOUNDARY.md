# Renderer-Backed Text Measurement Boundary

Status: Phase 95 implementation boundary.

This is a renderer-backed text measurement boundary.

It is not a concrete renderer measurement engine.

Phase 95 adds a small contract for adapting external renderer measurement facts
into the existing vNext text measurement interface without importing renderer
libraries, DOM APIs, authored documents, pagination execution, artifact storage,
or backend routes.

## Boundary

The boundary lives in `src/renderer/textMeasurementAdapter.ts`.

It exposes:

- `VNEXT_RENDERER_TEXT_MEASUREMENT_SOURCE`;
- `VNEXT_RENDERER_TEXT_MEASUREMENT_MODE`;
- `createVNextRendererTextMeasurementProfilePlan(...)`;
- `createVNextRendererBackedTextMeasurer(...)`.

The profile plan is JSON-serializable and records:

- profile id, availability, engine, revision, units, determinism, and
  capabilities;
- blocking issues for missing profile ids, unavailable profiles, non-point
  units, missing line boxes, missing style-key support, or missing available
  width support;
- warning issues for nondeterministic profiles;
- a renderer contract that consumes `vnext-text-measurement-input`, produces
  `vnext-text-measurement-draft`, uses point units, and keeps
  `mayRelayoutDocument = false`.

The measurer adapter:

- wraps an external provider behind the existing `VNextTextMeasurer` interface;
- requires input `measurementProfileId` to match the renderer-backed profile id
  so cache identity cannot silently drift;
- passes normalized style key, cache key, text hash, renderer engine, and
  profile revision to the provider;
- returns only a `VNextTextMeasurementDraft` for the existing pagination
  measurement contract to normalize.

## Truth

This boundary may describe renderer-backed measurement readiness and may adapt
an already-available external renderer measurement provider.

This boundary must not:

- execute a browser, PDF renderer, DOCX renderer, canvas, or headless runtime;
- import concrete renderer packages;
- relayout a document;
- read or mutate authored package/document data;
- store measurements;
- write artifact bytes;
- call backend routes;
- replace `src/pagination/textMeasurement.ts` as the canonical measurement
  cache/key/invalidation contract.

The actual renderer implementation remains outside this boundary. Future
browser, PDF, or DOCX measurement engines should produce facts that satisfy
this profile contract, then pass those facts through the adapter.

## Acceptance Evidence

- `tests/rendererTextMeasurementAdapter.test.ts` covers ready profile plans,
  external provider adaptation, blocked profiles, cache profile-id alignment,
  source independence, and documentation trail.
- `tests/textMeasurement.test.ts` remains the canonical cache/invalidation
  contract for `measureVNextText(...)`.
- `src/index.ts` exports the new boundary without changing package/document
  schema or pagination behavior.

## Non-Goals

No concrete renderer measurement engine, DOM measurement bridge, PDF text
metrics, DOCX text metrics, font loading, shaping engine, kerning engine,
hyphenation engine, bidi shaping, storage adapter, backend route, artifact
output, renderer-backed pagination execution, exact layout engine, or schema
change is introduced in this phase.
