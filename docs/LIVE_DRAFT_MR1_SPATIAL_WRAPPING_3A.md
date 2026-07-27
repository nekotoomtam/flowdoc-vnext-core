# Live Draft MR1 Spatial Wrapping 3A

## Status

`Phase 3: Core Spatial Wrapping 3A` is accepted as a bounded Core synthetic QA
checkpoint. Spatial wrapping is `Core synthetic 3A accepted`.

Every accepted index, update, region, and layout remains non-publishable and
non-production through `mayPublishLayout: false`, `productionBinding: false`,
and `stagedEditorApply: false`.

List decoration, inline-image geometry, empty-block geometry, Editor/Backend binding, Columns/Table integration, Table auto-fit, publication, production activation, and Editor staged apply remain NO-GO.

## Outcome

Core now owns a strict synthetic positioned-object boundary, an immutable
persistent y-interval index, deterministic Flow Region Provider results, and a
multi-interval TextBlock wrapping layout. These contracts consume the exact
process-local MR1-Q Persistent Flow Tree and unchanged accepted request.

The checkpoint supports rectangular exclusions on the left, right, or middle
of a line, multiple intervals on one logical line, top/bottom barriers,
overlay-neutral flow, full-width zero-space advancement, hard breaks, and
expanded line-band stabilization. It does not introduce an authored
positioned-object schema, product binding, publication authority, or
incremental spatial-line reuse.

## Capability Matrix

| Capability | Phase 3 status |
| --- | --- |
| spatial wrapping | Core synthetic 3A accepted |
| authored positioned objects | NO-GO |
| inline images | NO-GO |
| list decoration | NO-GO |
| empty blocks | NO-GO |
| Columns/Table | NO-GO |
| Table auto-fit | NO-GO |
| Editor/Backend binding | NO-GO |
| publication/production | NO-GO |

## Spatial Index Evidence

- Strict input authority is exactly `core-synthetic-qa-only`; unknown fields,
  unsupported policies, duplicate ids, unsafe arithmetic, invalid sizes, and
  clearance envelopes outside the accepted Core content boundary fail closed.
- The index is a deterministic persistent interval treap ordered by
  `(envelope.top, envelope.bottom, objectId)`, with entry fingerprints as
  deterministic priorities, ordinal code-unit object-id ordering, and
  recursively retained subtree summaries. Distinct ids that locale collation
  treats as equal remain distinct through construction, query, and update.
- Narrow y-band queries use subtree maximum-bottom pruning. The deterministic
  1,024-entry fixture returns the exact match with
  `completeIndexScanCount: 0` and visits fewer than all index nodes.
- Indexes are recursively frozen, Core-fingerprinted, and registered only in
  process-local `WeakSet`/`WeakMap` provenance. Clones, stale requests,
  changed revision/context facts, and re-fingerprinted altered geometry are
  rejected without partial geometry.

## Flow Region And Wrapping Evidence

- Flow Region Provider evidence covers left, right, middle, and multiple
  rectangular exclusions, ordered non-overlapping positive-width intervals,
  top/bottom barriers, overlay neutrality, and full-width zero-space
  advancement to the minimum proved envelope bottom.
- Empty and overlay-only indexes use the
  `no-flow-affecting-entry` fast path with zero spatial-index query calls.
- The layout projects break-safe groups from retained shaping clusters and
  accepted break offsets rather than trusting `request.lines` as new spatial
  line decisions. Unbreakable groups remain whole while one logical line can
  place content in more than one horizontal interval.
- No-exclusion layout reproduces the chosen accepted MR1-Q line range, y,
  height, baseline, fragments, source segments, and fragment fingerprints.
- Top/bottom barriers and full-width rectangles advance only to a proved
  spatial event. An empty line whose current intervals are too narrow also
  advances to the minimum relevant intersecting exclusion bottom before it
  retries. Overlay does not remove flow space.
- A taller placed run triggers expanded-band stabilization. Candidate line
  height remains monotonic when the expanded region moves the tall group to a
  later line.

## Move And Resize Evidence

- Move and resize use path-copy treap delete/insert operations resolved from
  the process-local object-id binding; they do not rebuild the complete index.
- Accepted work reports `completeIndexRebuildCount: 0` and preserves object
  identity for unchanged entries and at least one untouched subtree in the
  bounded structural-sharing fixture. Delete work counts include nodes
  inspected while merging both retained subtrees.
- Every update retains the exact old/new affected-band union. Disjoint move
  bands remain separate; touching or overlapping resize bands merge.
- Composed evidence moves a middle exclusion below line 0 and changes the
  layout from two line-0 intervals to one full-width interval. Resizing a left
  exclusion changes both provider interval start and fragment x while the
  exact Persistent Flow Tree object and fingerprint remain unchanged.
- No counter or claim for reused spatial lines is introduced; that remains
  later incremental reflow work.

## PASS

- Persistent y-interval indexing, max-bottom query pruning, strict synthetic
  authority, immutable process-local provenance, and deterministic
  fingerprints pass.
- Left/right/middle/multiple rectangular wrapping, barriers, overlay,
  zero-space advancement, hard breaks, and expanded-band re-query pass.
- Move/resize path copying, affected-band union, structural sharing, and
  before/after provider/layout composition pass.
- MR1-Q exact tree/request/index identity gates and non-publishable,
  non-production authority limits remain enforced.

## FAIL / BLOCKER

List decoration, inline-image geometry, empty-block geometry, Editor/Backend binding, Columns/Table integration, Table auto-fit, publication, production activation, and Editor staged apply remain NO-GO.

Authored positioned-object contracts and runtime binding do not exist. This
checkpoint must not be interpreted as product activation or production
layout authority.

## RISK

- The interval treap and spatial line executor have bounded correctness and
  work-counter evidence, but no product workload or scheduling claim.
- Process-local provenance is intentionally not a serialization, persistence,
  or cross-process authority.
- Phase 3 reports affected y bands only; it does not prove spatial-line
  reconvergence or line reuse after an update.

## UNKNOWN

- Canonical authored positioned-object schema, ownership, and persistence.
- Initial TextBlock geometry for list decoration, inline images, and empty
  blocks.
- Spatial reconvergence and incremental line reuse over affected bands.
- Columns/Table integration, Table auto-fit, and product runtime binding.

## Verification

Focused Phase 3 result: 8 test files passed / 46 tests passed.

Final full `npm run check`: 417 test files passed / 2,078 tests passed,
including its type-check.

`npm run type-check` and `git diff --check` passed. The focused source-only
hardening gate passed 7 test files / 45 tests before the documentation guard
was added.

## Next Checkpoint

Proceed only to `Phase 4: Initial TextBlock Geometry`.

Phase 4 may define the next bounded Core geometry boundary, but this handoff
does not authorize downstream runtime work. List decoration, inline-image geometry, empty-block geometry, Editor/Backend binding, Columns/Table integration, Table auto-fit, publication, production activation, and Editor staged apply remain NO-GO.
