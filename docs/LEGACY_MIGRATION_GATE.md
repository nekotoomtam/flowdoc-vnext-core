# Legacy Migration Gate

Status: active.

Use this document before moving code, concepts, fixtures, or behavior from the
old FlowDocEditor implementation into this repository.

## Decision Rule

Default answer: rebuild in vNext.

Legacy/current implementation may be copied only when every gate below passes.
If any gate fails, treat the old code as evidence and write a vNext-native
implementation instead.

## Required Gates

| Gate | PASS Condition | FAIL Condition |
|---|---|---|
| Scope | The unit is small enough to review and test in one bounded patch. | The unit requires broad editor/runtime migration. |
| Dependency | It has no dependency on parent app runtime, reducers, canvas, DOM state, API routes, current core runtime, or persistence paths. | It imports or assumes parent/current runtime behavior. |
| Vocabulary | Public names and data contracts can be rewritten to vNext terms. | Old names become public vNext API or accepted canonical input. |
| Canonical input | Package v2/document v3 remains the only canonical persisted input. | Old package/document shapes become accepted by core parsers. |
| Testability | vNext tests can prove the behavior without parent app fixtures. | Tests require parent app runtime, browser editor state, or legacy adapters. |
| Ownership | The behavior belongs in core: schema, graph, operations, pagination, renderer consumption, export readiness, or history-ready records. | The behavior belongs to editor UI, transport, browser rendering, or product workflow. |

## Allowed Uses Of Legacy Code

- Reference evidence for what failed or worked.
- Small pure helpers after renaming and contract rewrite.
- Fixture ideas after converting to canonical vNext package shape.
- Test cases that prove vNext rejects old/prototype input.

## Disallowed Uses Of Legacy Code

- Whole-file moves from the parent editor.
- Compatibility adapters inside exported core.
- Parent app routes, reducer actions, selection state, DOM state, canvas state,
  current pagination objects, or persistence compatibility paths.
- Public vNext command names that preserve old prototype names only because
  current code already uses them.

## Review Template

```text
Legacy candidate:
Decision: copy / rewrite / leave behind
PASS:
FAIL / BLOCKER:
RISK:
UNKNOWN:
Required tests:
Intentionally not moved:
```

