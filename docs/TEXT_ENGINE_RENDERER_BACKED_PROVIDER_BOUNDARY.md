# Text Engine Renderer-Backed Provider Boundary

Status: Phase 135 renderer-backed text measurement provider bridge boundary.

Phase 135 bridges accepted text-engine evidence into the existing
`createVNextRendererBackedTextMeasurer(...)` path through an external provider.
It does not replace default pagination measurement.

## Evidence

- `packages/text-engine-rust-wasm/src/rendererBackedProvider.ts` owns the
  external provider bridge.
- The bridge consumes renderer text measurement requests, selected glyph
  evidence, Phase 132 break evidence, and injected public core boundary
  functions from the call site.
- Provider measurement flows through Phase 133 wrap evidence, core evidence
  acceptance, and core measurement draft handoff before returning a
  `VNextTextMeasurementDraft`.
- Drift reports compare approximate and renderer-backed draft summaries without
  mutating the pagination cache or changing `measureVNextText(...)`.
- `tests/rendererBackedTextEngineProvider.test.ts` proves provider wrapping,
  profile gating, missing line-box profile blocking, drift report shape,
  default measurement independence, dependency cleanliness, and documentation
  trail.

## Boundary

Allowed:

- create an external provider that can be wrapped by
  `createVNextRendererBackedTextMeasurer(...)`;
- route provider output through accepted evidence and handoff;
- use injected public core boundary functions without importing the provider
  back into core;
- gate by `measurementProfileId`;
- produce drift reports against the approximate measurer.

Blocked:

- replacing `measureVNextText(...)` defaults;
- mutating pagination cache or invalidation contracts;
- importing the external provider into core;
- running PDF/DOCX rendering;
- producing artifact bytes;
- claiming production measurement binding.

## PASS

- Provider output can become a `VNextTextMeasurementDraft` through existing
  renderer-backed adapter, evidence acceptance, and handoff contracts.
- Wrong `measurementProfileId` is blocked by the core renderer-backed measurer.
- Profiles without line-box support are blocked.
- Drift report output includes profile id, text hash, approximate summary,
  renderer-backed summary, width/height/line-count drift, tolerance, and status.

## FAIL / BLOCKER

- No blocker was found for closing this provider bridge boundary.

## RISK

- Provider evidence is still built from seeded line-break evidence and native
  rustybuzz smoke fixtures.
- Drift tolerance remains a policy decision.
- Default pagination measurement remains approximate until a later guarded
  binding decision.

## UNKNOWN

- Production profile rollout policy is unknown.
- Native/WASM parity and digest evidence are not yet enough for default
  production binding.
- Renderer-backed caret/selection segment consumers remain future work.

## Files Changed

- `packages/text-engine-rust-wasm/src/rendererBackedProvider.ts`
- `packages/text-engine-rust-wasm/src/index.ts`
- `docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/rendererBackedTextEngineProvider.test.ts`

## Behavior Changed

- The external text engine package now exposes a provider bridge for the
  existing renderer-backed text measurement adapter.
- No default pagination measurement, renderer output, storage, backend, or
  schema behavior changed.

## Tests Run

- `npm.cmd test -- tests/rendererBackedTextEngineProvider.test.ts`
- `npm.cmd run check`

## Risks Left

- Set drift tolerances and rollout gates.
- Replace seeded line-break evidence with generated ICU4X evidence.
- Prove native/WASM parity before any production measurement default.

## Intentionally Not Changed

- No `measureVNextText(...)` default replacement.
- No pagination cache/invalidation changes.
- No core import of the external provider package.
- No PDF/DOCX rendering or artifact bytes.
- No production measurement binding.
- No package/document schema change.

## Non-goals

No renderer execution, PDF/DOCX output, production measurement binding,
pagination replacement, storage write, backend route, collaboration behavior,
or schema change is introduced in this phase.
