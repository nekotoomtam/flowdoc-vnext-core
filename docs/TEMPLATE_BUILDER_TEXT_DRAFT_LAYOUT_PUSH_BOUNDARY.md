# Template Builder Text Draft Layout Push Boundary

Status: Phase 79 implementation boundary.

Phase 79 adds a bounded browser-local layout push summary for active WYSIWYG
text drafts. It lets the sandbox surface how a local draft would affect the
visible text block while preserving the Phase 36/37 rule that active typing is
not canonical document truth and must not run exact layout.

This is a local preview boundary, not a live renderer or export-readiness
claim.

## Purpose

The active draft flow now carries a small layout-preview summary:

```text
browser-local draft text
  -> draft runtime state
  -> draft layout push summary
  -> canvas / inspector / status visibility
  -> existing bridge commit
  -> packet / history / live-layout summary after commit
```

The summary exists so later live-layout and rich editing phases have a bounded
place to connect. It does not make draft text durable and does not ask core
pagination or generation to run during typing.

## Module Ownership

`examples/template-builder-sandbox/public/draftLayoutPush.js` owns:

- `DRAFT_LAYOUT_PUSH_SOURCE`;
- `DRAFT_LAYOUT_PUSH_MODE`;
- `createDraftLayoutPush(...)`;
- `draftLayoutPushLabel(...)`;
- local status/reason derivation for idle, stable, preview, and composing
  draft states;
- text length and delta facts for the active draft;
- explicit `liveLayout.status = "not-requested"`;
- explicit `exactGeneration.status = "not-run"`;
- `localPreviewOnly = true`.

The module is browser-safe and Node-testable. It does not read DOM nodes, call
`fetch`, run core text transactions, apply packets, append history, request
live layout, run exact layout, or serialize package data.

## App Shell Boundary

`examples/template-builder-sandbox/public/app.js` consumes the summary in:

- the canvas draft footer;
- the inspector draft panel;
- the status bar.

The app shell updates the summary when draft DOM state is synchronized and
before full render markup is produced. It remains responsible for DOM updates,
focus, bridge commits, packet application, and viewport coordination.

## Truth Boundary

Draft layout push is a browser-local preview signal:

- active draft text remains local until commit;
- canonical package state is unchanged;
- authoring history is unchanged;
- live-layout request count is unchanged;
- exact generation remains `not-run`;
- export readiness remains outside the active draft path.

Accepted bridge commits still produce the real dirty scope, history, packet,
and live-layout summary through the existing mutation bridge.

## Acceptance Evidence

Phase 79 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- the draft layout push module exposes source/mode constants and pure helpers;
- idle/stable/preview/composing states produce bounded summaries;
- composing drafts are labeled without creating live layout requests;
- exact generation is explicitly `not-run`;
- `app.js` imports the module and renders `data-draft-layout-push`;
- action lanes expose the layout push boundary.

## Non-Goals

Phase 79 does not implement:

- live layout rendering during active typing;
- exact layout during active typing;
- renderer-backed measurement;
- line wrapping, page breaking, or page geometry for draft text;
- contenteditable DOM mapping;
- rich inline range mapping;
- field/key chips;
- per-keystroke core transactions;
- durable history or persistence;
- backend API routes, storage, collaboration, or package/document schema
  changes.
