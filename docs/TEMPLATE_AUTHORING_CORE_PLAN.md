# Template Authoring Core Plan

Status: draft architecture reset.

This plan resets the vNext direction around the real product shape:
FlowDoc is a dynamic, node-based document generation template builder. The
front end must let authors compose and edit templates smoothly, and the back
end must generate deterministic output from the same template contract.

The old FlowDocEditor repository is reference evidence only. Its field,
binding, WYSIWYG, pagination, and API documents are useful lessons, but its
runtime shape, reducer coupling, preview reconciliation layers, and legacy
document inputs are not vNext source of truth.

## Product Goal

Users should be able to:

- compose a document template from nodes;
- type and edit template content smoothly in the browser;
- define and place field keys;
- preview template binding with sample data;
- save a canonical template package;
- call an API with template plus data and receive generated output.

The product is not a fixed-form template system, and it is not a general word
processor clone. It is a document-generation authoring system where node
composition, key placement, and API generation are first-class.

## Reset Decision

vNext needs one shared template core and two runtime profiles:

```text
Shared Template Core
  schema / node graph / key registry / validation / operations / package IO
        |
        |-----------------------------|
        |                             |
Frontend Authoring Runtime       Backend Generation Runtime
typing / selection / IME         template + data binding
node composition                 exact layout and export
dirty scopes / live layout       deterministic artifacts
local undo                       API diagnostics
```

These are two runtimes, not two unrelated document models. Both must consume
the same canonical template package and shared core contracts.

## Current Evidence

- `src/persistence/package.ts` already makes package v2/document v3 the
  canonical persisted input.
- `src/runtime/session.ts` creates a package-based runtime session but does
  not model a live editable authoring session.
- `src/operations/commands.ts` still exposes `text-block.text.replace`, which
  is useful for bulk replacement but too coarse as the primary keystroke path.
- `src/pagination/layoutPipeline.ts` still calls `paginateVNextDocument(...)`
  for complete pagination artifacts, which fits generation/export better than
  active browser typing.
- `docs/VNEXT_CORE_REDESIGN_PLAN.md` correctly separates authored state from
  generated artifacts, but it is still biased toward package/runtime/layout
  processing rather than front-end authoring latency.

## Truth Model

| Truth | Durable | Owner | Notes |
|---|---:|---|---|
| Canonical template package | yes | shared template core | Package v2/document v3 authored state. |
| Editable session state | no | frontend authoring runtime | Selection, IME, local drafts, dirty scopes, viewport state. |
| Key registry | yes | package/shared core | Key definitions and validation policy. |
| Data snapshot/request data | request or package scoped | binding/generation | Values are outside authored nodes. |
| Bound runtime view | no | binding/generation | Derived from template plus data. |
| Live layout cache | no | frontend authoring runtime | Fast preview and viewport rendering only. |
| Exact measured pagination | no | generation/runtime layout | Export and API artifact truth. |
| Generated artifacts | output durable | generation service | PDF/DOCX/preview/storage outputs. |

Generated output must not replace the authored template unless a future
explicit materialization operation is designed and accepted.

## Non-Negotiables

- Keystrokes must not require full-document render, graph rebuild, and exact
  pagination.
- The frontend authoring runtime must be first-class, not a thin consumer of a
  backend export engine.
- The backend generation runtime must remain deterministic and API-safe.
- The frontend and backend must share schema, key, operation, validation, and
  package contracts.
- Editor-only state must never be stored in `DocumentNode`.
- Field values must not be written back into template text as authored truth.
- Old/prototype document shapes must stay outside exported vNext core.
- New node types require relationship/layout/export behavior that cannot be
  represented as a role, prop, capability, or inline node.

## Architecture Docs

This plan is the entrypoint for the reset. Supporting contracts:

- `docs/SHARED_TEMPLATE_CORE_CONTRACT.md`
- `docs/NODE_FAMILY_CAPABILITY_MODEL.md`
- `docs/FRONTEND_AUTHORING_RUNTIME_PLAN.md`
- `docs/TEXT_EDITING_TRANSACTION_PLAN.md`
- `docs/LIVE_LAYOUT_AND_EXACT_GENERATION_PLAN.md`
- `docs/KEY_REGISTRY_BINDING_PLAN.md`
- `docs/BACKEND_GENERATION_RUNTIME_PLAN.md`
- `docs/LARGE_DOCUMENT_PERFORMANCE_CONTRACT.md`
- `docs/LEGACY_REFERENCE_LESSONS.md`

## Implementation Lanes

### Lane A: Contract Baseline

Lock the shared core, node family, key, authoring runtime, generation runtime,
and performance contracts in docs before implementation churn resumes.

### Lane B: Editable Session Foundation

Add a browser-safe editable session type over canonical packages. It should own
working document, selection, local drafts, dirty scopes, and transaction log
metadata without introducing DOM or React dependencies into shared core.

### Lane C: Granular Text Transactions

Add text-position and text-edit operation contracts that can support typing,
deletion, split, merge, inline field placement, IME commit, and one-history-entry
typing sessions.

### Lane D: Live Layout Boundary

Add a live layout/cache boundary that consumes dirty scopes and visible ranges.
It may be approximate during typing, but it must preserve model consistency and
settle to exact generation layout when needed.

### Lane E: Generation Runtime API

Add generation runtime contracts for template package plus data to diagnostics,
bound runtime view, exact pagination, renderer commands, and artifacts.

## Stop Conditions

Stop for owner review before:

- changing package or document versions;
- accepting current/legacy editor documents as canonical input;
- adding key history storage;
- adding collection/repeat runtime behavior;
- making browser live layout export-ready by default;
- returning generated output as saved template state;
- copying old editor runtime/reducer/WYSIWYG layers into this repository.

## Acceptance

This reset is accepted when:

- the shared core and two-runtime model are documented;
- the node family model prevents prototype-style node proliferation;
- large-document behavior is a first-class contract;
- key/data/generated-output separation is preserved;
- the next implementation patch can start without consulting old runtime
  internals as an architecture source.
