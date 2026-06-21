# Phase 12 Repository Extraction Record

Status: complete for physical repository extraction.

This document records the extraction of vNext core from the old parent project
into the standalone `flowdoc-vnext-core` repository.

## Goal

Make the vNext core a standalone package without carrying parent editor
runtime code, current/prototype compatibility input, or parent API routes into
exported core.

## Extracted Unit

The new repository root owns:

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `vitest.config.ts`
- `.gitignore`
- `README.md`
- `AGENTS.md`
- `.github/workflows/check.yml`
- `src/**`
- `tests/**`
- `fixtures/**`
- `docs/**`

## Kept Out Of Core

These parent consumers remain outside this repository:

- parent editor bridge host and bridge tests
- parent app vNext API probes
- parent app runtime reducers, canvas, selection, pagination, export, or
  persistence code
- current/prototype document adapters
- visible editor runtime flip work

## Extraction Evidence

| Gate | Evidence | Status |
|---|---|---|
| Package-local commands exist | `package.json` scripts `type-check`, `test`, and `check` | verified |
| Package-local tests pass | `npm.cmd run check` | passed; 10 files / 67 tests |
| Standalone required files exist | `tests/extractionBoundary.test.ts` | verified |
| No parent app/current core imports from `src/**` | `tests/extractionBoundary.test.ts` | verified |
| Canonical-only parser rejects old shapes | `tests/packageFixture.test.ts` | verified |
| Product fixture exists | `fixtures/product-report-vnext.flowdoc.json` | verified |
| Project boundary is explicit | `docs/WORKSPACE_BOUNDARY.md`; `AGENTS.md` | verified |
| Legacy migration gate exists | `docs/LEGACY_MIGRATION_GATE.md` | verified |
| Package consumption strategy exists | `docs/PACKAGE_CONSUMPTION_STRATEGY.md` | verified |
| CI check exists | `.github/workflows/check.yml` | verified |

## Verification Run

```text
npm.cmd run check
```

Result:

- type-check passed;
- 10 test files passed;
- 67 tests passed.

## Parent Consumption State

The parent FlowDocEditor repository currently consumes this package through a
local file dependency:

```json
"@flowdoc/vnext-core": "file:../flowdoc-vnext-core"
```

That is acceptable for local transition work. Before CI, release, or multi-user
development depends on this package, choose a distribution strategy:

- sibling checkout plus documented local setup;
- workspace/monorepo link;
- git dependency;
- private package registry.

## Not Part Of The Core Move

- visible editor runtime flip;
- controlled editor preview integration;
- PDF/DOCX artifact rendering;
- replacing parent `/api/paginate` or `/api/export`;
- transport/cache/background job design;
- legacy/current document conversion inside exported vNext core.

## Verdict

PASS for physical repository extraction.

Next work should happen in this repository by default. Use the parent
FlowDocEditor repository only as a consumer/bridge integration target or as
historical evidence.
