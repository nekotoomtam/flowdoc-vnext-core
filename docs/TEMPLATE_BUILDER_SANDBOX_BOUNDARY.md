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

## Non-Goals

Phase 27 does not implement:

- real typing or text transaction UI;
- DOM selection mapping;
- IME behavior;
- live layout rendering;
- scheduler or worker queues;
- backend API routes;
- save/publish persistence;
- exact layout, preview, PDF, or DOCX rendering.

## Extraction Rule

When this sandbox moves to its own repository:

- keep the package name or rename it at the app layer;
- replace `file:../..` with the selected package consumption strategy;
- keep imports on `@flowdoc/vnext-core`;
- keep generated/editor-only state out of canonical package data;
- preserve the root boundary tests in the new consumer repo.
