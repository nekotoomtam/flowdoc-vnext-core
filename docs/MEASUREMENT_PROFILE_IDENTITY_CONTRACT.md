# Measurement Profile Identity Contract

Status: Phase 104 contract boundary.

Phase 104 locks the ingredients that form a stable `measurementProfileId`
before rustybuzz, ICU4X, or any production measurement engine is introduced.

The contract is pure data. It does not read fonts, execute shaping, run
segmentation, relayout documents, or replace pagination measurement.

## Boundary

The boundary lives in `src/renderer/measurementProfileIdentity.ts`.

It exposes:

- `VNEXT_MEASUREMENT_PROFILE_IDENTITY_SOURCE`;
- `VNEXT_MEASUREMENT_PROFILE_IDENTITY_MODE`;
- `createVNextMeasurementProfileIdentityPlan(...)`.

The profile identity includes:

- profile key and policy revision;
- copied font asset ids, family, weight, style, and sha256 hashes;
- style-key to primary/fallback font mappings;
- shaper id, engine, revision, package boundary, determinism, and shaping
  feature flags;
- segmenter id, engine, revision, data revision, package boundary,
  determinism, runtime-dependence, and line-break policy;
- explicit fallback policy;
- output shape version.

## Selected Direction

The first stable candidate is:

```text
font hashes from assets/fonts/font-assets.v1.json
  + explicit style-key font mappings
  + rustybuzz shaper revision
  + ICU4X segmenter revision and data revision
  + icu4x-uax14-thai-v1 line-break policy
  + explicit-font-list-v1 fallback policy
  + glyph-line-box-v1 output shape
```

`Intl.Segmenter` may remain a comparison baseline, but it cannot be primary
profile truth because it is runtime-dependent.

## Truth

This boundary may construct and validate `measurementProfileId` strings.

This boundary must not:

- read font files;
- compute file hashes;
- import rustybuzz, HarfBuzz, ICU4X, Intl.Segmenter, browser APIs, PDF, or
  DOCX libraries;
- execute shaping or segmentation;
- replace `measureVNextText(...)` or measured pagination;
- mutate package/document schema;
- write artifacts, cache files, or storage records.

## Acceptance Evidence

- `tests/measurementProfileIdentity.test.ts` builds a stable profile from the
  copied font manifest, proves identity changes when font hashes, shaper
  revision, or segmenter data revision change, blocks runtime-dependent primary
  segmentation, blocks missing hash/style mapping/production binding, and
  checks source independence and documentation trail.
- `assets/fonts/font-assets.v1.json` supplies copied target-copy font hashes.
- `src/index.ts` exports the contract without adding engine dependencies.

## Non-Goals

No concrete rustybuzz/HarfBuzz integration, ICU4X integration, Thai corpus,
oracle comparison, glyph output, line layout, caret mapping, pagination
replacement, PDF/DOCX rendering, backend route, worker runtime, storage adapter,
or schema change is introduced in this phase.
