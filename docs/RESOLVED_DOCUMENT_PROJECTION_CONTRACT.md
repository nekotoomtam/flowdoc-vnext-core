# Resolved Document Projection Contract

Status: Phase 274 pure core contract.

## Decision

`resolveVNextDocumentV1(...)` converts one strict Phase 273 input set into a
deterministic renderer-facing projection. It preserves a cloned materialized
graph and emits separate field, image, and style binding tables. It does not
replace field or image authored nodes in place because authored identity must
remain available for provenance, selection, history, and later migration.

Resolution is all-or-blocked. A projection with invalid structure, value type,
field, style, or media references is not returned as partially usable output.

## Field Binding

Inline `field-ref` accepts scalar field definitions only. Values resolve in
this order:

1. a compatible value in the pinned Data Snapshot;
2. the authored inline fallback; or
3. an empty string when the optional value and fallback are both absent.

Text, date, and enum strings are preserved. Finite numbers and booleans use
locale-independent JavaScript string forms. Unknown keys, incompatible values,
image/collection inline fields, and non-finite numbers block resolution.

Phase PDF-PILOT-08B-R2C-A intentionally leaves this resolver behavior intact.
Typed display formatting is a separate Published Structure-owned sidecar and
overlay. It retains the raw resolved binding string beside each display string
so selection/provenance and future measurement inputs do not rewrite authored
or resolved facts.

Field definitions remain in the Published Field Contract. A Data Snapshot may
provide values but cannot change a field key, label, type, or capability.

## Image Binding

- authored `asset-ref` resolves only from Published Static Media;
- `image-field-ref` values resolve only from Instance Media;
- a missing/null image value uses its authored static fallback when present;
- a missing/null optional image without a fallback resolves to an explicit
  empty image binding; and
- missing assets or non-image field definitions block resolution.

The output identifies both `assetId` and asset owner. Static and instance media
registries are embedded as cloned resource facts so a renderer does not fetch
mutable media metadata while consuming the projection. Media bytes remain
outside core.

## Style Binding

A text block `textStyleId` resolves to one Published Style Catalog preset. The
binding carries the preset run style and explicitly preserves local inline run
style as the override layer. Missing style keys block the projection. Phase 274
does not add style inheritance, block/layout presets, or font-file fetching.

## Preserved Boundaries

The projection records that it did not:

- fetch any input;
- mutate the authored/materialized graph;
- expand TOC, page-number, repeat, or other generated output;
- paginate or measure layout;
- render PDF, DOCX, preview, or other artifacts; or
- persist or advance an instance revision.

Generated expansion must later consume resolved bindings and produce separate
derived facts. It must not become authored graph mutation.

## Non-Goals

- no collection/repeat resolution;
- no locale-specific number/date formatting;
- no renderer adapter activation;
- no package v3 parser or generation-runtime replacement;
- no backend catalog retrieval, media bytes, persistence, or artifact job;
- no editor mock-preview integration yet.
