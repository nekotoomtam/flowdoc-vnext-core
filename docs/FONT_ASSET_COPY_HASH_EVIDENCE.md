# Font Asset Copy / Hash Evidence

Status: Phase 103 evidence boundary.

Phase 103 performs the first vNext-owned font file operation for the Thai
measurement path. The selected font files and OFL license files were copied
from the old reference folder into `assets/fonts`, and sha256 hashes were
computed from those copied vNext-owned target files.

This phase does not run a font parser, shaping engine, line breaker, renderer,
pagination, or exact export.

## Copied Assets

The evidence manifest lives at:

```text
assets/fonts/font-assets.v1.json
```

It records:

- manifest policy id and hash authority;
- copied OFL license files;
- copied font assets;
- vNext-owned `package-font-asset` target paths under `assets/fonts`;
- non-canonical old FlowDocEditor source references;
- bytes and sha256 hashes computed from the copied target files;
- initial style-key mappings for paragraph and heading measurement samples.

The copied initial set is:

- `assets/fonts/Sarabun/Sarabun-Regular.ttf`;
- `assets/fonts/Sarabun/Sarabun-Bold.ttf`;
- `assets/fonts/Sarabun/Sarabun-Italic.ttf`;
- `assets/fonts/Sarabun/Sarabun-BoldItalic.ttf`;
- `assets/fonts/Sarabun/OFL.txt`;
- `assets/fonts/Noto_Sans_Thai/static/NotoSansThai-Regular.ttf`;
- `assets/fonts/Noto_Sans_Thai/static/NotoSansThai-Bold.ttf`;
- `assets/fonts/Noto_Sans_Thai/OFL.txt`.

The manifest also records these inactive IBM Plex Sans Thai comparison
candidates:

- `assets/fonts/IBM_Plex_Sans_Thai/IBMPlexSansThai-Regular.ttf`;
- `assets/fonts/IBM_Plex_Sans_Thai/IBMPlexSansThai-Bold.ttf`;
- `assets/fonts/IBM_Plex_Sans_Thai/IBMPlexSansThai-Light.ttf`;
- `assets/fonts/IBM_Plex_Sans_Thai/IBMPlexSansThai-Thin.ttf`;
- `assets/fonts/IBM_Plex_Sans_Thai/OFL.txt`.

Candidate assets have target-copy byte sizes, sha256 hashes, and verified OFL
evidence, but remain outside `fontAssets` and `styleMappings`. They therefore
do not change the active measurement profile identity until a later comparison
phase selects and promotes specific weights.

## Ownership And Identity

Hash authority is `vnext-target-copy`.

That means:

- hashes must be computed from files under `assets/fonts`;
- old FlowDocEditor paths remain source evidence only;
- browser `public/fonts` mirrors are still not measurement identity;
- `package-font-asset` targets are the ready registry target kind.

The manifest can feed Phase 101 font registry facts and Phase 100 measurement
engine spike facts, but production measurement binding remains false.

## Acceptance Evidence

- `tests/fontAssetEvidence.test.ts` recomputes sha256 hashes from copied target
  files, verifies file sizes, checks OFL license text, validates package
  distribution metadata includes `assets`, and proves the manifest can feed the
  font registry and measurement engine spike plans without replacing
  pagination measurement.
- `package.json` includes `assets` in the package file list now that package
  font assets exist.
- `docs/FONT_OWNERSHIP_CLEARING_BOUNDARY.md` remains the ownership policy.
- `docs/FONT_REGISTRY_SPIKE_BOUNDARY.md` remains the registry readiness
  boundary.

## Non-Goals

No font parsing, glyph inspection, rustybuzz/HarfBuzz integration, ICU4X
integration, browser public mirror creation, production measurement binding,
pagination replacement, PDF/DOCX rendering, artifact output, backend route,
worker runtime, package/document schema change, or persisted registry service
is introduced in this phase.
