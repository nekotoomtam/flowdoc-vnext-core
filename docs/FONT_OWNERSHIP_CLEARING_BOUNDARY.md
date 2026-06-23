# Font Ownership Clearing Boundary

Status: Phase 102 risk clearing boundary.

Phase 102 clears the first font risk before any font file operation runs. The
decision is that FlowDoc vNext measurement identity is owned by package font
assets under a repo-relative asset root, not by browser public paths and not by
the old FlowDocEditor folder.

This phase does not copy files, read font bytes, compute hashes, mutate
`package.json`, or bind fonts into production measurement.

## Decision

The selected ownership model is:

```text
old FlowDocEditor public/fonts
  -> source reference evidence only
  -> copy in a later file-operation phase
  -> assets/fonts/... as the vNext-owned target copy
  -> sha256 computed from the vNext-owned target copy
  -> font registry facts use package-font-asset targets
  -> optional public/fonts mirror for browser serving only
```

`assets/fonts` is the canonical target root for the measurement spike. A future
file-operation phase may add the actual font files there and update package
distribution metadata. `public/fonts` may exist later as a browser-serving
mirror, but it must not define measurement identity, profile hashes, or cache
keys.

## Boundary

The boundary lives in `src/renderer/fontOwnership.ts`.

It exposes:

- `VNEXT_FONT_OWNERSHIP_SOURCE`;
- `VNEXT_FONT_OWNERSHIP_MODE`;
- `createVNextFontOwnershipPlan(...)`.

The plan is JSON-serializable and records:

- canonical owner root and target kind;
- browser mirror policy;
- source reference paths and vNext target paths;
- planned copy records;
- registry update policy;
- blocking issues for public/legacy/absolute canonical roots, canonical source
  references, legacy targets, target paths outside the canonical root, parent
  directory segments, browser-public canonical targets, and hashes derived from
  source references or browser mirrors;
- warnings when legacy source references are used as evidence.

## Evidence From The Old Folder

The old reference folder contains the expected initial Thai font candidates:

- Sarabun Regular;
- Sarabun Bold;
- Sarabun Italic;
- Sarabun Bold Italic;
- Noto Sans Thai Regular;
- Noto Sans Thai Bold.

The local OFL files identify Sarabun and Noto Sans Thai as SIL Open Font
License 1.1 font software. That is evidence for the next license verification
step, not a production-ready registry fact by itself. The production registry
fact becomes ready only after the selected files are copied into the vNext-owned
target root and their license/hash facts are recorded from that target copy.

## Truth

This boundary may clear ownership policy and create planned copy records.

This boundary must not:

- copy or move font files;
- read font bytes;
- compute hashes;
- mutate package distribution metadata;
- import font parsers, shaping engines, renderers, browser APIs, PDF, or DOCX
  libraries;
- bind fonts into production pagination or exact export;
- mutate package/document schema;
- write artifacts, storage records, or cache files.

## Acceptance Evidence

- `tests/fontOwnership.test.ts` covers package font assets as canonical owner,
  public roots as mirror-only, legacy roots/targets as blocked, source-derived
  hashes as blocked, Phase 101 package-asset registry readiness, source
  independence, and documentation trail.
- `src/renderer/fontRegistrySpike.ts` now allows `package-font-asset` targets
  as ready registry facts after the copy/hash step.
- `src/index.ts` exports the new boundary without changing package/document
  schema, pagination behavior, renderer execution, storage behavior, or file
  operations.

## Non-Goals

No font file copy, font byte reading, sha256 computation, package metadata
update, persisted registry, concrete font parser, rustybuzz/HarfBuzz
integration, ICU4X integration, browser/PDF/DOCX renderer-backed measurement
provider, production pagination replacement, artifact output, storage adapter,
backend route, worker runtime, or schema change is introduced in this phase.
