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
8. Split implementation by real responsibility boundaries. Do not grow
   monolithic files that own state shape, event binding, rendering, transport,
   mutation application, diagnostics, and command policy together.

## Cross-Repo Coordination

For work that touches or affects `flowdoc-vnext-editor` or
`flowdoc-vnext-backend`, read `docs/CROSS_REPO_OPERATING_MAP.md` before making
architecture or integration claims. The default product flow is editor intent
through backend transport/revision gates into retained core contracts; do not
move HTTP, React/runtime state, DOM state, or concrete storage execution into
core.

When the user delegates a broad topic, use the delegated major topic workflow
in `docs/CROSS_REPO_OPERATING_MAP.md`: restate the outcome, split it into
phases, execute phase by phase until complete or genuinely blocked, and give
the full review output at handoff.

## Completion Workflow

When an implementation phase is complete, commit the coherent finished change
set before handoff and include the next recommended direction. Commit only
after the relevant checks pass and the staged scope contains no unrelated user
changes. If tests fail, the work is partial, a blocker remains, or unrelated
dirty files would be swept into the commit, stop and report the exact state
instead of committing.

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
