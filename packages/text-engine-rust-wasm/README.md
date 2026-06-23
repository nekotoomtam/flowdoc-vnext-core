# FlowDoc Text Engine Rust/WASM Adapter

Status: Phase 113 rustybuzz native smoke package.

This package is the future external text engine adapter boundary for
rustybuzz/WASM and ICU4X work. Phase 113 keeps the TypeScript adapter evidence
mocked while adding a package-local Rust smoke crate that executes rustybuzz
against copied vNext font assets.

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
- remain external to `src/**` core.

Blocked:

- production TypeScript adapter binding to rustybuzz output;
- ICU4X dependency;
- WASM build or loading;
- core font-file reads;
- production measurement binding;
- pagination measurer replacement.
