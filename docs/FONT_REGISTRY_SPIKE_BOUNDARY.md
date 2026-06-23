# Font Registry Spike Boundary

Status: Phase 101 spike boundary.

Phase 101 adds a pure font registry spike boundary for the Thai measurement
path. It records the font facts needed before the rustybuzz/ICU4X measurement
spike can run, without copying files, reading font files, computing hashes,
installing font parsers, or binding production pagination.

## Boundary

The boundary lives in `src/renderer/fontRegistrySpike.ts`.

It exposes:

- `VNEXT_FONT_REGISTRY_SPIKE_SOURCE`;
- `VNEXT_FONT_REGISTRY_SPIKE_MODE`;
- `createVNextFontRegistrySpikePlan(...)`.

The plan is JSON-serializable and records:

- candidate font assets with font id, family, style, weight, format, role,
  availability, source reference, target reference, license, hash, revision,
  and supported scripts;
- style mappings from existing measurement `styleKey` values to primary and
  fallback font ids;
- a `measurementFontAssets` projection compatible with the Phase 100 text
  measurement engine spike plan;
- profile identity ingredients: font set id, asset ids, sha256 hashes, and
  style keys;
- blocking issues for production measurement binding, missing registry/policy
  identity, duplicate font ids, invalid font facts, available assets without a
  vNext workspace target, legacy target paths, missing/unverified licenses,
  missing/non-sha256 hashes, missing primary Thai fonts, and broken required
  style mappings;
- warnings when old FlowDocEditor font folders are used as reference evidence.

## Selected Direction

The first planned Thai font set is:

```text
Sarabun Regular
Sarabun Bold
Sarabun Italic
Sarabun Bold Italic
Noto Sans Thai Regular
Noto Sans Thai Bold
```

Sarabun is the primary Thai family for early layout samples. Noto Sans Thai is
the fallback/comparison family. The old font folder may identify the source
asset names, but it must not become a canonical vNext path. Phase 103 copies
the selected assets into `assets/fonts` and records sha256 hashes from those
copied vNext-owned target files.

## Truth

This boundary may validate registry facts and produce font asset facts for the
measurement engine spike.

This boundary must not:

- copy or move font files;
- read font bytes;
- compute hashes;
- import font parsing, shaping, renderer, browser, PDF, or DOCX libraries;
- install dependencies;
- bind fonts into production pagination or exact export;
- mutate package/document schema;
- write artifacts, storage records, or cache files;
- treat old FlowDocEditor paths as canonical vNext asset targets.

Legacy font paths are allowed only as non-canonical source references. A font
asset becomes measurement-ready only when the registry facts point at a
vNext-owned package/public target path and include verified license and sha256
hash facts. Phase 102 further narrows measurement identity to
`package-font-asset` targets under `assets/fonts`; public paths remain
browser-serving mirrors.

## Acceptance Evidence

- `tests/fontRegistrySpike.test.ts` covers ready Thai font registration,
  projection into the Phase 100 measurement engine spike, blocking legacy
  targets, blocking missing license/hash facts, required style mapping
  validation, source independence, and documentation trail.
- `src/index.ts` exports the new boundary without changing package/document
  schema, pagination behavior, renderer execution, storage behavior, or file
  operations.
- `docs/TEXT_MEASUREMENT_ENGINE_SPIKE_BOUNDARY.md` remains the next consumer of
  `measurementFontAssets`.

## Non-Goals

No font file copy, font file hash scan, concrete font registry persistence,
font parser, rustybuzz/HarfBuzz integration, ICU4X integration, browser/PDF/
DOCX renderer-backed measurement provider, production pagination replacement,
artifact output, storage adapter, backend route, worker runtime, or schema
change is introduced in this phase.
