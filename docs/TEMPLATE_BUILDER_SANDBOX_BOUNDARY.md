# Template Builder Sandbox Boundary

Status: Phase 27 implementation boundary.

The template builder sandbox lives in `examples/template-builder-sandbox`.
It is intentionally shaped like a small independent repository so the future
frontend can move out of the core package without changing the core contract.

## Purpose

Phase 27 provides a runnable shell for the Phase 26 runtime map:

- toolbar;
- node tree;
- document canvas / live view placeholder;
- inspector;
- status bar;
- core-backed diagnostics snapshot.

The sandbox is not the canonical template source. The canonical source remains
package v2/document v3 consumed through `@flowdoc/vnext-core`.

## Dependency Boundary

The sandbox package depends on:

```json
"@flowdoc/vnext-core": "file:../.."
```

Sandbox source imports the core through the public package name. It must not
import `../../src/**`, parent editor paths, current runtime paths, app routes,
reducers, DOM renderer state, or persistence compatibility paths.

The root package does not gain React, Vite, app runtime, or browser framework
dependencies for this phase.

## Runtime Boundary

The first browser shell reads a generated snapshot:

```text
canonical fixture
  -> sandbox Node bridge
  -> @flowdoc/vnext-core public entrypoint
  -> snapshot JSON
  -> static browser shell
```

This keeps the browser app runnable while avoiding a fake browser import of
TypeScript core source. A later frontend phase can replace the snapshot bridge
with a proper bundler/runtime adapter.

## Current Guarantees

- The shell can be run from the sandbox package without root package scripts.
- The snapshot is generated from canonical vNext package input.
- The snapshot bridge calls editable-session and generation-readiness core
  APIs.
- Browser-visible state stays outside package serialization.
- Root tests guard the sandbox boundary.
- Phase 28 adds browser-only node selection and inspector context while keeping
  those interaction facts out of canonical package data and generated snapshot
  persistence.
- Phase 29 adds one in-memory mutation bridge action for plain text-block
  replacement. The browser sends the action to the sandbox server, the server
  calls vNext core, and the browser refreshes from the returned snapshot.
- Phase 30 adds a packet-only mutation response option so future browser cache
  work can consume changed-node facts without requiring a complete snapshot
  payload after every action.
- Phase 31 makes the browser consume packet-only bridge responses after boot
  through a derived runtime cache and node index.
- Phase 32 adds an explicit append-text action that uses `text.insert` through
  the same bridge, packet, and browser cache path without DOM caret or IME
  handling.
- Phase 33 appends vNext authoring intent history records for accepted bridge
  text transactions and exposes a bounded history summary in snapshots,
  packets, inspector, and status.
- Phase 34 adds executable sandbox undo/redo for accepted bridge text
  mutations through bounded in-memory text patches and the existing packet
  cache path.
- Phase 35 adds bounded live-layout request summaries to snapshots and packets
  using the existing core live-layout boundary, without adding a live renderer
  or exact layout execution.
- Phase 37 adds browser-local WYSIWYG draft editing for safe text blocks on the
  canvas, with commit through the existing bridge packet path and guards for
  atomic or styled inline content.
- Phase 38 adds browser-local draft selection range tracking while a WYSIWYG
  draft is active.
- Phase 39 derives browser-local draft command context and readiness from that
  selection before any command execution is wired.

## Non-Goals

The sandbox does not yet implement:

- rich text editing;
- command execution from draft context;
- durable DOM selection mapping beyond active textarea drafts;
- IME behavior;
- live layout rendering beyond bounded request summaries;
- scheduler or worker queues;
- backend API routes;
- save/publish persistence;
- durable/full undo/redo replay beyond sandbox text patches;
- exact layout, preview, PDF, or DOCX rendering.

## Extraction Rule

When this sandbox moves to its own repository:

- keep the package name or rename it at the app layer;
- replace `file:../..` with the selected package consumption strategy;
- keep imports on `@flowdoc/vnext-core`;
- keep generated/editor-only state out of canonical package data;
- preserve the root boundary tests in the new consumer repo.
