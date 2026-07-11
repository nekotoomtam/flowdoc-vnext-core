# Document V4 Read-Only Runtime

Status: Phase 260 core boundary complete.

## Outcome

`safeCreateVNextReadOnlyRuntimeSessionV4(...)` strictly parses package
3/document 4 and builds normalized structural indexes for safe consumers. It
is a separate named session and does not widen the active v3 runtime.

## Contract

The session exposes document, fields, data, node/parent/child/context indexes,
and read-only node capabilities. It accepts block images and inline images.
Direct session operation execution remains empty. Block capability facts feed
the separate backend-owned delete/reorder paths; the read session does not
mutate its package.

The session does not run operations, measured pagination, live layout, exact
rendering, export readiness, artifact generation, or asset byte resolution.
Editor image output in this phase is therefore a structural placeholder, not
an exact image render claim.

## Isolation

- The active `safeCreateVNextRuntimeSession(...)` continues to accept only
  package 2/document 3.
- The v4 read-only entrypoint continues to reject the active v3 pair.
- V4 uses its own graph-like projection and does not cast target nodes into the
  active v3 graph.

## PASS

- Strict package v3/document v4 validation precedes projection.
- Parent, child, section, zone, and nearest-context indexes are available.
- Block and inline image forms survive read projection.
- Text, duplicate, and direct session mutation remain closed.

## FAIL / BLOCKER

- Only the separate block-subtree delete and same-parent reorder kernel exists.
- No v4 measured pagination, exact renderer, or export path exists.

## RISK

- Consumers must check `canCreateReadOnlySession`; `canParse` alone is not a
  runtime permission.
- Placeholder pagination is editor UX only and must not become export truth.

## UNKNOWN

- Final v4 active-session graph shape after operation support is introduced.
- Image byte resolver and missing-asset presentation policy.

## Intentionally Not Changed

- active package 2/document 3 session and operations;
- canonical package schemas or migration output;
- backend storage execution;
- layout, renderer, export, and artifact contracts.

## Next Recommended Direction

Add v4 operation and measured layout/render support while retaining read-only
mode until each capability is explicitly activated.
