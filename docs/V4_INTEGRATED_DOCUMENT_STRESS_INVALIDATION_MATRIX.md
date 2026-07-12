# V4 Integrated Document Stress Invalidation Matrix

Status: Phase 362 localized mutation and invalidation evidence.

## Outcome

The shared `integrated-v4-stress-v1` bundle now retains one compact evidence
fingerprint per executed lane. Four isolated edits prove that unrelated lane
evidence, expected blockers, and the null integrated page count remain stable.

TOC and Table assertions combine owner-declared impact contracts with observed
rerun evidence. Text-block and Columns currently expose observed output changes
only; this phase does not invent new public compare APIs for them.

## Matrix

| Edit | Changed lane evidence | Retained lane evidence |
|---|---|---|
| authored heading label | TOC | structure validation, Text-block, Columns, Table, Table renderer facts |
| accepted measured title line | Text-block | structure validation, Columns, Table, Table renderer facts, TOC |
| accepted Columns line height | Columns | structure validation, Text-block, Table, Table renderer facts, TOC |
| prepared Table body-cell height | Table and Table renderer facts | structure validation, Text-block, Columns, TOC |

All four edits retain the same six expected blockers and
`integratedPageCount=null`.

## TOC Contract Evidence

Changing the authored title label produces one affected TOC and heading:

- `affectedTocNodeIds=["toc-smoke"]`;
- `affectedHeadingNodeIds=["title"]`;
- one changed label and no added/removed/moved entry;
- TOC measurement, pagination, renderer, and all-entry page-reference refresh
  are recommended; and
- the compare contract executes none of those downstream lanes itself.

The integrated rerun then observes only the TOC evidence fingerprint changing.

## Table Contract Evidence

The prepared body-cell edit is represented as an `item-value` change scoped to
`rowi_smoke_body` and `detail-body-cell-a`. The Table impact contract requires
measurement, preparation, pagination, and render invalidation while retaining
authored/resolved identity. The integrated rerun observes changed Table
pagination and Table renderer-neutral evidence only.

## Evidence Fingerprints

Lane evidence fingerprints are SHA-256 digests of each public API result. They
are test-local observation keys, not new canonical artifact identities. A
changed digest proves different retained output; an unchanged digest proves the
serialized public result stayed byte-identical for this fixture.

Structure evidence hashes validation output rather than authored content, so a
valid label edit correctly retains structure evidence while semantic TOC
evidence changes.

## PASS

- Every mutation changes only its expected dependent lane evidence.
- TOC and Table owner impact contracts agree with observed reruns.
- Unrelated public results remain byte-identical.
- The source bundles remain isolated clones; baseline facts are not mutated.
- Expected blockers and `integratedPageCount=null` remain stable.
- No downstream lane is executed by an impact/compare contract itself.

## RISK

- Whole-result evidence fingerprints identify change but do not explain the
  smallest changed fragment inside a lane.
- Text-block and Columns lack integrated compare contracts; their dependencies
  are observed rather than declared through a common invalidation API.
- No mixed composer exists, so page-tail reuse after a local change remains
  unknown even when isolated lane invalidation is correct.

## UNKNOWN

- Cross-lane cache ownership and page reuse once mixed composition exists.
- Field-value materialization impact on heading text geometry and the bounded
  TOC second cycle.
- Media replacement impact when intrinsic dimensions differ from fixed frames.

## Intentionally Not Changed

- authored document or prepared Table mutation APIs;
- Text-block/Columns public impact contracts;
- whole-document composition, cache scheduler, or incremental page reuse;
- backend persistence and editor undo/selection behavior.

## Next Direction

Stress failure and recovery. Break owner pins, cursors, media facts, capacity,
and resume checkpoints independently; prove atomic blocked output and exact
recovery from the last accepted retained state.
