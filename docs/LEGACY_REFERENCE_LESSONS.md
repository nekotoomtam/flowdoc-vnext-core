# Legacy Reference Lessons

Status: draft architecture reset.

The old FlowDocEditor repository is reference evidence only. This document
records what to learn from it and what not to copy into vNext.

## How To Use Legacy Reference

Use the old repository to learn:

- product behaviors users need;
- WYSIWYG and IME pain points;
- key registry and data snapshot requirements;
- field placement behavior;
- export/API expectations;
- table and large-document stress scenarios;
- failure modes caused by coupling.

Do not use it as:

- source of canonical vNext input shapes;
- a source for wholesale file moves;
- a reducer/runtime architecture blueprint;
- a compatibility adapter inside exported core;
- a reason to keep prototype node names.

Any copied unit must pass `docs/LEGACY_MIGRATION_GATE.md`.

## Useful Lessons To Keep

### Template/Data Separation

Legacy docs correctly separated authored template structure from submitted or
snapshot field values. vNext should keep values outside authored nodes and
resolve them only in binding/generation runtime views.

### Field Registry

The package-level field registry direction is useful. A field key is stable
data identity, not a node id or visual label.

### Generated Output Boundary

Generated preview/export output should be derived state. It must not replace
editor state, history, selection, or the saved template package.

### Typing Needs A Local Owner

The old editor eventually needed a native edit layer as the active typing
visual owner. That is evidence that active typing cannot wait for full
pagination and measured renderer output.

### Large Documents Are A First-Class Product Case

The old system was close for normal documents but broke under very large
documents. vNext must treat large documents as an acceptance scenario, not a
late performance pass.

## Failure Modes To Avoid

### Backend Truth Pulling The Frontend

The old architecture leaned toward server/API pagination as final settling
truth while the browser authoring surface tried to keep up through preview and
reconciliation. vNext should keep exact generation deterministic without making
it the keystroke path.

### Runtime Layer Accumulation

Preview settle guards, WYSIWYG draft bridges, shell adapters, worker lanes, and
current/vNext bridge hosts were reasonable local repairs, but together they
became architecture. vNext should make the authoring runtime explicit instead
of building it as patches around an export engine.

### Node Proliferation

Prototype node names and visual/workflow variants expanded too easily. vNext
should use node families, roles, props, and capabilities before adding new node
types.

### Coarse Text Replacement

Whole-block text replacement is acceptable for import or automation, but it is
not a large-document typing strategy. vNext needs granular text transactions.

### Compatibility Drift

Accepting old/raw/current shapes in too many places makes it hard to know which
model is true. vNext exported core remains canonical package v2/document v3
only.

## Reference Evidence Categories

When reading old code or docs, classify findings as:

- `KEEP_REQUIREMENT`: product behavior needed in vNext;
- `KEEP_CONTRACT`: concept that should be rewritten in vNext terms;
- `AVOID_PATTERN`: architecture or coupling to avoid;
- `DEFER`: useful future idea not in the first slice;
- `REJECT`: incompatible with vNext canonical boundaries.

This classification should appear in handoffs when legacy evidence influences
design or implementation.

## Deferred Legacy Concepts

Do not implement these in the reset baseline unless separately accepted:

- key history;
- repeat regions;
- collection binding;
- reviewer/submission workflow;
- collaborative editing;
- current editor adapters;
- visible parent app runtime flip;
- PDF/DOCX concrete renderer rewrites.

## Review Gate

Before any legacy-influenced implementation:

- cite the old evidence;
- state what category it falls into;
- state why vNext needs it;
- rewrite names/contracts into vNext vocabulary;
- add vNext tests;
- prove canonical parsers still reject old/prototype shapes.
