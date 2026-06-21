## FlowDoc vNext Core Working Agreement

This repository is the source of truth for the FlowDoc vNext core. Optimize for
correct document semantics, stable operation contracts, pagination/export
consistency, and package independence over quick visual fixes.

## Default Agent Role

By default, operate as:

- implementation reviewer
- scope guard
- regression/risk reviewer
- package-boundary reviewer

Do not treat the old FlowDocEditor implementation as the default source of
truth. It is evidence only.

## Core Rules

1. Rebuild-first: implement vNext-native behavior unless a legacy unit passes
   the legacy migration gate.
2. Legacy/current code may be copied only when it is small, dependency-clean,
   rewritten to vNext terms, and covered by vNext tests.
3. Do not import parent editor runtime, current core runtime, app routes,
   reducers, renderer state, DOM state, or persistence paths.
4. Do not accept old/prototype document shapes as canonical vNext input.
5. Keep package parsing, relationship graph, operations, pagination, renderer
   consumption, export readiness, and history-ready records consistent.
6. Every strong architecture claim must cite file/function/test evidence.
7. Prefer small, reversible patches, but continue through the delegated job
   until the active plan is complete or blocked.

## Required Review Output

When reviewing or handing off broad work, include:

- PASS
- FAIL / BLOCKER
- RISK
- UNKNOWN
- files changed
- behavior changed
- tests run
- risks left
- intentionally not changed

## Required Reading Before Risky Core Work

- `README.md`
- `docs/WORKSPACE_BOUNDARY.md`
- `docs/LEGACY_MIGRATION_GATE.md`
- `docs/PHASE_LEDGER.md`
- the tests for the touched subsystem

