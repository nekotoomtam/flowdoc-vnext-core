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

Unsupported document versions and prototype node names are rejected by each
named canonical parser. One-off converters for prototype or never-canonical
shapes stay outside exported core and required vNext checks.

A migration between two accepted canonical versions is a separate case. It may
expose a pure core semantic plan only after a dedicated version decision is
accepted. It must use named source and target parsers, remain explicit and
source-immutable, and never become a silent package-read compatibility adapter.
Backend owns revisioned persistence execution for that plan.

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
- no exported prototype migration or silent package-read compatibility adapter;
- accepted canonical-version migration, when present, is explicit,
  source-immutable, and separated from backend persistence execution;
- no imports from the parent app runtime.
