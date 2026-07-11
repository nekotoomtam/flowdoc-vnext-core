# Text-block V4 Rich-inline Replace

Status: Phase 276 policy-aware v4 content transaction.

## Decision

Single-user v1 document-v4 editing uses one bounded
`text-block.rich-inline.replace` transaction. The command replaces the complete
inline child list of one text-block after strict grammar, artifact ownership,
Structure Policy, session permission, field contract, and document validation.

This retains the accepted first-vertical-slice policy. It is history-ready and
revision-gate-ready, but explicitly not collaboration-safe or an offline merge
primitive. Granular semantic deltas remain required before those claims.

## Artifact Pins

The request identifies the mutable artifact:

- a Structure Definition draft requires policy and field contract owned by the
  exact draft id and revision; or
- a Document Instance requires its document root id to equal `instanceId` and
  policy/field contract owned by its pinned Published Structure Version.

Published Structure Versions are immutable and cannot be direct mutation
targets. A raw registry or unrelated policy cannot authorize the operation.

## Effective Capability

Every replacement requires `content.edit`. Additional actions are required only
when the replacement changes the corresponding semantic placement:

- a new or rebound field-ref requires `field.place`;
- a new or rebound inline-image source requires `media.place`; and
- a new or changed text run style requires `style.override`.

Unchanged field/image/style facts do not require placement permission merely
because they remain in the submitted complete child list. Each required action
must pass core support, resolved Structure Policy, and session permission.

## Validation

The operation strictly parses the request, verifies artifact ownership,
validates source structure and target context, resolves effective policy,
rejects denied/no-op commands, validates v4 grammar, applies to a clone, and
validates the complete result. It then returns history, invalidation, scope,
field-key, and inline identity facts. Source input remains immutable.

## Identity And History

The result lists added, removed, and retained inline ids in authored order.
Complete replacement rejects duplicate ids. Callers allocate new ids; core
does not use time or random values in this transaction.

One accepted replacement is one durable content-history entry with merge key
`rich-inline:<textBlockId>`. Backend revision advancement and before/after
record persistence remain integration responsibilities.

## Non-Goals

- no granular text insert/delete, style patch, or atomic insert/remove command;
- no collaboration merge, offline conflict resolution, or CRDT/OT claim;
- no editor DOM, IME, paste, selection adapter, or typing coalescing;
- no backend route, persistence write, stale gate, or idempotency execution;
- no measured layout, pagination, rendering, or cross-page editing.
