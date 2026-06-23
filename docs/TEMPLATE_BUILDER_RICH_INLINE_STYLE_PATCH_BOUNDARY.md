# Template Builder Rich Inline Style Patch Boundary

Status: Phase 81 implementation boundary.

Phase 81 adds a bounded browser-local style patch request boundary for active
WYSIWYG drafts. It lets the sandbox describe when a selected draft range could
become an `inline.style.patch` intent later, while preserving the current rule
that rich inline runs are not applied or serialized by the browser draft path.

This is a style patch request boundary. It does not apply inline style to
authored inline runs.

## Purpose

The active draft flow now has a rich-style planning step:

```text
draft selection range
  -> inline style patch summary
  -> canvas / inspector / status visibility
  -> later rich inline execution phase
```

The summary exists so toolbar state, field chips, style-aware history, and
style-aware live-layout phases have a bounded style intent contract to attach
to. It does not make textarea text rich, and it does not mutate package data.

## Module Ownership

`examples/template-builder-sandbox/public/draftInlineStylePatch.js` owns:

- `DRAFT_INLINE_STYLE_PATCH_SOURCE`;
- `DRAFT_INLINE_STYLE_PATCH_MODE`;
- `createDraftInlineStylePatch(...)`;
- `draftInlineStylePatchLabel(...)`;
- supported style marks for the boundary: `bold`, `italic`, `underline`, and
  `strikethrough`;
- selected range start/end/length facts;
- selected text preview;
- style request readiness for idle, guarded, composing, and ready states;
- explicit `application.status = "not-applied"`;
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
coordination.

## Truth Boundary

The style patch summary is browser-local planning state:

- active draft text remains plain local draft text;
- canonical package state is unchanged;
- authored inline runs are not patched;
- command readiness in `draftRuntime.js` still keeps `inline.style.patch` as a
  planned rich-inline command;
- authoring history is unchanged until a later accepted core transaction path;
- live layout and exact output are not run by style planning;
- export readiness remains outside the active draft path.

## Acceptance Evidence

Phase 81 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- the inline style patch module exposes source/mode constants and pure helpers;
- collapsed selections are guarded;
- composing drafts block style patch requests;
- non-collapsed ranges can produce a ready style patch summary;
- ready summaries still report `not-applied`, `not-run`, `not-recorded`,
  `not-requested`, and `deferred-until-commit`;
- `app.js` imports the module and renders `data-draft-style-patch`;
- action lanes expose the style patch planning boundary.

## Non-Goals

Phase 81 does not apply inline style, implement rich inline range mapping,
mutate authored inline runs, change `draftRuntime.js` command execution,
introduce toolbar buttons or toolbar state, add field/key chips, create
style-aware history records, request live layout, run exact layout, alter
renderer output, add backend API routes, add storage/collaboration behavior, or
change package/document schema.
