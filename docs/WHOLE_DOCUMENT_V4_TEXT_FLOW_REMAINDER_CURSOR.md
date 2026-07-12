# Whole-Document V4 Text-flow Remainder And Cursor Contract

Status: Phase 368 implemented Text-flow window pagination and the first common
fragment-window adapter. The sequential composer remains inactive.

## Outcome

Text-flow is the first Composition Node Family that can consume the exact
remaining height of a document page, commit bounded family pages, resume from a
measurement-pinned cursor, retain a checkpoint for every page, and project its
accepted output into the Phase 367 Common Fragment-Window Contract.

The implementation consumes accepted measured lines only. It does not measure,
reshape, line-break, mutate authored nodes, resolve fields/media, render,
compose document pages, persist jobs, or update editor state.

## Compatibility

`paginateVNextTextBlockV4Lines(...)` from Phase 279 remains unchanged. Its
full-page deterministic behavior and callers retain the same result shape.

Phase 368 adds a separate composition-oriented path:

- `src/pagination/textFlowV4WindowPagination.ts`; and
- `src/composition/textFlowFragmentWindowV1.ts`.

Both are exported from `src/index.ts` without activating any consumer repo.

## Accepted Measurement Ownership

`createVNextTextFlowV4MeasurementFingerprint(...)` creates a compact SHA-256
owner from accepted measured-line source, version, text-block identity, complete
line/source facts, and summary.

The paginator never accepts raw text or measurement requests. Its cursor and
result pin this compact accepted-measurement fingerprint. Changing any line,
height, source range, summary, or text-block identity makes an old cursor stale.

The retained pagination result itself has a compact fingerprint.
`hasValidVNextTextFlowV4PaginationFingerprint(...)` recomputes it at the adapter
boundary, preventing changed page/cursor facts from being wrapped in a newly
valid common-window fingerprint.

## Cursor

`VNextTextFlowV4PaginationCursor` retains only:

- contract version and cursor kind;
- text-block id;
- accepted measurement fingerprint;
- next line index;
- next family page index; and
- complete state.

The cursor does not retain measured lines, rendered text, field values, images,
page fragments, or document page numbers.

Validation blocks:

- malformed cursor shape;
- text-block or measurement owner mismatch;
- line position outside accepted lines;
- complete-state drift;
- page progress greater than consumed line progress;
- non-zero line progress with zero page progress, or the reverse; and
- starting another window from an already complete cursor.

## Remainder And Fresh Page

The request pins positive page-body height, exact first-page available height,
maximum page count, maximum accepted-line count, and an optional cursor. The
line bound defaults to 100,000 and callers may select a smaller positive bound.

If the next measured line fits the first remainder, Text-flow consumes as many
whole accepted lines as fit. Later pages in the same call use full body height.

If the next line fits a fresh page but not the supplied remainder, the result is
`fresh-page-required` with:

- no pages;
- cursor-after exactly equal to cursor-before;
- zero committed work; and
- no forced overflow or clipped line.

A measured line larger than a fresh page body blocks pagination atomically.

## Page Commit

Every accepted page contains:

- monotonic family page index;
- exact available, used, and remaining height;
- cursor-before and cursor-after;
- one source-retaining text fragment;
- contiguous measured lines with local y offsets; and
- a compact fragment fingerprint.

One family page commits only after at least one measured line is consumed.
No-progress is an error. A page never splits a measured line and never invokes
measurement or renderer relayout.

Fragment index equals family page index, so identities remain stable across
bounded resume calls. Source start/end retain the first and last accepted line
boundaries.

## Bounded Partial And Resume

The paginator emits:

- `complete` when the final accepted line is committed;
- `partial` when `maximumPageCount` is reached with lines remaining;
- `fresh-page-required` for an unusable first remainder; or
- `blocked` for invalid ownership, capacity, cursor, line, or progress.

For the same accepted measurement and initial remainder:

1. one call with a sufficient page bound; and
2. one bounded call followed by resume calls on fresh pages

produce byte-identical concatenated family pages and the same final cursor.
Window-level fingerprints differ legitimately by request/window boundary; the
accepted page and final progress truth does not.

## Exact Work

The result reports:

- page attempts;
- line visits, including a bounded look-ahead that does not fit; and
- committed page cursors.

Committed cursor count equals committed page count. Line visits remain linear
in accepted lines plus page boundaries. Accepted input is rejected before page
planning when it exceeds the pinned line bound, so tiny positive line heights
cannot create unbounded per-page work.

## Common Fragment-Window Adapter

`createVNextTextFlowCompositionWindowV1(...)` validates the exact retained
pagination fingerprint and cursor owners before projection.

The caller provides compact document-structure, resolved-projection, and family
source pins plus document/section/body-zone/source-order identity, common
fragment bound, and optional heading level.

The adapter:

- maps Text-flow cursor checkpoints to opaque common cursor references;
- maps one family page fragment to one renderer-neutral common placement;
- retains exact first remainder and page/fragment/cursor work;
- exposes heading identity only on fragment index zero;
- maps partial, complete, and fresh-page-required states directly; and
- preserves a valid family-blocked result as a valid fingerprinted blocked
  common window when its cursor ownership is honest.

It does not read line contents during projection or copy measured lines into the
common window. Each placement retains only fragment identity, extent,
continuation, and compact family-evidence fingerprint.

## Heading First Fragment

Heading level is adapter context derived from canonical text-block role. It is
not inferred from rendered text.

Only the first Text-flow fragment (`fragmentIndex=0`, not continuing from a
previous page) carries heading identity. Resumed windows starting at later
fragments cannot publish another heading marker.

This is retained input for the future authoritative heading-page map; Phase 368
does not assign document page numbers or resolve TOC references.

## Failure And Recovery

- Stale measurement cursors block with no pages/cursor-after.
- Already-complete and impossible-progress cursors block.
- Oversized measured lines block with their line index.
- Tampered pagination facts fail adapter fingerprint verification.
- Invalid common context pins fail strict common finalization.
- Accepted measurements and pagination results remain source-immutable.
- Repeating the same accepted request remains deterministic.

## Scale Evidence

Direct evidence executes 6,000 accepted lines at 24 pt through:

- 250 Text-flow family pages;
- 250 per-page cursor checkpoints; and
- 250 common fragment placements.

Line visits remain at most accepted lines plus page boundaries. The projected
common window stays below 500 KB because it retains compact page/fragment/cursor
facts rather than the 6,000 measured lines.

This is bounded core-contract evidence, not a production 200-300 page mixed
document resource profile.

## Responsibility Boundary

Core owns accepted-line ownership, Text-flow pagination/cursor semantics,
deterministic fragment identity, adapter validation, common projection, and
diagnostics.

Backend still owns scheduling, durable cursor/window retention, retry, expiry,
storage, authorization, and tenancy. Editor still owns input, caret/selection,
progress/blocker UX, viewport, and preview scheduling. Renderer/export still
owns commands and artifact bytes without relayout.

## PASS

- Exact first-page remainder and explicit fresh-page demand are implemented.
- Bounded partial/resume retains one-shot-equivalent pages and final cursor.
- Page and accepted-line bounds cap retained output and line-planning work.
- Accepted measurement and pagination ownership use compact fingerprints.
- Every Text-flow page retains an exact progressing cursor checkpoint.
- Text-flow is the first honest Common Fragment-Window producer.
- Stale, tampered, oversized, complete, and no-progress inputs fail atomically.
- 6,000-line/250-page family and adapter scale passes.
- Phase 279 pagination behavior remains unchanged.

## FAIL / BLOCKER

- Utility/media, Columns, Table, and TOC do not yet emit common windows.
- No sequential whole-document composer or document page plan exists.
- No authoritative production heading-page map or final TOC cycle exists.
- No renderer/backend/editor consumes Text-flow common windows.

## RISK

- Keeping both Phase 279 and composition-oriented pagination public requires
  callers to choose by capability rather than treating shapes as interchangeable.
- Text-flow currently treats one measured line as the minimum split unit; cross-
  page editing/selection UX remains external.
- Adapter context pins must come from accepted upstream owners, not caller-
  invented placeholders.
- Measurement fingerprint and retained-line validation currently scan the full
  accepted line set per pagination call. Many very small resume windows can
  amplify CPU until a later retained verified-evidence/chunked-owner contract
  is proven without weakening stale detection.

## UNKNOWN

- Production memory/time thresholds for mixed Text/Table/Columns/media books.
- Durable cursor expiry and retry policy across workers.
- Final static-zone/page-number interaction with body composition.

## Intentionally Not Changed

- canonical package/document schemas and Text-block grammar;
- measurement requests, line acceptance, shaping, and line-breaking;
- Phase 279 full-page pagination API;
- Columns/Table/TOC/utility/media pagination;
- renderer/export, backend, and editor runtime behavior.

## Next Recommended Direction

Implement Utility And Media V4 Atomic Fragment Contracts. Produce honest common
windows for page-break, divider, spacer, and resolved block image, including
fresh-page demand, intentional blank-page semantics, atomic oversize failure,
compact ownership, and no renderer/media-decode execution.
