# Current Status

Status: updated after Phase 185.

Use this file first when orienting current work. Use
`docs/PHASE_LEDGER.md` and `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md` for the
full historical audit trail.

## Latest Completed Phase

Phase 185: Measurement Evidence Summary Manifest Gate.

The internal-alpha evidence lane across Phases 172-180 remains bounded
evidence. Phase 182 ranks the production blockers and selects measurement
rollout / digest / parity / drift as the first production hardening lane.
Phase 183 defines the digest, parity, drift, fixture-evidence, and replacement
blocker policy for that lane. Phase 184 selects the v1 measurement fixture
matrix and required JSON-safe summary facts. Phase 185 defines the JSON-safe
summary manifest shape for carrying those facts without raw evidence in root
tests/docs. It does not claim production readiness.

## Current Next Phase

Phase 186: Measurement Evidence Summary Manifest Fixture Stub Gate.

Goal:

- add a JSON-safe stub summary manifest for the Phase 184 matrix;
- keep all release-gating rows unknown or missing until real evidence is
  produced outside core;
- keep `measureVNextText(...)` unchanged.

## Proven Internal-Alpha Path

One bounded path works:

```text
open canonical package fixture
-> edit one active text block
-> save package/session, durable history, and rich-inline records
-> reload package/session record
-> generate minimal PDF spike bytes from the reloaded package
-> store artifact bytes
-> retrieve artifact bytes
-> produce a JSON-safe status report
```

Primary evidence:

- `docs/INTERNAL_ALPHA_VERTICAL_SLICE.md`
- `packages/internal-alpha-runner/src/internalAlphaVerticalSlice.ts`
- `tests/internalAlphaVerticalSlice.test.ts`

## Production Blockers

Ranked after Phase 182:

1. Measurement rollout / digest / parity / drift.
2. Production storage durability and transaction strategy.
3. Backend routes and auth/authz.
4. PDF renderer fidelity.
5. Production contenteditable/input binding.
6. DOCX renderer.
7. Collaboration/offline semantics.
8. Package/document schema changes, if any are required later.

Phase 183 blocks measurement replacement until digest identity is pinned,
native/WASM parity is matching, drift thresholds are accepted, required v1
measurement fixture evidence is present, and a later binding phase explicitly
accepts default-measurer replacement.

Phase 184 maps the release-gating evidence matrix under
`v1-measurement-evidence-corpus-v1` and keeps raw evidence outside core.

Phase 185 defines `measurement-evidence-summary-manifest-v1` as a JSON-safe
shape only. Raw native/WASM/renderer evidence remains outside root tests/docs.

## Current Hard Limits

- Do not claim production readiness from internal-alpha evidence.
- Do not copy legacy editor runtime.
- Do not add production contenteditable binding without a dedicated phase.
- Do not add backend routes/auth/storage production claims in doc-only phases.
- Do not add PDF/DOCX production renderer work as incidental cleanup.
- Do not replace the default measurer as part of the measurement hardening
  gate.
- Do not execute external text engines in core.
- Do not put raw evidence in root tests/docs.
- Do not change package/document schema as part of status/documentation work.

## Read First

- `docs/NEXT_PHASE_POINTER.md`
- `docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_GATE.md`
- `docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md`
- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md`
- `docs/V1_HARDENING_BACKLOG_TRIAGE_GATE.md`
- `docs/INTERNAL_ALPHA_CLOSE_AUDIT_AND_DOC_CONSOLIDATION_GATE.md`
- `docs/INTERNAL_ALPHA_VERTICAL_SLICE.md`
- `docs/MEASUREMENT_ROLLOUT_GATE.md`
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_BOUNDARY.md`
- `docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md`
- `docs/TEXT_ENGINE_LINE_WRAP_EVIDENCE_BOUNDARY.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
