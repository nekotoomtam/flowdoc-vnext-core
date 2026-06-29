# FlowDoc Text Engine Rust/WASM Adapter

Status: WASM toolchain Rust upgrade execution package.

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
production and digest pinning to later dedicated gates.

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
- remain external to `src/**` core.

Blocked:

- production TypeScript adapter binding to rustybuzz output;
- ICU4X dependency;
- WASM artifact production, pinning, or loading until their dedicated gates;
- core font-file reads;
- production measurement binding;
- pagination measurer replacement.
