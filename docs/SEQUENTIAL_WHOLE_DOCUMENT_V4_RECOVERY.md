# Sequential Whole-Document V4 Recovery

Status: Phase 382 implemented. Authoritative finalization and mixed-family
scale remain inactive until Phase 383.

## Outcome

Phase 382 activates the remaining common family-window states in the pure
sequential transition:

- `partial` commits complete family pages and resumes the same root fresh;
- `fresh-page-required` advances the document page without family progress;
- valid family `blocked` windows propagate their exact issues atomically; and
- deterministic retry from the same retained state produces byte-identical
  results.

Malformed transport, stale evidence, and valid family blockers remain distinct
failure classes. No backend retry loop, persistence, rendering, or editor
presentation is activated.

## Determinism Correction

Phase 382 removes two schedule-dependent facts from authoritative retained
state before enabling partial resume:

1. document placements no longer retain `familyWindowFingerprint`; they retain
   the family evidence fingerprint that identifies semantic fragment geometry;
2. compact cursor cumulative work no longer retains accepted-window count;
   window count remains exact per-transition work only.

A family may produce the same semantic pages in one large window or several
bounded windows. Orchestration envelope identity and number of calls must not
change closed-page or terminal-cursor fingerprints.

The contracts remain pre-consumer and no persisted production shape exists, so
this correction does not migrate backend/editor data.

## Partial Commit

A valid `partial` common window must match the exact active demand before any
projection. Each accepted family page projects using the same document
placement rules as complete windows.

Every page whose family cursor remains incomplete closes as
`family-continuation`, including non-final pages inside a larger complete
window. This makes close reason semantic rather than dependent on where the
caller cut a window.

The final partial page closes even when it retains unused body remainder. The
same root resumes on a newly opened full body page with:

- unchanged body-item index;
- exact common cursor-after as the new family cursor-before;
- no body-item completion work; and
- cumulative family-page, placement, page-advance, and cursor-commit work.

The unusable tail is never offered to the continuation again.

## Fresh Page Required

A valid `fresh-page-required` common window has no pages, fragments, work, or
family cursor progress. The transition closes the current document page as
`fresh-page-required`, opens the next page in the same section, and emits the
same root/cursor demand with full body height.

Transition work records one accepted window and one document page advance, but
zero family pages, placements, body-item completions, and family cursor
commits. Schedule-dependent window count is not retained in the cursor.

The common contract already rejects fresh demand from an already fresh page as
no-progress. The composer does not repair or repeat it silently.

## Family Blocked

A retained common window with `status: blocked` is first validated against the
same exact demanded identity, stable owners, cursor-before, and capacity as
accepted windows.

When valid, the transition returns `reason: family-blocked` and preserves the
family issue codes, paths, and messages. It returns cursor-before but no
cursor-after, open-page-after, closed pages, demand, or committed work.

Malformed/tampered blocker envelopes remain `window-rejected`; they cannot use
family-blocked status to bypass envelope or demand validation.

## Atomic Limits

Before commit, partial windows reserve one closed-page slot for every accepted
family page. Fresh-page-required reserves one slot for the current page.
Family pages/fragments and remaining manifest placement capacity are checked
before projection.

If those required units do not fit, the transition blocks with zero work.
Structural work after an already accepted window may still stop at the clean
`output-limit` checkpoint established in Phase 381.

## Retry And Immutability

Retry supplies the exact same manifest, cursor-before, open-page-before,
window, and limits. Pure parsing and projection clone accepted inputs. Equal
retry inputs produce equal blocked or accepted result fingerprints.

A valid family blocker can therefore be retried later with corrected upstream
family evidence from the same retained document state. The failed attempt does
not need rollback because it exposed no new state.

Re-fingerprinted stale windows are rejected by demand relationship checks even
when their own common envelope is internally valid. Retry safety does not rely
only on detecting a stale fingerprint.

## One-Shot Resume Equivalence

Focused evidence composes the same two-page Text-flow root in two schedules:

- one complete two-page common window; and
- one one-page partial window followed by one one-page complete window.

Both schedules produce byte-identical ordered closed pages, closed-prefix
fingerprints, cumulative semantic work, terminal cursor, and terminal cursor
fingerprint. Per-transition window work differs by design and is not part of
the authoritative final state.

## PASS

- Partial windows close and resume the same family cursor on a fresh page.
- Fresh-page-required advances document state with zero family progress.
- Valid family blockers preserve exact issues and commit nothing.
- Malformed and re-fingerprinted stale windows remain distinct blockers.
- Equal retries are byte-identical and source-immutable.
- One-shot and partial/resume schedules converge on identical pages and
  terminal cursor.

## FAIL / BLOCKER

- Ordered closed-page chunks are not finalized into one authoritative plan yet.
- No production heading-page map is emitted yet.
- Mixed six-family 200-300 page scale is not proven yet.
- Backend/editor/renderer consumers remain inactive.

## RISK

- Finalization must prove every prefix link and reject missing/reordered chunks.
- Heading identity must be collected from first fragments without retaining a
  schedule-dependent partial map in the cursor.
- Mixed scale must bound cursor/open-page/window/result bytes separately.
- TOC final resolution must not trigger relayout.

## UNKNOWN

- Production mixed-family throughput and durable chunk transaction size.
- Final static-zone artifact and page-number cycle behavior.
- Empty Table policy before manifest construction.
- Backend retention, retry expiry, and transaction policy.

## Files Changed

- `src/composition/documentCompositionTransitionV1.ts`
- `src/composition/documentCompositionPageV1.ts`
- `src/composition/documentCompositionCursorV1.ts`
- `tests/documentCompositionTransitionV1.test.ts`
- `tests/documentCompositionPageV1.test.ts`
- `tests/documentCompositionCursorV1.test.ts`
- `tests/sequentialWholeDocumentV4Recovery.test.ts`
- `docs/SEQUENTIAL_WHOLE_DOCUMENT_V4_RECOVERY.md`
- `docs/SEQUENTIAL_WHOLE_DOCUMENT_V4_CONTRACTS.md`
- `docs/SEQUENTIAL_WHOLE_DOCUMENT_V4_ORDERED_SCHEDULING.md`
- `README.md`
- `docs/CROSS_REPO_OPERATING_MAP.md`
- `docs/PHASE_LEDGER.md`

## Behavior Changed

Core sequential transition now accepts all four common family-window states.
Schedule-dependent window identity/count is excluded from authoritative page
and cursor state. Existing consumers remain unchanged and inactive.

## Tests Run

- focused partial/fresh/family-blocked/retry/equivalence tests;
- focused retained page/cursor regression tests;
- focused Phase 382 documentation contract test;
- core type-check; and
- full core test suite.

## Risks Left

Authoritative plan/map finalization, mixed-family scale, cross-repo gates, and
consumer integration remain separate phases.

## Intentionally Not Changed

- canonical document/node/field/media schemas;
- common fragment-window or family adapter contracts;
- family measurement/pagination internals;
- backend scheduler, persistence, routes, jobs, auth, retries, or storage;
- editor canvas, DOM, selection, history, viewport, or WYSIWYG runtime; and
- renderer, PDF, DOCX, preview, or artifact output.

## Next Recommended Direction

Implement Phase 383 authoritative finalization and mixed-family scale. Validate
the complete closed-page prefix once, emit one page plan plus heading-page map
with a shared owner fingerprint, resolve final TOC page references without
relayout, and prove a realistic 200-300 page six-family schedule.
