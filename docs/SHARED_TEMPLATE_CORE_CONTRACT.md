# Shared Template Core Contract

Status: draft architecture reset.

The shared template core is the contract used by both the frontend authoring
runtime and the backend generation runtime. It must be small, deterministic,
browser-safe, Node-safe, and independent from React, DOM state, API routes,
renderer state, and parent editor runtime code.

## Goal

Provide one canonical model for:

- template package parsing and serialization;
- authored document schema;
- node relationship graph;
- node capabilities and containment rules;
- key registry and field references;
- operation and transaction contracts;
- validation and diagnostics;
- invalidation scopes;
- generation-ready binding inputs.

The shared core does not own active browser selection, caret geometry, IME
composition state, local input mirrors, API transport, storage policy, or
concrete PDF/DOCX rendering.

## Layer Shape

```text
FlowDocPackage v2/document v3
  -> parse
  -> normalize
  -> assert
  -> shared runtime indexes
       document graph
       key registry indexes
       operation registry
       validation diagnostics
  -> consumers
       frontend authoring runtime
       backend generation runtime
```

## Public Contracts

### Package

The canonical persisted input remains package v2 containing document v3 until
a separate migration design is accepted.

Responsibilities:

- parse canonical package input;
- reject unsupported package/document versions;
- serialize canonical authored state;
- carry package metadata, document, fields, and optional data snapshot.

Not responsibilities:

- persist editor-only session state;
- persist generated output;
- accept old/prototype document shapes as canonical input.

### Document Schema

The document schema defines authored structure only.

Responsibilities:

- sections and zones;
- node graph;
- text blocks and inline children;
- layout containers;
- table structure;
- utility and generated placeholders.

Not responsibilities:

- store pagination fragments;
- store selection/caret/hover/drag state;
- store resolved field values;
- store layout caches.

### Relationship Graph

The graph is derived runtime metadata over authored nodes.

Responsibilities:

- node lookup;
- parent/child/sibling lookup;
- nearest section/zone/layout/table context;
- containment validation;
- operation target validation;
- invalidation scope discovery.

Not responsibilities:

- become persisted JSON;
- infer UI selection state;
- depend on rendered geometry.

### Key Registry

The key registry describes field identities and allowed data types.

Responsibilities:

- define keys and labels;
- define scalar/asset/collection type policy;
- validate field references;
- support binding and generation diagnostics;
- reserve room for future key history.

Not responsibilities:

- store current resolved values inside field references;
- store actor/reviewer/submission history in this first slice;
- make collection/repeat behavior implicit before it is designed.

### Operations And Transactions

Operations are durable authored mutations. Transactions may group multiple
low-level edits into one user intent.

Responsibilities:

- validate target and parent;
- mutate authored document immutably;
- emit scope and invalidation metadata;
- emit history-ready records;
- support replay where deterministic.

Not responsibilities:

- dispatch React state updates;
- run layout/pagination;
- own API transport;
- store selection-only updates as document mutations.

## Runtime Independence Rules

The shared core must not import:

- parent app routes;
- editor reducers;
- renderer state;
- browser DOM state;
- storage/localStorage;
- API route handlers;
- concrete PDF/DOCX implementations unless they consume stable artifacts.

It may expose pure contracts and helpers used by those consumers.

## Validation Tiers

Shared validation should support:

- package validation;
- document graph validation;
- node containment validation;
- key registry validation;
- field reference validation;
- data snapshot validation;
- operation precondition validation;
- generation readiness validation.

Validation results must distinguish blocking errors from authoring warnings.
Missing non-required data can be a generation warning; malformed graph
relationships are document errors.

## Initial Deliverables

- Shared type contracts for editable sessions and generation inputs.
- Relationship graph capabilities aligned with node families.
- Granular text transaction contracts.
- Key registry validation over canonical vNext inline `field-ref` nodes.
- Data snapshot validation over package-level `data`.
- Invalidation scopes suitable for live layout and exact generation.

## Non-Goals

- No visible editor implementation in shared core.
- No concrete API routes in shared core.
- No key history persistence yet.
- No repeat/collection materialization yet.
- No current editor compatibility adapter in exported core.
