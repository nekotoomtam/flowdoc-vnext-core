# V4 Integrated Document Stress Failure And Recovery Matrix

Status: Phase 363 failure isolation and recovery evidence.

## Outcome

The shared integrated fixture now proves bounded failure behavior across
Text-block, Columns, Table, media rendering facts, TOC cursor resume, page-
number capacity, and final heading-map ownership. Every failure is isolated from
the accepted source state and a later accepted call recovers deterministically.

Recovery semantics remain contract-specific. TOC exposes resumable partial
windows and must continue from the exact accepted cursor. Current Columns and
Table pagination calls are all-or-blocked; recovery means rerunning from the
last accepted external input, not claiming a partial cursor that they do not
return.

## Matrix

| Fault | Required failure | Recovery proof |
|---|---|---|
| measured Text-block line exceeds page body | `blocked`, no pages | accepted measurement reruns byte-identically |
| stale nested Columns cursor owner | `blocked`, `pages=null`, `cursorAfter=null` | unchanged Columns input reruns to baseline |
| stale Table cursor owner | `blocked`, `pages=null`, `cursorAfter=null` | unchanged prepared Table reruns to baseline |
| stale TOC measurement cursor owner | `blocked`, `pages=null`, `cursorAfter=null` | exact accepted partial cursor resumes to one-shot pages/final cursor |
| missing Table image asset | `blocked`, `commands=null` | valid media evidence reproduces baseline commands |
| TOC page number exceeds retained digits | destination stays `resolved`, capacity/readiness block | valid page number restores preview readiness without retry or relayout |
| heading-page map belongs to another document | `blocked`, `entries=null` | accepted owner map reproduces baseline resolution |

## Resume Evidence

The TOC case intentionally creates a one-page partial window. A cursor with a
stale measurement fingerprint is rejected atomically. Resuming from the exact
accepted cursor produces pages which, when appended to the first window, are
byte-equal to one-shot pagination and end at the same complete cursor.

Columns and Table stale cursors do not expose partial pages or replacement
cursors. Their recovery proof starts again from unchanged accepted input. This
distinction prevents test language from overstating current orchestration.

## Capacity Evidence

A four-digit synthetic page number against three measured digits preserves the
resolved heading destination and reports `capacity.status="overflow"`.
Preview/artifact readiness blocks, no measurement/pagination/rendering runs,
and `relayout=false`. Supplying a within-capacity page number restores preview
readiness. Artifact readiness remains blocked only by the known pending field-
backed heading label.

## Media Evidence

Removing the Table image asset id/owner does not produce partial renderer
commands. The projection returns `commands=null` with `missing-image-asset`.
Restoring accepted media evidence yields byte-identical baseline commands.

## PASS

- Malformed/stale facts fail closed at their owning boundary.
- Blocked calls do not mutate accepted inputs or synthesize repaired state.
- TOC resume is exact and one-shot equivalent.
- Columns/Table recovery language matches their current all-or-blocked APIs.
- Capacity overflow never becomes missing identity or hidden relayout/retry.
- Missing media never leaks partial renderer-neutral commands.
- Accepted reruns are deterministic and the six integration blockers remain.

## RISK

- Columns and Table do not yet return bounded partial progress from page-count
  exhaustion; large orchestration still needs an explicit resumable contract.
- Synthetic page maps and fixed media evidence do not prove production storage
  recovery or artifact retry behavior.
- Capacity recovery currently requires caller policy to supply a new accepted
  input; no auto-remeasurement orchestration exists.

## UNKNOWN

- Durable cursor/checkpoint expiry and idempotent backend resume policy.
- Recovery after worker/process loss during future mixed composition.
- Product presentation and operator actions for overflow, missing media, and
  stale retained evidence.

## Intentionally Not Changed

- Columns/Table pagination result shapes or retry policies;
- TOC capacity/partial semantics;
- media storage/fetch/decode behavior;
- backend jobs, persistence, idempotency, or editor recovery UI;
- whole-document composition and integrated artifact generation.

## Next Direction

Run the cross-repo contract gate. Verify the compact final TOC contract and all
integrated stress evidence through core, editor, and backend full checks while
confirming no consumer bypasses package or ownership boundaries.
