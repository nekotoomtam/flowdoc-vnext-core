# Current Status

Status: updated after Phase 187.

Use this file first when orienting current work. Use
`docs/PHASE_LEDGER.md` and `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md` for the
full historical audit trail.

## Latest Completed Phase

Phase 187: Measurement Evidence Coverage Gap Triage Gate.

The internal-alpha evidence lane across Phases 172-180 remains bounded
evidence. Phase 182 ranks the production blockers and selects measurement
rollout / digest / parity / drift as the first production hardening lane.
Phase 183 defines the digest, parity, drift, fixture-evidence, and replacement
blocker policy for that lane. Phase 184 selects the v1 measurement fixture
matrix and required JSON-safe summary facts. Phase 185 defines the JSON-safe
summary manifest shape for carrying those facts without raw evidence in root
tests/docs. Phase 186 adds a JSON-safe stub summary manifest for that matrix,
with release-gating rows still unknown/missing and no production readiness
claim. Phase 187 ranks those missing evidence gaps, groups them by owner, and
selects digest/runtime identity as the first prerequisite.

## Current Next Phase

Phase 188: Text Engine Runtime Identity Digest Evidence Builder Gate.

Goal:

- build or define the first external/package-local digest/runtime identity
  evidence path;
- keep root docs/tests limited to JSON-safe summaries and retention pointers;
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

Phase 186 adds
`fixtures/measurement-evidence-summary-manifest.stub.v1.json` as a JSON-safe
stub only. It keeps `rawEvidenceIncluded=false`, all release-gating fixture
statuses unknown, required fact coverage missing, digest identity pending,
native/WASM parity not-run, renderer-backed drift unknown, and retention
pointers null or external placeholders.

Phase 187 ranks the coverage gaps from that stub. The first blocker is
digest/runtime identity, followed by native evidence, WASM evidence, parity
summaries, renderer-backed drift summaries, numeric drift thresholds, and an
accepted summary manifest. Default-measurer replacement remains blocked.

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
- `docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md`
- `docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_FIXTURE_STUB_GATE.md`
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
