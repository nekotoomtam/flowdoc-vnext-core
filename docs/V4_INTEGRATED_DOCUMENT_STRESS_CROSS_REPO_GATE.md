# V4 Integrated Document Stress Cross-Repo Gate

Status: Phase 364 cross-repository compatibility evidence.

## Outcome

Core, editor, and backend full gates pass after the integrated stress smoke,
large scale, compact TOC fingerprint, invalidation, and failure/recovery phases.
Repository boundaries remain intact and all three worktrees are clean.

This proves compatibility with the current package surface. It does not claim
that editor or backend now orchestrates the integrated stress scenario, final
TOC resolution, whole-document composition, or artifact production.

## Repository Evidence

### Core

- Branch: `codex/text-block-v1-grammar-lock`.
- Pre-gate revision: `874b9bd`.
- Type-check passes.
- 290 test files / 1,460 tests pass after adding the gate evidence test.
- TOC resolution and compact fingerprint code has no editor/backend import,
  network, DOM, storage, or Node-only `crypto` dependency.
- `createVNextCompactFingerprint(...)` remains an internal helper and is not
  exported from `src/index.ts`.

### Editor

- Revision: `24cf0d5` on `main`.
- Type-check passes.
- 27 test files / 157 tests pass.
- Production Vite build passes.
- Runtime package access remains isolated in `src/core/coreAdapter.ts`; tests
  and fixtures import only the package/fixture export surface.
- No editor source consumes final TOC resolution or the internal compact helper.

### Backend

- Revision: `0f17be1` on `main`.
- Type-check passes.
- 13 test files / 45 tests pass.
- TypeScript build passes.
- Core use remains through `@flowdoc/vnext-core`; no direct core source import
  or copied final TOC semantics were added.
- No backend route, service, job, or storage record consumes final TOC
  resolution or integrated stress evidence.

## PASS

- Current core public types compile in both local package consumers.
- Editor boundary tests still guard core access through the adapter.
- Backend retains transport/revision/storage ownership and package-only core
  imports.
- Compact SHA-256 TOC pins do not break current consumer type-check/build.
- Core remains browser/package safe and independent of consumer repositories.
- No generated build output leaves any repository dirty.
- The six expected integration blockers remain unchanged.

## FAIL / BLOCKER

None for current cross-repository package compatibility and repository gates.

Product integration remains blocked by mixed body composition, authoritative
whole-document heading-page-map production, field-backed TOC label
materialization, integrated renderer/artifact output, backend orchestration/
persistence, and editor integrated status/UI.

## RISK

- Editor and backend use a local file dependency, so these checks prove the
  workspace source surface rather than a packed/published package artifact.
- No consumer currently deserializes retained final TOC results; future
  integration must explicitly adopt SHA-256 top-level pins and must not expect
  raw per-entry owner fingerprint strings.
- Full gates do not exercise production storage, worker, browser memory, or
  deployment environments.

## UNKNOWN

- Packed-package declaration/export parity when distribution begins.
- Backend API/retention envelope for future mixed-composition cursors and
  compact retained pins.
- Editor presentation for integrated blockers, partial progress, and recovery.

## Files Changed

- Core documentation and a discoverability test only.
- No editor or backend files changed.

## Tests Run

- Core: `npm run check`, 290 test files / 1,460 tests.
- Editor: `npm run check`, 27 test files / 157 tests and production build.
- Backend: `npm run check`, 13 test files / 45 tests and TypeScript build.

## Intentionally Not Changed

- editor adapter/runtime/UI;
- backend routes/services/storage/jobs;
- core package export map;
- integrated scenario transport or persistence;
- whole-document composition, renderer, or artifacts.

## Next Direction

Close the integrated stress readiness audit. Consolidate architecture, smoke,
scale/fingerprint, invalidation, failure/recovery, and cross-repo evidence;
separate bounded gate PASS from production blockers and select the next
architecture lane from the remaining evidence.
