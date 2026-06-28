# Active Text-Block Island Boundary

Status: Phase 155 active text-block island boundary.

Phase 155 defines the browser-local active text-block island lifecycle after
Phase 154 ownership selects an island target. It models state transitions and
guards without binding DOM events, using DOM `Selection`/`Range`, committing to
vNext core, handling paste/delete semantics, or claiming production IME
readiness.

## Runtime Path

```text
Phase 154 active-text-block-island ownership
  -> inactive/opening/active/composing/dirty/committing/rejected/closed state
  -> browser-local draft and selection facts
  -> future command policy and commit bridge
```

## Module Ownership

`examples/template-builder-sandbox/public/activeTextBlockIsland.js` owns:

- active island source/mode constants;
- lifecycle states:
  - `inactive`;
  - `opening`;
  - `active`;
  - `composing`;
  - `dirty`;
  - `committing`;
  - `rejected`;
  - `closed`;
- active text-block id and draft text;
- rich segment summary facts;
- normalized UTF-16 selection facts;
- composition status;
- dirty status;
- fallback eligibility;
- commit request readiness without executing the commit;
- deterministic close and rejection reasons.

## Lifecycle Helpers

- `createInactiveActiveTextBlockIslandState(...)`;
- `openActiveTextBlockIsland(...)`;
- `activateActiveTextBlockIsland(...)`;
- `updateActiveTextBlockIslandSelection(...)`;
- `beginActiveTextBlockIslandComposition(...)`;
- `updateActiveTextBlockIslandDraft(...)`;
- `endActiveTextBlockIslandComposition(...)`;
- `requestActiveTextBlockIslandCommit(...)`;
- `closeActiveTextBlockIsland(...)`;
- `rejectActiveTextBlockIsland(...)`;
- `activeTextBlockIslandCanCommit(...)`;
- `activeTextBlockIslandLabel(...)`.

## Guard Policy

- Commit is blocked while IME composition is active.
- Cross-block selection ranges are rejected.
- Cross-block draft updates are rejected.
- Closing a dirty island without a commit is explicit.
- Commit requests produce browser-local commit facts only.
- Canonical package truth remains `not-mutated`.

## PASS

- Active island lifecycle is deterministic.
- IME composition blocks commit.
- Cross-block ranges are rejected.
- Dirty state is explicit.
- Closing without commit is explicit.
- Commit request state remains separate from vNext core commit execution.

## FAIL / BLOCKER

- No blocker prevents Phase 156 from defining command policy.
- Production editor readiness remains blocked.

## RISK

- Browser DOM selection behavior remains future work.
- Paste/delete behavior is not modeled yet.
- Field-chip internal edit behavior remains future work.
- Commit bridge execution remains future work.

## UNKNOWN

- Final production IME browser matrix is unknown.
- Renderer segment/hit-test alignment for caret parity is unknown.
- Paste sanitization and delete-boundary behavior are unknown.

## Files Changed

- `docs/ACTIVE_TEXT_BLOCK_ISLAND_BOUNDARY.md`
- `examples/template-builder-sandbox/public/activeTextBlockIsland.js`
- `tests/activeTextBlockIsland.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`

## Behavior Changed

- The sandbox now has a DOM-free active text-block island lifecycle model.
- No package data, history, storage, renderer output, route, or DOM event
  behavior changed.

## Tests Run

- `npm.cmd test -- tests/activeTextBlockIsland.test.ts`
- `npm.cmd run check`

## Risks Left

- Phase 156: Hybrid Command Policy Boundary.
- Phase 157: DOM Binding Smoke Boundary.
- Phase 158: Active Island Commit Bridge Smoke.
- Phase 159: Field Chip Delete / Copy / Paste Command Boundary.

## Intentionally Not Changed

- No DOM Selection/Range objects.
- No commit to vNext core.
- No paste/delete semantics.
- No cross-block selection support.
- No production IME readiness claim.
- No production contenteditable implementation.
- No full-document contenteditable.
- No collaboration/offline behavior.
- No storage/backend route.
- No PDF/DOCX renderer work.
- No package/document schema change.
- No legacy editor runtime copy.
