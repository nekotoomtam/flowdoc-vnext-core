# Whole-Document V4 Table Composition Readiness Close Audit

Status: Phase 378 closes Table bounded Composition readiness in core. Consumer
orchestration and sequential whole-document composition remain inactive.

## Outcome

Phases 373-377 establish one shared Table page-semantics owner, bounded
resumable cursors, retained per-page checkpoints, strict common `table-flow`
adaptation, semantic tamper hardening, and 1,000-row/250-window scale evidence.

There is no remaining blocker for a future core sequential composer to consume
valid Table family windows. This does not claim preview, renderer, export,
backend scheduling, storage, or editor readiness.

## Evidence Chain

1. Phase 373 extracts the one-page planner and preserves complete pagination.
2. Phase 374 adds compact source/profile ownership, self-fingerprinted cursors,
   cumulative work, checkpoints, and bounded outcomes.
3. Phase 375 projects strict common `table-flow` windows without row/cell
   relayout.
4. Phase 376 blocks re-fingerprinted semantic cursor, row/header, work,
   geometry, terminal, and fresh drift.
5. Phase 377 proves exact 1,000-row/250-window parity and bounded evidence size.

## Contract Readiness

Core retains exact Table source/profile pins, active synchronized row/cell
state, cumulative work, page/checkpoint/result fingerprints, positive common
placements, family evidence references, and complete/partial/fresh/blocked
status.

Complete-call pagination and renderer input remain behaviorally unchanged. A
future composer can schedule windows and place one Table root fragment per
family page without inspecting row/cell internals.

## Failure Readiness

Invalid capacity, stale ownership/profile, malformed or replayed cursor,
prepared-state drift, work exhaustion, repeated-header/body no-progress,
fingerprint/chain/geometry/work/completion tampering, and zero extent all fail
explicitly. Blocked and fresh outcomes commit no common page or cursor work.

Empty prepared Tables remain an explicit policy blocker rather than an
unhandled state. A later product decision may choose omission or authored empty
appearance, but neither is guessed by this readiness close.

## Scale Readiness

The retained scale case proves 1,000 body rows plus one repeated authored
header over 250 one-page bounded/common windows. Pages, terminal Table state,
and all work equal complete-call evidence. Cursor, checkpoint, and common
window JSON remain under their Phase 377 regression ceilings.

Compact source pinning uses prepared scope and fingerprint ownership rather
than serializing full candidate evidence every resume.

## Cross-Repo Gate

After Phase 377:

- core: 315 test files / 1,543 tests plus type-check passed;
- editor: 27 test files / 157 tests plus type-check/build passed; and
- backend: 13 test files / 45 tests plus type-check/build passed.

Editor and backend worktrees required no Table composition changes. This is the
correct boundary: backend scheduling/persistence and editor progress/preview
must wait for an authoritative sequential document composer contract.

## Next Lane

All six common Composition families now have retained producers: Text,
Columns, Table, generated TOC, Utility, and Media. The next core lane is the
sequential whole-document composer that consumes ordered family windows,
handles first remainder/fresh advances, commits authoritative document pages,
and produces the heading-page map without relayout.

Consumer integration follows only after composer output, recovery, scale, and
readiness gates close.

## PASS

- Shared Table page semantics and complete-call parity pass.
- Bounded cursor/checkpoint, cumulative work, and fresh/blocked atomicity pass.
- Strict common `table-flow` projection and semantic hardening pass.
- 1,000-row/250-window parity, compact ownership, and size evidence pass.
- Core, editor, and backend full gates pass.

## FAIL / BLOCKER

- Sequential whole-document composer is not implemented.
- Empty/zero-extent Table product policy is not selected.
- Backend scheduling/storage, editor progress/preview, and renderer/export
  integration are not active.
- Final TOC heading destinations still require authoritative composed pages.

## RISK

- Wide active split rows enlarge family cursor/checkpoint evidence.
- Prepared descendant fingerprints must remain authoritative and immutable.
- Tiny window bounds increase scheduler/storage overhead.
- Mixed-family 200-300 page behavior is not proven until composer scale.

## UNKNOWN

- Empty Table product behavior.
- Durable cursor/checkpoint packing, expiry, and retry policy.
- Incremental page-tail convergence and invalidation thresholds.
- Production mixed-family composition memory/time.

## Files Changed

Core adds the shared page planner, bounded Table-flow paginator, common adapter,
hardening/scale tests, and Phase 373-378 documentation. Editor and backend have
no changed files in this workstream.

## Behavior Changed

Core can retain, resume, validate, and commonly project bounded Table pages.
Existing complete Table pagination and renderer behavior remain unchanged.

## Tests Run

Focused planner, cursor, adapter, hardening, scale, common-contract, and
boundary tests passed throughout the phases. Final full gates passed in all
three repositories as recorded above.

## Risks Left

Remaining risks belong to sequential mixed-family orchestration, durable
consumer scheduling/storage, empty Table product policy, and production
renderer/export integration.

## Intentionally Not Changed

- canonical Table/document schemas, colSpan, or rowSpan policy;
- complete Table pagination and renderer projection;
- common fragment-window schema;
- backend/editor source or runtime behavior;
- concrete storage, PDF generation, or export; and
- generated List of Tables.

## Next Recommended Direction

Open the sequential whole-document v4 composer architecture lock. Define exact
ordered window scheduling, document page cursor, family fresh/partial/blocked
commit rules, authoritative page/fragment plan, heading-page map, bounded work,
and recovery before implementing consumer orchestration.
