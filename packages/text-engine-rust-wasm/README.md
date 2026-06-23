# FlowDoc Text Engine Rust/WASM Adapter

Status: Phase 115 rustybuzz smoke corpus package.

This package is the future external text engine adapter boundary for
rustybuzz/WASM and ICU4X work. Phase 113 added a package-local Rust smoke
crate that executes rustybuzz against copied vNext font assets. Phase 114 adds
a TypeScript mapper from raw rustybuzz smoke JSON into FlowDoc adapter evidence
while keeping production measurement binding blocked. Phase 115 maps every
Phase 107 rustybuzz smoke case through that raw-evidence boundary.

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
- remain external to `src/**` core.

Blocked:

- production TypeScript adapter binding to rustybuzz output;
- ICU4X dependency;
- WASM build or loading;
- core font-file reads;
- production measurement binding;
- pagination measurer replacement.
