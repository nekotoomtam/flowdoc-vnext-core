# Template Builder Field Chip Inline Boundary

Status: Phase 83 implementation boundary.

Phase 83 adds a bounded browser-local field chip inline summary for active
WYSIWYG drafts. It lets the sandbox surface catalog-backed field chips and a
future caret insertion intent while preserving the current rule that browser
drafts do not insert authored `field-ref` nodes.

This is a field chip inline boundary. It does not insert field refs.

## Purpose

The active draft flow now has a field-chip planning step:

```text
snapshot field catalog
  -> active draft caret/selection
  -> field chip inline summary
  -> canvas / inspector / status visibility
  -> later inline field-ref execution phase
```

The summary exists so future atomic field chips, toolbar/menu state, field-key
selection, style-aware history, and rich inline command dispatch have a bounded
catalog contract to attach to.

## Module Ownership

`examples/template-builder-sandbox/public/draftFieldChipInline.js` owns:

- `DRAFT_FIELD_CHIP_INLINE_SOURCE`;
- `DRAFT_FIELD_CHIP_INLINE_MODE`;
- `createDraftFieldChipInline(...)`;
- `draftFieldChipInlineLabel(...)`;
- bounded field catalog normalization from snapshot field summaries;
- selected field key marking;
- caret insertion position facts;
- idle, guarded, composing, and ready status derivation;
- explicit `command = "inline.fieldRef.insert"`;
- explicit `insertion.status = "not-applied"`;
- explicit `coreTransaction.status = "not-run"`;
- explicit `history.status = "not-recorded"`;
- explicit `liveLayout.status = "not-requested"`;
- explicit `exactGeneration.status = "deferred-until-commit"`.

The module is browser-safe and Node-testable. It does not read DOM nodes, call
`fetch`, run core text transactions, apply packets, append history, request
live layout, run exact layout, or serialize package data.

## App Shell Boundary

`examples/template-builder-sandbox/public/app.js` consumes the summary in:

- the canvas draft footer;
- the inspector draft panel;
- the status bar.

The app shell still owns DOM event binding, focus restoration, render updates,
bridge fetches, packet application, viewport coordination, and structural
coordination. Phase 83 intentionally does not add a field picker or insert
chips into the draft text.

## Truth Boundary

Field chip inline state is browser-local planning state:

- active draft text remains local plain text;
- canonical package state is unchanged;
- authored `field-ref` inline nodes are not inserted;
- non-collapsed ranges remain guarded until rich inline range mapping exists;
- authoring history is unchanged;
- live layout and exact output are not run by field chip planning;
- export readiness remains outside the active draft path.

## Acceptance Evidence

Phase 83 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- the field chip inline module exposes source/mode constants and pure helpers;
- field catalogs are normalized into bounded chip summaries;
- caret selection can produce a ready insert-request summary;
- selected ranges remain guarded until inline range mapping exists;
- active composition blocks field chip requests;
- insertion/core/history/live/exact statuses remain not-applied, not-run,
  not-recorded, not-requested, and deferred;
- `app.js` imports the module and renders `data-draft-field-chip-inline`;
- action lanes expose the field chip inline boundary.

## Non-Goals

Phase 83 does not insert field refs, add a visible field picker, modify draft
text with chip placeholders, implement rich inline range mapping, edit field
keys, migrate key history, create style-aware history records, request live
layout, run exact layout, alter renderer output, add backend API routes, add
storage/collaboration behavior, or change package/document schema.
