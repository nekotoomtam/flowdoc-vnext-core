# Runtime Usage Map

Status: Phase 26 design baseline.

This document maps how the vNext core is used by the future template builder
frontend and backend generation runtime. It is not a visual design spec and it
does not authorize React, DOM, route, renderer, or storage implementation.

## Purpose

FlowDoc vNext has one shared core and two runtime profiles:

- frontend authoring runtime for editing templates;
- backend generation runtime for diagnostics and future artifacts.

Both runtimes must use the same canonical package/document model. Neither
runtime may invent a second document truth.

```text
Template Builder UI
  -> @flowdoc/vnext-core authoring/session/transactions/history/live-layout
  -> canonical package v2/document v3

Generation API
  -> @flowdoc/vnext-core generation readiness/exact-layout contracts
  -> derived artifacts, never authored document mutation
```

## First Product Shape

The first usable template builder should feel like an editor, not a marketing
page:

```text
+------------------------------------------------------------------+
| Toolbar: save, undo, redo, insert, diagnostics, generate preview |
+-------------------+------------------------------+---------------+
| Node tree         | Document canvas / live view   | Inspector     |
| - sections        | - visible page window         | - node props  |
| - zones           | - editable text blocks        | - field keys  |
| - blocks/tables   | - field-ref chips             | - diagnostics |
+-------------------+------------------------------+---------------+
| Status: dirty scopes, layout pending, exact generation stale      |
+------------------------------------------------------------------+
```

This skeleton is only a runtime map. Visual style, component library, exact
toolbar controls, and responsive polish belong to later frontend phases.

## Ownership Map

| Area | Owner | Examples | Must Not Own |
|---|---|---|---|
| Canonical template | core/package | package v2, document v3, fields, optional data snapshot | DOM selection, API route state |
| Editable session | frontend runtime plus core contracts | working document, session revisions, selection shape, dirty scopes | persisted package-only state |
| Active text draft | frontend runtime | local text buffer, IME composition, caret bridge | exact pagination output |
| Text mutation | core authoring | `runVNextTextTransaction(...)`, dirty scope, history intent | DOM event handling |
| History policy | core authoring plus frontend runtime | intent records, group ids, coalescing metadata | focus restoration implementation |
| Live layout request | core boundary plus frontend runtime | visible range, affected scope, exact-stale marker | final export readiness |
| Exact generation | backend runtime plus core generation/layout | package/data validation, measured pagination, renderer handoff | active typing feedback |
| Artifact output | backend app/runtime | preview/PDF/DOCX bytes or storage ids | authored template mutation |
| AI actions | app runtime plus core action/job contract | proposed edits, approved safe edits, diagnostics requests | direct DOM/document mutation |

## Frontend Flow

### Open Template

```text
load canonical package
  -> createVNextEditableSession(...)
  -> assessVNextKeyDataDiagnostics(...)
  -> initialize viewport window
  -> render shell and visible nodes
```

The frontend may build local indexes and visual state, but save/publish still
targets canonical package serialization.

### Type Text

```text
input event
  -> frontend updates local draft immediately
  -> runVNextTextTransaction(...)
  -> appendVNextAuthoringIntentHistoryResult(...)
  -> resolveVNextLiveLayoutBoundary(...)
  -> schedule visible live-layout job
  -> exact generation stays stale until idle/export
```

Typing must not wait for exact pagination, export readiness, route calls, or
artifact rendering.

### Insert Field Reference

```text
choose registry key
  -> inline.field-ref.insert transaction
  -> field-ref remains atomic authored inline node
  -> history creates one command group
  -> live layout scopes to text-block/parent
```

Field values are not written into authored text. Data binding remains derived
generation state.

### Selection Change

```text
selection move
  -> update frontend selection state
  -> create non-durable selection history record if needed
  -> resolveVNextLiveLayoutBoundary(...) returns no-layout-request
```

Selection-only changes must not create durable document history or layout work.

### Save Template

```text
flush or reject active draft
  -> assert canonical package/document
  -> serializeFlowDocPackageV2DocumentVNext(...)
  -> app persistence saves package
```

Save writes template truth only. It must not persist viewport, caret, hover,
live layout cache, exact layout artifacts, or API status into `DocumentNode`.

## Backend Flow

### Readiness Diagnostics

```text
generation request
  -> safeParseVNextGenerationRequest(...)
  -> assessVNextGenerationReadiness(...)
  -> return diagnostics/status
```

Phase 24 implements this readiness-only path. It does not render artifacts and
does not return a generated authored document.

### Future Artifact Request

```text
generation request
  -> readiness
  -> exact layout job
  -> renderer job
  -> artifact storage/response job
```

The artifact path may be long-running and must carry request ids, template
revision, data revision, and measurement profile identity.

## Core Call Map

| User/System Action | Immediate Core Calls | Background/Deferred Calls | Must Not Do |
|---|---|---|---|
| Open template | `safeParseFlowDocPackageV2DocumentVNext`, `createVNextEditableSession` | initial visible layout request | accept raw current document |
| Type text | `runVNextTextTransaction`, `appendVNextAuthoringIntentHistoryResult` | `resolveVNextLiveLayoutBoundary` for visible range | exact paginate whole document |
| Insert field-ref | `runVNextTextTransaction` with `inline.field-ref.insert` | live layout for text-block/parent | write data value into authored text |
| Selection change | selection record only | none | durable document history |
| Save template | `serializeFlowDocPackageV2DocumentVNext` | optional checkpoint diagnostics | persist editor-only state |
| Generate diagnostics | `assessVNextGenerationReadiness` | none | render artifact |
| Generate artifact | readiness first | exact layout/render/store jobs | mutate template package |
| AI suggest edit | inspect package/session/diagnostics | none | mutate document |
| AI apply safe edit | same transaction/operation as user action plus audit | live layout/exact stale marker | bypass history/dirty scope |

## AI Runtime Use

Future AI assistance should use the same action/job rails as user and system
automation:

```text
AI request
  -> inspect allowed context
  -> propose action(s)
  -> permission/approval gate if mutating
  -> execute approved core transaction/operation
  -> append history/audit metadata
  -> schedule live layout or generation jobs through normal lanes
```

AI should help operate the product, not become a hidden second editor engine.
It must not treat DOM, canvas, generated preview, or exact layout artifacts as
the authored document truth.

Initial AI-safe actions:

- inspect diagnostics and key/data issues;
- suggest where field references should be inserted;
- apply bounded text or field-ref edits when permitted;
- request generation readiness diagnostics;
- explain stale exact generation or blocked readiness states.

AI-restricted actions:

- save/publish template;
- delete large structures;
- render/store artifacts;
- run destructive structural edits;
- change package/schema versions.

Those actions need explicit product permission and approval design before
implementation.

## Large Document Rules

- Active typing works from local draft plus text transaction, not full document
  rendering.
- Dirty scopes are the bridge from authoring to live layout.
- Visible range is frontend runtime state and must not enter authored nodes.
- Exact generation may be full-document, but never inside the keypress path.
- Stale exact layout must be visible as stale, never silently used as ready.

## Phase 27 Handoff

The next frontend phase can build an editor shell against this map:

- shell regions: toolbar, node tree, canvas/live view, inspector, status;
- runtime adapters: open package, type text, insert key, save, diagnostics;
- visible state remains outside package serialization;
- core call boundaries remain testable without browser runtime.
