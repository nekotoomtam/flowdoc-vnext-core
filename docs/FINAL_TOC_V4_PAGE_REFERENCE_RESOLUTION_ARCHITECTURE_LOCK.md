# Final TOC V4 Page-Reference Resolution Architecture Lock

Status: Phase 352 architecture lock.

## Outcome

Final TOC v4 page-reference resolution replaces each semantic entry's pending
page reference with an authoritative heading destination from completed v4
document pagination. It preserves semantic labels and measured/paginated TOC
geometry, reports page-number digit capacity, and returns explicit preview and
artifact readiness facts without measurement, relayout, rendering, or authored
mutation.

## Current Dependency Truth

Core does not yet expose one completed whole-document v4 page plan that owns
every heading fragment. Existing v4 pagination lanes are bounded node/container
contracts. The document v3 `resolveVNextFinalPageReferences(...)` is evidence
only and cannot become v4 source truth.

Therefore this topic may close a strict resolution contract, but end-to-end
final output remains blocked until a whole-document v4 pagination composer
produces the accepted heading-page map.

## TOC Pagination Manifest

Bounded TOC pagination windows must first be finalized into one manifest. The
manifest accepts an ordered list of successful windows and validates:

- same TOC and measurement fingerprint;
- first cursor matches manifest start;
- every next `cursorBefore` equals the previous `cursorAfter`;
- contiguous, unique page indexes and row indexes;
- one title placement at most;
- final cursor is complete and covers every measured row exactly once; and
- page fragments remain byte-equal to their source windows.

The manifest retains all pages, start/final cursor, warnings, work summaries,
measurement fingerprint, and its own fingerprint. Partial chains block; core
does not infer missing windows.

## Heading-Page Map

The authoritative input contract is:

```text
kind: document-v4-heading-page-map
documentId
documentPaginationFingerprint
status: complete
pageCount
entries[]:
  headingNodeId
  sectionId
  sourceFragmentId
  pageIndex
  pageNumber
```

Heading ids are unique. Page indexes are non-negative and inside `pageCount`;
page numbers are positive integers. The map is already the first-fragment
destination selected by whole-document pagination. Resolution does not choose
between duplicate heading fragments.

## Ownership Pins

Resolution requires:

- accepted TOC semantic plan and exact TOC id;
- measured TOC whose semantic and TOC fingerprints match that plan;
- complete TOC pagination manifest pinned to that measurement;
- complete heading-page map for the same semantic document; and
- zero or one map entry for every generated TOC heading identity.

Any owner/fingerprint/completeness drift blocks before resolved entries are
returned. Missing heading identities are retained as partial unresolved entries
rather than treated as ownership drift.

## Resolution And Capacity

Resolved entries preserve composite identity, label, level, ordinals, measured
row index, and TOC page placement reference. They add heading destination
`pageIndex` and formatted decimal `pageNumberText`.

Producer fingerprints are retained once as browser-safe SHA-256 digests in the
result-level `pins`. Entry
references do not repeat measurement, manifest, or heading-map fingerprints;
their row/placement/destination facts are scoped by those exact top-level pins.
This prevents content-sized fingerprints from expanding serialized resolution
output quadratically at large entry counts.

The final resolution fingerprint is also a SHA-256 digest of the resolved facts
rather than a second escaped copy of those facts. Exact raw upstream equality
is still validated before projection; compact digests are retained output pins.

The decimal digit count is compared with retained
`pageNumberCapacityDigits`. Capacity overflow remains a resolved destination
fact, but marks capacity as `overflow` and blocks renderer readiness. It never
widens geometry, changes resolution status, or triggers hidden remeasurement.

Missing heading destinations produce `partial`, retain unresolved entries with
null page facts, and block final renderer readiness. A strict mode may reject
partial output entirely; v1 exposes partial diagnostics but no renderer-ready
claim.

Preview readiness permits authored-preview heading labels, but requires every
page reference and number capacity to be complete. Artifact readiness has the
same requirements and additionally blocks while any field-backed heading label
still requires materialization. The accepted heading-page map's
`documentPaginationFingerprint` is retained as the document-composition pin.
Neither readiness lane emits renderer commands or starts a retry.

## PASS Criteria

- exact TOC window-chain finalization with no missing/duplicate pages or rows;
- strict complete heading-page map shape and ownership;
- semantic/measurement/pagination/document fingerprint pins;
- deterministic resolved composite entries and TOC placement references;
- missing heading partial diagnostics and explicit capacity overflow facts;
- renderer readiness only when every entry resolves within capacity;
- immutable JSON-safe inputs and byte-identical repeated output;
- 1,000-entry linear resolution evidence;
- no measurement, pagination execution, relayout, rendering, artifact,
  persistence, network, DOM, or editor state.

## RISK

- The heading-page map has no production v4 whole-document producer yet.
- Decimal-only page text excludes roman/prefixed formats.
- Retaining all TOC pages in a manifest may be large for very long documents.
- Partial resolution is diagnostic, not safe renderer output.

## UNKNOWN

- Whole-document v4 pagination composition and first-fragment policy owner.
- Page-number formatting/version contract beyond positive decimal integers.
- Durable manifest/map retention and content-addressed storage.
- Whether product policy allows exporting partial TOCs.

## Intentionally Not Changed

- semantic, measurement, and page-window pagination behavior;
- document v3 final page resolver;
- whole-document v4 pagination composition;
- renderer/artifacts, authoring, backend persistence, and editor UI.

## Next Direction

Implement window-chain finalization and strict heading-page map parsing first,
then resolve entries and expose readiness without claiming a producer exists.
