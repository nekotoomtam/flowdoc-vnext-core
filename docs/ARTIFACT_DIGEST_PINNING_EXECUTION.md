# Artifact Digest Pinning Execution

Status: Artifact Digest Pinning Execution complete.

This phase uses the Text Engine WASM Artifact Production Retry Gate as source
of truth. It computes and pins sha256 only for the real package-local WASM
artifact after validating the runtime identity context. It does not execute
native/WASM measurement evidence and does not bind production measurement.

## Source Of Truth

- `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_RETRY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production-retry.v1.json`
- `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`
- `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`
- `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-builder.v1.json`
- `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-population.v1.json`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`

## Artifact Check

Accepted artifact path:

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

Observed result:

- artifact exists;
- artifact path is package-local;
- file size is `13782` bytes;
- sha256 is
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- sha256 is lowercase 64-character hex;
- raw artifact bytes are not copied into root docs/tests.

## Context Validation

The digest pin is accepted because the context matches:

- matrix id: `v1-measurement-fixture-evidence-matrix-v1`;
- corpus id: `v1-measurement-evidence-corpus-v1`;
- policy revision: `v1-measurement-evidence-policy-v1`;
- runtime identity manifest: `text-engine-runtime-identity-v1`;
- measurement profile id matches the runtime identity manifest and builder
  expectation;
- output shape: `glyph-line-box-v1`;
- retained artifact pointer:
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`.

## Package-Local Summary Updates

- `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`
  now records `runtime.wasmArtifact.digestStatus="pinned"` and the real
  sha256.
- `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-builder.v1.json`
  now retains the package-local WASM artifact pointer.
- `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-population.v1.json`
  now records `artifactFound=true`, `canPinDigestNow=true`,
  `digestStatus="pinned"`, and the same sha256.
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`
  records `pinningDecision="pinned-real-artifact-context-matched"`.

## Next Phase

Native Evidence Summary Gate.

Digest identity is now pinned, so the next measurement hardening prerequisite
is the smallest JSON-safe native evidence summary subset, starting with Thai
line-break core coverage and canonical Latin paragraph coverage.

## Explicit Non-Work

- No `wasm-pack` or `wasm32-unknown-unknown` requirement is added to root
  checks.
- No rustybuzz/WASM/ICU4X execution happens in `@flowdoc/vnext-core`.
- No raw native/WASM evidence is added to root docs/tests.
- No fake sha256 is accepted.
- No native evidence summary is produced.
- No WASM evidence summary is produced.
- No native/WASM parity summary is produced.
- No renderer-backed drift summary or numeric drift threshold is accepted.
- No accepted root measurement manifest is claimed.
- No `measureVNextText(...)` replacement happens.
- No pagination mutation happens.
- No production renderer-backed measurement binding happens.
- No production PDF/DOCX renderer work is added.
- No backend routes, storage, auth, or authz are added.
- No production contenteditable implementation is added.
- No package/document schema change is made.
- No collaboration/offline behavior is added.
- No legacy editor runtime is copied.

## PASS

- The accepted artifact exists at the package-local path.
- The real artifact sha256 was computed and pinned.
- The sha256 is lowercase 64-character hex.
- Runtime identity context matches matrix id, corpus id, policy revision,
  measurement profile id, and output shape.
- Root summaries remain JSON-safe and point to package-local retention
  pointers.

## FAIL-BLOCKER

None for digest pinning execution.

The following downstream blockers remain intentional:

- native evidence;
- WASM evidence;
- native/WASM parity;
- renderer-backed drift;
- numeric drift thresholds;
- accepted summary manifest;
- production measurement binding;
- default-measurer replacement.

## RISK

- The pinned digest identifies the current generated WASM bytes only. Any
  rebuild that changes bytes must repeat digest pinning before native/WASM
  evidence can rely on the artifact.
- The runtime identity still uses planned ICU4X and ICU4X data revisions, so
  parity-ready claims remain blocked.

## UNKNOWN

- Native evidence output quality is still unknown.
- WASM evidence output quality is still unknown.
- Native/WASM parity is not run.
- Renderer-backed drift and numeric thresholds are not accepted.

## Files Changed

- `docs/ARTIFACT_DIGEST_PINNING_EXECUTION.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`
- `packages/text-engine-rust-wasm/README.md`
- `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`
- `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-builder.v1.json`
- `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-population.v1.json`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`
- `tests/artifactDigestPinningExecution.test.ts`
- pointer guard tests

## Behavior Changed

Package-local digest identity advances from pending to pinned for the accepted
WASM artifact. Production measurement behavior is unchanged.

## Tests Run

To be filled by the phase completion report after verification.

## Risks Left

- Native and WASM evidence still need real summary phases.
- Parity and drift cannot be claimed until their evidence exists.
- Production measurement replacement remains blocked.

## Intentionally Not Changed

- `measureVNextText(...)`
- pagination behavior
- renderer-backed measurement binding
- PDF/DOCX renderer behavior
- backend routes/storage/auth/authz
- production contenteditable
- package/document schema
- collaboration/offline behavior
