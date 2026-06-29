# Current Status

Status: updated after Text Engine WASM Toolchain Provisioning Bootstrap Gate.

Use this file first when orienting current work. Use
`docs/PHASE_LEDGER.md` and `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md` for the
full historical audit trail.

## Latest Completed Phase

Text Engine WASM Toolchain Provisioning Bootstrap Gate.

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
selects digest/runtime identity as the first prerequisite. Phase 188 defines a
package-local runtime identity digest evidence builder in
`@flowdoc/text-engine-rust-wasm`, plus a JSON-safe root summary handoff shape,
while keeping the current digest pending and downstream evidence lanes
blocked. Phase 189 decides the digest cannot be pinned yet because no
package-local WASM artifact is present, then adds a package-local
retained-pending population summary with `digestStatus="pending"` and
`sha256=null`. Phase 190 checks the recorded candidate artifact paths, finds no
package-local WASM artifact, defines
`packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm` as the
accepted future output path, and keeps the digest pending. Phase 191 defines
the package-local build command/output metadata, finds the artifact cannot be
produced yet because `wasm-pack` and `wasm32-unknown-unknown` are unavailable
and `rust-shaper` is still a binary native smoke crate, and keeps digest
pinning blocked. Phase 192 accepts the `wasm-pack` path over direct Cargo plus
`wasm-bindgen`, adds a minimal package-local `cdylib`/`rlib` crate target and
`wasm:build` script metadata, keeps the native smoke path intact, and keeps
artifact production blocked because `wasm-pack` and `wasm32-unknown-unknown`
are still unavailable. Phase 193 defines the acquisition/provisioning path for
`wasm-pack` and `wasm32-unknown-unknown`, adds a package-local
`wasm:check-toolchain` diagnostic that reports JSON-safe availability and
exits zero, keeps the `wasm-pack` version pending until installed, and keeps
artifact production plus digest pinning blocked. Phase 194 adds the optional
package-local `wasm:readiness-smoke` wrapper, runs it successfully with exit
code `0`, records JSON-safe unavailable/blocked toolchain status, and keeps
artifact production plus digest pinning blocked because `wasm-pack` and
`wasm32-unknown-unknown` are still unavailable. Phase 195 reruns the
readiness smoke, confirms the toolchain is still unavailable, does not run
`wasm:build`, records `artifactProduced=false`, `artifactPointer=null`,
`fileSizeBytes=null`, `digestStatus="pending"`, and `sha256=null`, then keeps
Phase 196 digest pinning blocked until a real artifact exists. The Text Engine
WASM Toolchain Provisioning Bootstrap Gate defines developer/CI bootstrap as
the accepted provisioning strategy, adds a package-local `wasm:bootstrap-plan`
plan/check script, captures `rustc` and `cargo` version policy, keeps
`wasm-pack` pending until installed, keeps the `wasm32-unknown-unknown` target
missing, and keeps artifact production plus digest pinning blocked.

## Current Next Phase

Text Engine WASM Toolchain Provisioning Execution Gate.

Goal:

- execute the accepted package-local provisioning path only with explicit
  developer/CI approval for network/system toolchain changes;
- install or provide `wasm-pack` through `cargo install wasm-pack --locked`, a
  pinned CI image, an internal tool cache, or a preinstalled developer
  toolchain;
- install or provide `wasm32-unknown-unknown` through
  `rustup target add wasm32-unknown-unknown`, a pinned CI image, or a
  preinstalled developer toolchain;
- rerun `wasm:readiness-smoke` after provisioning;
- keep root checks independent from `wasm-pack` and the WASM target;
- keep Phase 196 Artifact Digest Pinning Execution blocked until the accepted
  artifact is actually produced under
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- keep root docs/tests limited to JSON-safe summaries and retention pointers;
- keep native evidence, WASM evidence, parity, drift, numeric thresholds, and
  accepted manifests blocked until their dedicated phases;
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

Phase 188 adds the first package-local digest/runtime identity evidence builder
path under `packages/text-engine-rust-wasm`. The builder returns JSON-safe
root summaries only, keeps raw runtime/WASM evidence outside root docs/tests,
and leaves the current WASM artifact digest `pending`. Native evidence, WASM
evidence, native/WASM parity summaries, renderer-backed drift summaries,
numeric thresholds, accepted manifests, and default-measurer replacement
remain blocked.

Phase 189 adds
`packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-population.v1.json`
as a package-local retained-pending summary. It records that no package-local
WASM artifact is present, `canPinDigestNow=false`, `digestStatus="pending"`,
`sha256=null`, `rawEvidenceIncluded=false`, `productionReady=false`, and
`defaultMeasurerReplacement=false`.

Phase 190 adds
`packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`
as a package-local pinning summary. It records that all Phase 189 candidate
paths are absent, the accepted future artifact output path is
`packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`, no retained
artifact pointer exists yet, `canPinDigestNow=false`, `digestStatus="pending"`,
and `sha256=null`.

Phase 191 adds
`packages/text-engine-rust-wasm/fixtures/wasm-artifact-build-output.v1.json`
as package-local build output metadata. It records the accepted future command
`wasm-pack build rust-shaper --target web --out-dir ../pkg --out-name flowdoc_text_engine`,
but marks it `blocked-not-runnable` because `wasm-pack` is unavailable,
`wasm32-unknown-unknown` is not installed, and `rust-shaper` is not a
WASM-ready library crate.

Phase 192 adds
`packages/text-engine-rust-wasm/fixtures/wasm-build-toolchain-readiness.v1.json`
as package-local readiness metadata. It records `wasm-pack` as the accepted
path, direct Cargo plus `wasm-bindgen` as a deferred alternate, `cargo`
available, `wasm-pack` unavailable, `wasm-bindgen` CLI unavailable,
`wasm32-unknown-unknown` absent, root checks not requiring WASM tooling, and
`rust-shaper` minimally crate-target ready with `cdylib`/`rlib` plus
`src/lib.rs`.

Phase 193 adds
`packages/text-engine-rust-wasm/fixtures/wasm-toolchain-acquisition.v1.json`
and `packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs`. It
records `wasm-pack` acquisition as developer/CI bootstrap outside root checks,
`rustup target add wasm32-unknown-unknown` as the target provisioning path,
`wasm-pack` version pinning as pending until installed, and keeps
`canProduceArtifactNow=false`, `artifactPointer=null`, `digestStatus="pending"`,
and `sha256=null`.

Phase 194 adds
`packages/text-engine-rust-wasm/fixtures/wasm-toolchain-optional-readiness-smoke.v1.json`
and package script `wasm:readiness-smoke`. It records that the smoke ran and
exited zero, `smoke.status="completed-blocked"`,
`availability.availabilityStatus="unavailable-blocked"`,
`wasmPackAvailable=false`, `wasm32UnknownUnknownInstalled=false`,
`toolchainReady=false`, `canProduceArtifactNow=false`,
`artifactProduced=false`, `artifactPointer=null`, `digestStatus="pending"`,
and `sha256=null`. Phase 195 may build only if the package-local toolchain is
actually available; otherwise it must record the blocker or propose a
dedicated provisioning/bootstrap phase.

Phase 195 adds
`packages/text-engine-rust-wasm/fixtures/wasm-artifact-production.v1.json`.
It reruns the package-local readiness smoke, records
`acceptedBuild.runStatus="not-run-toolchain-unavailable"`,
`artifact.artifactProduced=false`, `artifact.artifactExists=false`,
`artifact.artifactPointer=null`, `artifact.retentionPointer=null`,
`artifact.fileSizeBytes=null`, `digest.digestStatus="pending"`,
`digest.sha256=null`, `rawEvidenceIncluded=false`, `productionReady=false`,
and `defaultMeasurerReplacement=false`. It does not run `wasm:build` because
`wasm-pack` and `wasm32-unknown-unknown` are still unavailable, and it blocks
Phase 196 digest pinning until a real artifact exists.

The Text Engine WASM Toolchain Provisioning Bootstrap Gate adds
`packages/text-engine-rust-wasm/scripts/plan-wasm-toolchain-bootstrap.mjs`,
package script `wasm:bootstrap-plan`, and
`packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-bootstrap.v1.json`.
It records `bootstrap.mode="plan-and-check-only"`,
`bootstrap.installExecuted=false`,
`provisioningDecision.strategy="developer-or-ci-bootstrap"`,
`acceptedProvisioning.wasmPack.command="cargo install wasm-pack --locked"`,
`acceptedProvisioning.wasm32UnknownUnknown.command="rustup target add wasm32-unknown-unknown"`,
`versionPolicy.rustc.currentVersion="rustc 1.88.0 (6b00bc388 2025-06-23)"`,
`versionPolicy.cargo.currentVersion="cargo 1.88.0 (873a06493 2025-05-10)"`,
`versionPolicy.wasmPack.status="pending-until-installed"`,
`versionPolicy.rustTarget.status="missing"`, `toolchainReady=false`,
`artifactProduced=false`, `digestStatus="pending"`, and `sha256=null`.

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
- Do not require `wasm-pack` or `wasm32-unknown-unknown` in root checks.
- Do not change package/document schema as part of status/documentation work.

## Read First

- `docs/NEXT_PHASE_POINTER.md`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_BOOTSTRAP_GATE.md`
- `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_GATE.md`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_OPTIONAL_READINESS_SMOKE.md`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_ACQUISITION_GATE.md`
- `docs/TEXT_ENGINE_WASM_BUILD_TOOLCHAIN_READINESS_GATE.md`
- `docs/TEXT_ENGINE_WASM_ARTIFACT_BUILD_OUTPUT_GATE.md`
- `docs/TEXT_ENGINE_WASM_ARTIFACT_DIGEST_PINNING_GATE.md`
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_POPULATION_GATE.md`
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_GATE.md`
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
