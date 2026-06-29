# FlowDoc Text Engine Rust/WASM Adapter

Status: WASM evidence summary metadata package.

This package is the future external text engine adapter boundary for
rustybuzz/WASM and ICU4X work. Phase 113 added a package-local Rust smoke
crate that executes rustybuzz against copied vNext font assets. Phase 114 adds
a TypeScript mapper from raw rustybuzz smoke JSON into FlowDoc adapter evidence
while keeping production measurement binding blocked. Phase 115 maps every
Phase 107 rustybuzz smoke case through that raw-evidence boundary. Phase 192
adds a minimal WASM-ready crate target shape and package-local `wasm:build`
script metadata, but keeps artifact production blocked until `wasm-pack` and
`wasm32-unknown-unknown` are available. Phase 193 adds a package-local
toolchain diagnostic script that reports availability as JSON without making
root checks depend on WASM tooling. Phase 194 adds an optional package-local
readiness smoke wrapper that records unavailable toolchain status without
requiring an artifact. Phase 195 checks artifact production, does not run
`wasm:build` while the toolchain is unavailable, and keeps artifact output plus
digest pinning blocked. The provisioning bootstrap gate adds
`wasm:bootstrap-plan` as a package-local plan/check script and keeps actual
toolchain provisioning out of root checks. The provisioning execution gate
then installs the `wasm32-unknown-unknown` Rust target successfully, but keeps
artifact production blocked because `cargo install wasm-pack --locked` fails
against the current `rustc 1.88.0` toolchain when `wasm-pack v0.15.0`
requires a dependency needing `rustc 1.91`. The version compatibility gate
selects a Rust 1.91+ toolchain upgrade as the immediate strategy and a pinned
CI image as the longer-term reproducible artifact-production strategy. The
Rust upgrade execution gate upgrades stable Rust to `rustc 1.96.0`, keeps
`wasm32-unknown-unknown` installed, installs `wasm-pack 0.15.0`, and records
package-local readiness as `toolchainReady=true` while still leaving artifact
production and digest pinning to later dedicated gates. The artifact
production retry gate then runs package-local `wasm:build`, records
`failed-missing-wasm-bindgen-dependency`, keeps the accepted artifact absent,
and points next to a package-local `wasm-bindgen` dependency/export boundary.
The bindgen export dependency gate adds `wasm-bindgen = "0.2"` to
`rust-shaper`, exposes only readiness marker and boundary version exports, and
keeps native smoke plus root checks independent before the next artifact
production retry. The post-bindgen artifact production retry runs
package-local `wasm:build`, produces `pkg/flowdoc_text_engine_bg.wasm` plus
generated JS/TypeScript/package metadata, and keeps sha256 pinning plus
production measurement binding out of scope. Artifact Digest Pinning Execution
then computes and pins the real package-local artifact sha256
`4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44` while
keeping native evidence, WASM evidence, parity, drift, accepted manifests, and
production measurement binding blocked. Native Evidence Summary Gate then adds
`fixtures/native-evidence-summary.v1.json` with JSON-safe metadata for the
Thai line-break core and canonical Latin paragraph subset, while keeping raw
native output outside root docs/tests and leaving WASM evidence plus parity
for later gates.
WASM Evidence Summary Gate then adds `fixtures/wasm-evidence-summary.v1.json`
with JSON-safe metadata for the same Thai line-break core and canonical Latin
paragraph subset, while keeping raw WASM output outside root docs/tests and
leaving native/WASM parity, drift, accepted manifests, and production
measurement binding for later gates.

Run the smoke from this package:

```sh
npm run rustybuzz:smoke
```

## Boundary

Allowed:

- consume `VNextTextEngineAdapterRequest` from `@flowdoc/vnext-core`;
- return `VNextTextEngineAdapterEvidence`;
- provide deterministic mock glyph ids, advances, offsets, clusters, and line
  boxes for root tests;
- execute the package-local `rust-shaper` smoke crate outside core source;
- read copied vNext package font assets from the smoke command;
- map raw rustybuzz UTF-8 byte clusters into UTF-16 FlowDoc evidence ranges;
- require raw rustybuzz fixture coverage for every Phase 107 smoke case;
- expose a minimal `cdylib`/`rlib` readiness marker from `rust-shaper/src/lib.rs`;
- keep the package-local `wasm:build` command out of root checks;
- run `npm run wasm:check-toolchain` as an optional package-local diagnostic;
- run `npm run wasm:readiness-smoke` as an optional readiness smoke;
- run `npm run wasm:bootstrap-plan` as a package-local provisioning plan/check;
- keep `wasm32-unknown-unknown` provisioning evidence package-local;
- run `rustup update stable` and `cargo install wasm-pack --locked` only in
  explicit package-local toolchain execution gates;
- attempt `npm run wasm:build` only inside explicit package-local artifact
  production gates;
- expose only minimal non-production `#[wasm_bindgen]` readiness/version
  functions until a later evidence phase scopes real shaping;
- retain the generated `pkg/flowdoc_text_engine_bg.wasm` artifact as
  package-local output for digest-pinned evidence;
- retain the pinned sha256 digest for `pkg/flowdoc_text_engine_bg.wasm` as
  package-local runtime identity evidence;
- retain JSON-safe native evidence summary metadata for the first Thai and
  Latin subset without putting raw native output in root docs/tests;
- retain JSON-safe WASM evidence summary metadata for the same first Thai and
  Latin subset without putting raw WASM output in root docs/tests;
- remain external to `src/**` core.

Blocked:

- production TypeScript adapter binding to rustybuzz output;
- ICU4X dependency;
- WASM artifact loading until its dedicated gate;
- raw native evidence in root docs/tests;
- raw WASM evidence in root docs/tests;
- native/WASM parity, drift, accepted manifests, and production measurement
  binding until their dedicated gates;
- core font-file reads;
- production measurement binding;
- pagination measurer replacement.
