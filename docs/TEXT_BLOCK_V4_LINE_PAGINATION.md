# Text-block V4 Line Pagination

Status: Phase 279 measured-line fragments and representative scale acceptance.

## Decision

`paginateVNextTextBlockV4Lines(...)` consumes only Phase 278 accepted measured
lines. It packs whole lines into bounded page-body height and emits one derived
fragment per occupied page. It never measures, wraps, or splits a line again.

One canonical text-block may produce many page fragments. Every fragment keeps
the same `nodeId`, ordered line indexes, and canonical/resolved source range.
Fragment ids are deterministic from text-block id, page index, and line range.

## Placement

- lines remain in accepted order;
- a line moves to the next page when it would exceed remaining body height;
- one measured line may not exceed page-body height;
- page-local line offsets are derived from measured heights; and
- page used/remaining height is explicit.

Widow/orphan policy, paragraph keep rules, and mixed-node page flow are not
invented in this isolated text-block slice. Those belong to the later document
layout pipeline.

## Identity And Source

Pagination allocates fragment identity only. It allocates no authored node or
inline identity and does not mutate the document. A field value that wraps over
multiple pages retains the same authored field placement id plus resolved
offsets at each fragment boundary.

Renderers must consume retained page lines/fragments and may not rewrap authored
or resolved text independently.

## Scale Evidence

The required test constructs 6,000 accepted measured lines at 24 lines per page
and proves exactly 250 pages/fragments. Every page is a bounded 24-line slice,
first/last pages retain source facts, and planning completes below the local
1.5-second regression threshold.

This is representative text-block scale evidence, not a claim that a complete
250-page mixed document with tables, columns, images, generated nodes, backend
jobs, and renderer bytes is ready.

## Non-Goals

- no text measurement or line breaking;
- no mixed-node/document pagination or page margin calculation;
- no widow/orphan, keep-with-next, or paragraph split policy;
- no columns parallel cursors or table row/cell splitting;
- no renderer commands, artifact bytes, editor viewport, or backend jobs;
- no cross-page caret hit testing or selection painting.
