# Current Status

Status: updated after Variable Schema / Data Contract Planning Gate.

Use this file first when orienting current work. Use
`docs/PHASE_LEDGER.md` and `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md` for the
full historical audit trail.

## Latest Completed Phase

Variable Schema / Data Contract Planning Gate.

Recent completed gate markers retained for pointer guards:

- Text Engine WASM Toolchain Version Compatibility Gate.
- Text Engine WASM Toolchain Rust Upgrade Execution Gate.
- Text Engine WASM Bindgen Export Dependency Gate.
- Text Engine WASM Artifact Production Retry Gate.
- Artifact Digest Pinning Execution.
- Native Evidence Summary Gate.
- WASM Evidence Summary Gate.
- Native/WASM Parity Summary Gate.
- Renderer-backed Drift Summary Gate.
- Numeric Drift Threshold Decision.
- Accepted Summary Manifest Population.
- Measurement Hardening Close Audit.
- Template Publish / Variable Schema / Render API Planning Gate.
- Template Publish / Version Boundary Gate.
- Template Publish Validation Evidence Gate.
- Template Publish Accepted Version Metadata Gate.
- Template Publish Close Audit.
- Variable Schema / Data Contract Planning Gate.

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
missing, and keeps artifact production plus digest pinning blocked. The Text
Engine WASM Toolchain Provisioning Execution Gate then attempts the accepted
provisioning path: `rustup target add wasm32-unknown-unknown` succeeds, but
`cargo install wasm-pack --locked` fails while installing `wasm-pack v0.15.0`
because dependency `cargo-platform@0.3.3` requires `rustc 1.91` and the
current toolchain reports `rustc 1.88.0`. Post-execution
`wasm:readiness-smoke` reports `wasm32UnknownUnknownInstalled=true`,
`wasmPackAvailable=false`, and `toolchainReady=false`, so artifact production
and digest pinning remain blocked. The Text Engine WASM Toolchain Version
Compatibility Gate compares upgrade Rust, older pinned `wasm-pack`, pinned CI
image, internal tool cache, and preinstalled developer toolchain strategies.
It selects Rust toolchain upgrade to `1.91+` as the immediate strategy, selects
a pinned CI image as the longer-term reproducible strategy, keeps
`wasm32-unknown-unknown` recorded as installed, and keeps artifact production
blocked until `wasm-pack` is available and readiness reports
`toolchainReady=true`. The Text Engine WASM Toolchain Rust Upgrade Execution
Gate then executes the immediate strategy: `rustup update stable` succeeds,
the toolchain reports `rustc 1.96.0` and `cargo 1.96.0`,
`wasm32-unknown-unknown` remains installed, `cargo install wasm-pack --locked`
succeeds, `wasm-pack --version` reports `wasm-pack 0.15.0`, and
package-local `wasm:readiness-smoke` reports `toolchainReady=true` plus
`canProduceArtifactNow=true`. No artifact is produced in that phase, so digest
pinning remains blocked until a real
`packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm` exists. The
Text Engine WASM Artifact Production Retry Gate then confirms readiness still
reports `toolchainReady=true`, runs package-local `wasm:build`, and records
the exact blocker: `wasm-pack` fails after compile because
`rust-shaper/Cargo.toml` does not include `wasm-bindgen = "0.2"`. The accepted
artifact is still absent, generated package metadata is not produced, and
Artifact Digest Pinning Execution remains blocked. The Text Engine WASM
Bindgen Export Dependency Gate then adds `wasm-bindgen = "0.2"` package-locally
under `rust-shaper`, resolves `wasm-bindgen 0.2.126` in `Cargo.lock`, exports
only readiness marker and boundary-version functions through `#[wasm_bindgen]`,
keeps the native `main.rs` rustybuzz smoke path intact, and verifies both
WASM-target and native cargo checks. It does not retry artifact production, so
the accepted artifact remains absent at that point. The Text Engine WASM
Artifact Production Retry Gate then uses the bindgen gate as source of truth,
reruns package-local readiness with `toolchainReady=true`, runs `wasm:build`,
and produces the accepted artifact at
`packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm` with
`fileSizeBytes=13782`. Generated JS/TypeScript/package metadata shape is
recorded in the package-local summary, while `digestStatus="pending"` and
`sha256=null` remain unchanged because sha256 pinning is not in this phase.
Artifact Digest Pinning Execution then confirms the accepted package-local
artifact exists, computes the real artifact sha256 as
`4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`, validates
the matrix id, corpus id, policy revision, measurement profile id, output
shape, and package-local artifact path, and pins the package-local runtime
identity digest summary. Native evidence, WASM evidence, native/WASM parity,
renderer-backed drift, numeric thresholds, accepted manifests, production
binding, and default-measurer replacement remain blocked.
Native Evidence Summary Gate then adds a package-local JSON-safe metadata
summary for the smallest native subset:
`v1-measure-thai-line-break-core` and
`v1-measure-latin-product-paragraphs`. The summary is attached to the pinned
digest context, keeps raw native output outside root docs/tests, and keeps
WASM evidence, parity, drift, thresholds, accepted manifests, production
binding, and default-measurer replacement blocked.
WASM Evidence Summary Gate then adds the matching package-local JSON-safe
metadata summary for the same Thai line-break core and canonical Latin
paragraph subset. It uses the same pinned digest context, keeps raw WASM output
outside root docs/tests, and keeps native/WASM parity, renderer-backed drift,
numeric thresholds, accepted manifests, production binding, and
default-measurer replacement blocked.
Native/WASM Parity Summary Gate then compares the native and WASM summary
metadata for that same subset. It records matching digest context, matrix id,
corpus id, policy revision, measurement profile id, output shape, fixture ids,
scenario ids, and required fact coverage, while keeping raw native/WASM output
outside root docs/tests. Renderer-backed drift, numeric thresholds, accepted
manifests, production binding, and default-measurer replacement remain
blocked.
Renderer-backed Drift Summary Gate then adds package-local JSON-safe
renderer-backed drift summary metadata for that same subset. It records
matching parity/digest context and unthresholded drift metadata coverage while
keeping raw native/WASM/renderer output outside root docs/tests. Numeric drift
thresholds, accepted manifests, production binding, and default-measurer
replacement remain blocked.
Numeric Drift Threshold Decision then accepts a JSON-safe threshold policy for
that same subset and matching drift context. It defines width and height drift
PASS at `<=0.5pt`, warning at `>0.5pt` and `<=1.0pt`, blocked above `1.0pt`,
and release-gating line-count drift as zero-only. Raw native/WASM/renderer
evidence remains outside root docs/tests, and accepted manifests, production
binding, and default-measurer replacement remain blocked.
Accepted Summary Manifest Population then adds a JSON-safe accepted manifest
for that same minimal subset. It populates accepted entries for
`v1-measure-thai-line-break-core` and
`v1-measure-latin-product-paragraphs`, carrying digest, native evidence, WASM
evidence, native/WASM parity, renderer-backed drift, numeric threshold policy,
and retention pointer statuses only. Raw native/WASM/renderer evidence remains
outside root docs/tests. The full v1 matrix remains partial, and production
binding plus default-measurer replacement remain blocked.
Measurement Hardening Close Audit then confirms those accepted manifest
entries, verifies each row carries pinned digest, native evidence, WASM
evidence, native/WASM parity, renderer-backed drift, numeric threshold policy,
and retention pointer statuses, and decides the minimal subset is sufficient
for a mini infrastructure checkpoint only. The audit recommends pivoting next
to a Template Publish / Variable Schema / Render API planning gate. It keeps
the full v1 matrix `partial-not-accepted`, leaves the remaining release-gating
measurement rows for later production-readiness work, and keeps production
binding plus default-measurer replacement blocked.
Template Publish / Variable Schema / Render API Planning Gate then ranks the
next non-measurement mini infrastructure lanes. It selects Template Publish /
Version Boundary first because Variable Schema / Data Contract and Render API
Contract need a stable published template/version target before their
contracts can safely attach. It defines the first-lane evidence requirements
for a later dedicated Template Publish / Version Boundary Gate while keeping
this phase planning-only, making no package/document schema changes, and
leaving measurement production readiness plus default-measurer replacement
blocked.
Template Publish / Version Boundary Gate then accepts a JSON-safe
publish/version boundary fixture at
`fixtures/template-publish-version-boundary.v1.json`. It separates mutable
draft template identity from immutable published template version identity,
defines published version metadata, immutability rules, canonical package
v2/document v3 candidate requirements, validation evidence shape, retention
pointer evidence, and rollback/deprecation/superseding policy names. It keeps
Variable Schema / Data Contract and Render API Contract deferred, makes no
package/document schema change, and selects Template Publish Validation
Evidence Gate as the next step.
Template Publish Validation Evidence Gate then adds JSON-safe validation
evidence at `fixtures/template-publish-validation-evidence.v1.json` for the
canonical `fixtures/product-report-vnext.flowdoc.json` package v2/document v3
candidate. It records package parse, graph diagnostics, key/data diagnostics,
export-readiness, measurement, rejected blocker vocabulary, and retention
pointer summaries without mutating package/document schema, producing renderer
bytes, claiming storage durability, implementing backend routes/auth/authz, or
attaching Variable Schema / Render API contracts. It selects Template Publish
Accepted Version Metadata Gate as the next step.
Template Publish Accepted Version Metadata Gate then populates JSON-safe
accepted version metadata at
`fixtures/template-publish-accepted-version-metadata.v1.json`. It carries
`templateId`, `templateVersionId`, `versionOrdinal`, source package id,
package/document versions, title, status, lifecycle policy, source snapshot
pointer, validation evidence pointer/status, export-readiness
`ready-with-warnings` plus warning count `1`, and measurement status
`mini-checkpoint-only`. It keeps draft template identity separate from
published version identity, marks the accepted template version id and source
snapshot pointer immutable, makes no package/document schema change, and
selects Template Publish Close Audit as the next step.
Template Publish Close Audit then confirms the accepted metadata exists,
preserves the required accepted version fields, keeps draft template identity
separate from published template version identity, confirms accepted
`templateVersionId`, source snapshot pointer, and validation evidence pointer
immutability, preserves export-readiness `ready-with-warnings` plus warning
count `1`, and keeps measurement scoped to `mini-checkpoint-only`. It decides
ready-with-warnings is acceptable for closing the Template Publish mini lane
because warning visibility is preserved and no renderer artifact or production
renderer readiness is claimed. The Template Publish mini lane can close for a
mini infrastructure checkpoint only, and the next lane is Variable Schema /
Data Contract Planning Gate.
Variable Schema / Data Contract Planning Gate then confirms the Template
Publish mini lane is closed for a mini infrastructure checkpoint only,
confirms the accepted published template version metadata target exists,
preserves draft/published identity separation and immutable accepted pointers,
ranks the first Variable Schema / Data Contract sub-lanes, and selects
variable reference discovery / candidate variable list first. It defines
JSON-safe gate evidence for a later Variable Reference Discovery Gate while
keeping this phase planning-only, making no package/document schema change,
leaving Render API Contract deferred, and keeping production binding plus
default-measurer replacement blocked.

## Current Next Phase

Variable Reference Discovery Gate.

Goal:

- use Variable Schema / Data Contract Planning Gate as source of truth;
- discover authored variable references and produce a JSON-safe candidate
  variable list for the accepted published template version target;
- attach discovery evidence to the accepted published template version
  identity, accepted validation evidence pointer, and source snapshot retention
  pointer;
- keep Variable Schema / Data Contract implementation deferred until discovery
  evidence is accepted;
- keep Render API Contract deferred until variable/data contract evidence is
  clear;
- route to Template Version Schema Decision Gate only if discovered
  variable/data facts cannot be represented without package/document schema
  changes;
- keep the measurement close-audit decision scoped to mini infrastructure
  checkpoint readiness only;
- keep full measurement production readiness blocked until the remaining v1
  release-gating matrix rows are accepted and a later binding phase explicitly
  accepts default-measurer replacement;
- keep raw native/WASM/renderer evidence outside root tests/docs;
- keep root checks independent from `wasm-pack` and the WASM target;
- keep production binding and default-measurer replacement blocked;
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

The Text Engine WASM Toolchain Provisioning Execution Gate adds
`packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-execution.v1.json`.
It records that provisioning execution was allowed and attempted. The
`wasm32-unknown-unknown` target was installed successfully, while
`cargo install wasm-pack --locked` failed after selecting
`wasm-pack v0.15.0` because `cargo-platform@0.3.3` requires `rustc 1.91`
and the current toolchain is `rustc 1.88.0`. The post-execution readiness
smoke records `wasm32UnknownUnknownInstalled=true`,
`wasmPackAvailable=false`, `toolchainReady=false`,
`artifactProduced=false`, `digestStatus="pending"`, and `sha256=null`.
Artifact production must not be retried until `toolchainReady=true`.

The Text Engine WASM Toolchain Version Compatibility Gate adds
`packages/text-engine-rust-wasm/fixtures/wasm-toolchain-version-compatibility.v1.json`.
It compares upgrade Rust, older pinned `wasm-pack`, pinned CI image, internal
tool cache, and preinstalled developer toolchain strategies. It accepts
`upgrade-rust-toolchain-to-1.91-plus` as the immediate strategy, accepts
`pinned-ci-image` as the longer-term reproducible strategy, keeps
`wasm32UnknownUnknownInstalled=true`, keeps `wasmPackAvailable=false`, keeps
`toolchainReady=false`, and blocks artifact production plus digest pinning.

The Text Engine WASM Toolchain Rust Upgrade Execution Gate adds
`packages/text-engine-rust-wasm/fixtures/wasm-toolchain-rust-upgrade-execution.v1.json`.
It executes `rustup update stable`, records `rustc 1.96.0` and
`cargo 1.96.0`, verifies `wasm32-unknown-unknown` remains installed, retries
`cargo install wasm-pack --locked` only after the Rust `1.91+` condition is
met, records `wasm-pack 0.15.0`, and reruns package-local
`wasm:readiness-smoke` with `toolchainReady=true` and
`canProduceArtifactNow=true`. It does not produce the artifact or pin sha256;
the next dedicated gate is artifact production retry.

The Text Engine WASM Artifact Production Retry Gate adds
`packages/text-engine-rust-wasm/fixtures/wasm-artifact-production-retry.v1.json`.
It confirms `wasmPackAvailable=true`, `wasmPackVersion="wasm-pack 0.15.0"`,
`wasm32UnknownUnknownInstalled=true`, `toolchainReady=true`, and
`canProduceArtifactNow=true`, then runs package-local `wasm:build`. The first
retry failed with `failed-missing-wasm-bindgen-dependency` because
`rust-shaper/Cargo.toml` lacked `wasm-bindgen = "0.2"`. After the bindgen
dependency/export gate, the retry now succeeds, the accepted artifact exists
at `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`,
`fileSizeBytes=13782`, generated package metadata is recorded as `generated`,
`digestStatus="pending"`, and `sha256=null`.

The Text Engine WASM Bindgen Export Dependency Gate adds
`packages/text-engine-rust-wasm/fixtures/wasm-bindgen-export-dependency.v1.json`.
It adds `wasm-bindgen = "0.2"` to `rust-shaper/Cargo.toml`, records
`wasm-bindgen 0.2.126` in `Cargo.lock`, switches the WASM library to minimal
`#[wasm_bindgen]` exports for readiness marker and boundary version, keeps the
native `main.rs` rustybuzz smoke path intact, passes package-local native and
WASM target cargo checks, does not retry `wasm:build`, and keeps
`digestStatus="pending"` with `sha256=null`.

The post-bindgen Text Engine WASM Artifact Production Retry Gate reruns
package-local readiness, confirms `toolchainReady=true`, runs
`npm.cmd --prefix packages/text-engine-rust-wasm run wasm:build`, and produces
the accepted artifact plus generated JS/TypeScript/package metadata under
`packages/text-engine-rust-wasm/pkg/`. The package-local retry summary records
`artifactProduced=true`, `artifactPointer="packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm"`,
`fileSizeBytes=13782`, `generatedPackageMetadataShape.status="generated"`,
`digestStatus="pending"`, `sha256=null`, and
`sha256ComputedThisPhase=false`. Artifact Digest Pinning Execution is now the
next safe step; production measurement binding remains blocked.

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
- `docs/VARIABLE_SCHEMA_DATA_CONTRACT_PLANNING_GATE.md`
- `docs/TEMPLATE_PUBLISH_CLOSE_AUDIT.md`
- `docs/TEMPLATE_PUBLISH_ACCEPTED_VERSION_METADATA_GATE.md`
- `fixtures/template-publish-accepted-version-metadata.v1.json`
- `docs/TEMPLATE_PUBLISH_VALIDATION_EVIDENCE_GATE.md`
- `fixtures/template-publish-validation-evidence.v1.json`
- `docs/TEMPLATE_PUBLISH_VERSION_BOUNDARY_GATE.md`
- `fixtures/template-publish-version-boundary.v1.json`
- `docs/TEMPLATE_VARIABLE_RENDER_API_PLANNING_GATE.md`
- `docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md`
- `docs/ACCEPTED_SUMMARY_MANIFEST_POPULATION.md`
- `docs/NUMERIC_DRIFT_THRESHOLD_DECISION.md`
- `docs/RENDERER_BACKED_DRIFT_SUMMARY_GATE.md`
- `docs/NATIVE_WASM_PARITY_SUMMARY_GATE.md`
- `docs/WASM_EVIDENCE_SUMMARY_GATE.md`
- `docs/NATIVE_EVIDENCE_SUMMARY_GATE.md`
- `docs/TEXT_ENGINE_WASM_BINDGEN_EXPORT_DEPENDENCY_GATE.md`
- `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_RETRY_GATE.md`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_RUST_UPGRADE_EXECUTION_GATE.md`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_VERSION_COMPATIBILITY_GATE.md`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_EXECUTION_GATE.md`
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
