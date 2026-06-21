# Operation Kernel Split Plan

Status: implementation baseline complete.

This document owns Lane B from `docs/VNEXT_CORE_REDESIGN_PLAN.md`.

## Goal

Move operation contracts out of the monolithic operation applier while keeping
existing operation behavior stable.

## Split Boundaries

| Module | Owns | Must Not Own |
|---|---|---|
| `src/operations/commands.ts` | command union, operation source, supported kind list, command target ids | document mutation |
| `src/operations/results.ts` | issues, scope, render invalidation type, commit metadata, result union | command dispatch |
| `src/operations/invalidation.ts` | scope creation from graph and render invalidation helper | pagination execution |
| `src/operations/history.ts` | history-ready records, append helper, replay with injected runner | concrete operation implementations |
| `src/operations/registry.ts` | supported operation catalog and default intent/invalidation metadata | validation side effects |
| `src/operations/documentOperations.ts` | current operation applier/orchestrator and public compatibility exports | owning all operation contracts |

## Current Behavior Contract

- Existing `runVNextOperation(...)` behavior remains the public operation
  application API.
- Existing imports from `src/operations/documentOperations.ts` continue to
  work through re-exports.
- Runtime session reads supported operation kinds from the registry, not from
  the editor bridge runtime.
- History replay can be tested independently with an injected operation runner.

## Not Changed

- command names;
- operation behavior;
- validation policy;
- history record schema version;
- pagination/export invalidation page scope;
- parent editor integration.

## Verification

- `tests/operations.test.ts` keeps existing operation behavior covered.
- `tests/operationKernel.test.ts` covers registry alignment, invalidation
  helper output, and history replay through an injected runner.
- `npm run check` must pass.

