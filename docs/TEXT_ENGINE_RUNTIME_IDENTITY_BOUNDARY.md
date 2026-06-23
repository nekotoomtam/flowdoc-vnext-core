# Text Engine Runtime Identity Boundary

Status: Phase 134 WASM / ICU4X runtime identity and digest boundary.

Phase 134 records the external text engine runtime identity shape before
claiming native/WASM parity or production measurement. The manifest pins the
runtime ingredients that affect evidence: rustybuzz revision, ICU4X revision,
ICU4X data revision, font hashes, output shape, measurement profile id, runtime
targets, and the WASM artifact digest gate.

## Evidence

- `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`
  records the current external adapter runtime identity.
- `packages/text-engine-rust-wasm/src/runtimeIdentity.ts` validates runtime
  targets, rustybuzz/ICU4X revisions, ICU4X data revision, font sha256 hashes,
  required parity facts, and the WASM digest requirement when `parity-ready` is
  claimed.
- The current fixture is `identity-only`: it records a pending WASM digest and
  not-run native/WASM comparison without pretending parity is proven.
- `tests/textEngineRuntimeIdentity.test.ts` proves validation, missing digest
  blocking for parity-ready claims, missing revision blocking, measurement
  profile ingredient alignment, dependency cleanliness, and documentation
  trail.

## Boundary

Allowed:

- record package-local runtime identity evidence;
- keep a parity contract shape for native/WASM comparison;
- require rustybuzz, ICU4X, ICU4X data, font hashes, and output shape identity;
- require a pinned WASM digest before `parity-ready`;
- keep production measurement disabled.

Blocked:

- loading WASM;
- requiring browser or worker execution in core tests;
- claiming full parity before matching native/WASM evidence exists;
- binding production measurement;
- importing WASM or the adapter package into `src/**`;
- changing package/document schema.

## PASS

- Runtime identity validates as `identity-ready`.
- Missing rustybuzz, ICU4X, or ICU4X data revisions block.
- Missing WASM digest blocks only when parity-ready is claimed.
- Font hashes are part of the runtime identity record.
- Measurement profile identity remains the core profile gate for font, shaper,
  segmenter, data, line-break policy, fallback, and output shape.

## FAIL / BLOCKER

- No blocker was found for closing this identity boundary.

## RISK

- WASM artifact digest is still pending.
- Native/WASM comparison has not run.
- ICU4X data packaging remains a future implementation decision.

## UNKNOWN

- Final WASM build path and digest are unknown.
- Browser and worker runtime loading semantics are unknown.
- Drift tolerance for wrapped evidence remains future work.

## Files Changed

- `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`
- `packages/text-engine-rust-wasm/src/runtimeIdentity.ts`
- `packages/text-engine-rust-wasm/src/index.ts`
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_BOUNDARY.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/textEngineRuntimeIdentity.test.ts`

## Behavior Changed

- The external text engine package now has a pure runtime identity and digest
  validation boundary.
- No WASM loading, native/WASM comparison, production measurement, pagination,
  renderer, storage, or schema behavior changed.

## Tests Run

- `npm.cmd test -- tests/textEngineRuntimeIdentity.test.ts`
- `npm.cmd run check`

## Risks Left

- Produce and pin a real WASM artifact digest.
- Compare native and WASM corpus evidence.
- Decide ICU4X data packaging and revision policy.

## Intentionally Not Changed

- No WASM import, build, loading, or execution.
- No concrete ICU4X execution.
- No production measurement binding.
- No pagination measurer replacement.
- No renderer artifact output, backend route, storage write, or schema change.

## Non-goals

No real native/WASM parity execution, WASM artifact creation, browser/worker
loader, renderer-backed provider binding, production measurement, pagination
replacement, PDF/DOCX output, storage, backend route, or schema change is
introduced in this phase.
