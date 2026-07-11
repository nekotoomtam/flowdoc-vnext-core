# Text-block V4 Measurement Source Ranges

Status: Phase 278 resolved measurement packet and line-range acceptance.

## Decision

Exact v4 text measurement consumes a source packet built from one Resolved
Document text-block. The packet carries rendered text/runs, authored inline
identity, resolved field values, inline-image frame/asset facts, style keys,
instance revision, available width, and measurement profile identity.

This phase does not choose or execute a line-breaking engine. It validates the
request boundary and accepts externally measured line ranges only when they
cover the rendered stream completely and map back to safe source boundaries.

## Resolved Runs

The packet retains four run kinds:

- authored text with local style override;
- resolved field text with field key;
- authored hard break; and
- inline image with resolved asset id and authored frame.

An unresolved field/image binding blocks request creation. Page-number blocks
exact measurement until generated expansion provides page-specific text. Core
does not silently substitute placeholder digits.

## Field Source Mapping

Field-ref remains one atomic authored slot but its resolved value may wrap over
multiple measured lines. A measured source point therefore records:

- `inlineId` for the authored placement;
- `authoredOffset` (`0` before or `1` after the atomic);
- `resolvedOffset` inside the displayed field value; and
- affinity at shared run boundaries.

This permits pagination/source-range mapping without allowing canonical editor
selection inside an atomic field placement.

Text run points use the same local UTF-16 offset for authored and resolved
coordinates. Inline image and hard-break points retain atomic offsets.

## Measured Line Acceptance

Accepted lines must:

- have contiguous indexes from zero;
- use ordered non-negative integer ranges;
- cover the complete rendered stream without gaps or overlap;
- use finite non-negative width and positive height;
- place boundaries on safe UTF-16 offsets; and
- return one zero-range line for an empty text-block.

Every accepted line receives canonical/resolved source start and end points.
This is the source contract later pagination fragments must retain.

## Non-Goals

- no shaper, line breaker, font loading, or engine selection;
- no generated page-number expansion;
- no pagination, page assignment, renderer, or artifact execution;
- no inline-image baseline/line-height algorithm;
- no cross-page caret or editor DOM mapping;
- no backend measurement job or cache activation.
