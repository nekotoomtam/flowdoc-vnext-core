# Whole-Document V4 Table Composition Scale

Status: Phase 377 passed the bounded Table common Composition scale gate. The
Table composition close audit remains next.

## Outcome

One accepted Table with 1,000 body rows and one repeated authored header
resumes through 250 one-page bounded calls. Every call also passes the strict
common `table-flow` adapter.

Collected family pages equal the established complete paginator pages byte for
byte. Final Table state, cumulative work, summed window work, and input
immutability also match.

## Source-Pin Amplification

The first scale review found that bounded source ownership serialized and
hashed the full prepared Table on every resume. That would repeat all candidate
evidence once per page.

Phase 377 narrows source identity to accepted prepared scope, prepared
fingerprint, work, and execution facts before compact SHA-256 hashing. Ordered
row/cell/candidate ownership remains pinned by the prepared fingerprint chain,
while bounded resume no longer serializes full candidates per page.

## Exact Scale Facts

The retained fixture produces:

- 1,000 body rows plus one authored header;
- 250 pages and 250 one-page bounded/common windows;
- 1,250 row plans and cell plans;
- 1,250 checkpoint lookups and consumed candidates;
- 249 repeated-header row plans; and
- zero fresh-page advances.

All 250 common window fingerprints are unique. The terminal bounded cursor
contains the exact complete Table cursor and cumulative work from the complete
paginator.

## Evidence Size

The scale test locks conservative JSON-size ceilings:

- terminal/intermediate family cursor below 2 KB;
- one retained Table page checkpoint below 15 KB; and
- one common fragment window below 5 KB.

These are regression ceilings for this fixture, not storage-format or network
SLA promises.

## Work Bound

Each window commits one page and carries cumulative work into the next cursor.
`maximumRowPlanCount=2,000` remains profile-pinned across all 250 calls. Work
cannot reset per page, and no full prepared-row scan is counted as pagination
work.

## Responsibility Boundary

This is core contract evidence only. Backend scheduling, cursor/checkpoint
storage, compression, retry, and expiry remain inactive. Editor progress and
virtualized page presentation remain inactive. Renderer/export still waits for
authoritative whole-document page composition.

## PASS

- 1,000 rows resume through 250 bounded/common windows.
- Pages, final cursor, and exact work equal complete-call evidence.
- Compact source ownership avoids full-candidate serialization per resume.
- Cursor/checkpoint/common evidence remains within explicit size ceilings.
- Source input remains immutable.

## FAIL / BLOCKER

- Sequential whole-document composition is not implemented.
- Empty/zero-extent Table product policy remains blocked.
- Backend/editor/renderer integration remains inactive.

## RISK

- Prepared row/cell fingerprints must remain authoritative for descendant
  evidence; consumers must not mutate prepared facts without rebuilding them.
- Wide active split rows can exceed this non-split scale cursor size.
- Mixed-family 200-300 page document behavior remains a later composer gate.

## UNKNOWN

- Durable checkpoint compression and storage overhead.
- Production-wide split-row cursor distribution.
- Empty Table product behavior.

## Intentionally Not Changed

- Table schemas, page planner, cursor semantics, or common adapter output;
- complete Table pagination and renderer projection;
- backend/editor/storage behavior;
- common fragment-window schema; and
- generated List of Tables.

## Next Recommended Direction

Close Phase 378 with a Table bounded Composition readiness audit: reconcile
planner, cursor, adapter, hardening, scale, full core gate, cross-repo boundary,
remaining blockers, and select the sequential whole-document composer as the
next lane only if the evidence is complete.
