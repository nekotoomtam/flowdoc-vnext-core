# Project Boundary

Status: active boundary for the FlowDoc vNext core repository.

This repository is the source of truth for the FlowDoc vNext core. Treat the
old editor/project implementation as reference evidence only, not as a default
implementation source.

## Allowed Dependencies

- `zod` for schema validation.
- Node/Vitest/TypeScript dev tooling.
- Self-contained source files under `src/`.

## Disallowed Dependencies

- Direct imports from `../packages/core`.
- Direct imports from `../src/app`.
- Direct imports from editor reducer, renderer, pagination, or persistence
  runtime paths.
- Current/prototype node names as vNext public API or accepted canonical input.

## Prototype Cutoff Rule

Current/prototype structures are reference evidence only. They must not enter
the exported vNext source path, package parser, fixture contract, or required
test suite as supported input.

The canonical vNext input is:

```text
FlowDocPackage.packageVersion = 2
  -> document.version = 3
```

Old document versions and prototype node names should be rejected by canonical
vNext parsers. If the project ever needs a one-off converter, keep it outside
exported core and outside required vNext checks.

## Rebuild-First Rule

Default to new vNext-native implementation. Legacy/current code may be copied
only when all of these are true:

- the copied unit is small and has a clear owner;
- it has no dependency on parent editor runtime, current core runtime, DOM
  state, reducer state, or app routes;
- names and data contracts are rewritten to vNext terms;
- canonical parser and operation behavior still reject old/prototype shapes;
- tests prove the copied behavior at the vNext boundary.

If a legacy unit does not satisfy those rules, rewrite it or leave it behind.

## Repository Rule

This repo must remain runnable without the parent app:

- package-local type-check;
- package-local tests;
- vNext product fixtures;
- package v2/document v3 parser and serializer tests;
- no exported migration or compatibility adapter for old document shapes;
- no imports from the parent app runtime.
