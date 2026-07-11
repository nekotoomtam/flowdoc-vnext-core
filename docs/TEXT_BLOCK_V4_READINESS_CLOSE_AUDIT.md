# Text-block V4 Readiness Close Audit

Status: Phase 280 core-contract close audit.

## Outcome

Text-block v4 now has enough retained core semantics for columns and table split
planning to begin. This does not mean text-block is fully product-ready. Core
authoring, resolution, source mapping, and isolated line pagination have direct
evidence; browser input, revisioned backend execution, actual measurement-engine
orchestration, mixed document flow, renderer output, and cross-page UX remain
separate incomplete axes.

## PASS

- Canonical empty authored state is `children: []`; runtime caret sentinel is
  never persisted.
- Five flat inline forms have strict grammar and deterministic model projection.
- Canonical selection uses text-block/inline identity, local UTF-16 offset, and
  affinity; fields/images/page numbers/line breaks remain atomic.
- Structure draft and Document Instance rich replacement requires exact
  artifact, policy, field-contract, and session pins.
- Managed field/atomic insert/remove planners preserve identity and feed the one
  policy-aware commit boundary.
- Field definitions, placements, and values remain separate through resolution.
- Resolved field values may wrap while measured lines retain authored placement
  identity plus derived resolved offsets.
- Accepted measured lines retain complete safe source ranges.
- Isolated text line pagination produces one canonical node across many derived
  fragments without renderer relayout.
- A 6,000-line/250-page text-block case passes the bounded local scale gate.

## What This Unblocks

- columns parallel child cursors may consume retained text line fragments;
- table-cell/row split planning may consume retained nested text line ranges;
- backend/editor integration may expose the bounded single-user rich replace
  operation behind revision and stale gates; and
- a v4 measurement adapter may execute the accepted request/result contract.

These are permitted next phases, not completed behavior.

## FAIL / BLOCKER

- No backend route persists the lifecycle-aware v4 rich replacement.
- No editor draft/DOM/IME/clipboard adapter produces and stale-applies the v4
  command.
- No concrete v4 text engine currently executes Phase 278 packets in the layout
  pipeline.
- No mixed-node page composer consumes text fragments with images, utilities,
  columns, tables, generated nodes, headers, or footers.
- Page-number remains blocked before generated expansion.
- No v4 renderer/export adapter consumes these fragments.
- No cross-page caret hit testing, selection painting, or viewport windowing is
  accepted.
- External field-catalog drift reporting remains absent.

## RISK

- Complete rich-inline replacement is acceptable for single-user v1 but can
  overwrite concurrent semantic intent; granular deltas are required before
  collaboration/offline merge claims.
- Field values can create many measured lines from one atomic authored slot;
  editor selection must never adopt resolved offsets as editable caret offsets.
- Inline-image frame participation in line baseline/height remains an engine
  integration risk.
- Mixed 200-300 page documents may be dominated by tables, media, generated
  content, and renderer memory even though isolated text scale passes.
- Page-number/generation reconciliation can create layout cycles if width policy
  is not fixed before measurement.

## UNKNOWN

- Granular typing/style coalescing and collaboration identity allocation.
- Exact inline-image baseline and line-height integration.
- Widow/orphan and keep-with-next policy in mixed document flow.
- Mixed document, backend job, and renderer memory/time thresholds.
- Cross-page browser selection and hit-test acceptance thresholds.

## Files And Evidence

- grammar/selection: `src/authoring/textBlockV4Contract.ts`;
- policy-aware commit: `src/authoring/textBlockV4RichInlineReplace.ts`;
- managed inline planning: `src/authoring/textBlockV4InlineCommands.ts`;
- resolution: `src/resolution/resolvedDocument.ts`;
- measured source ranges: `src/pagination/textBlockV4Measurement.ts`;
- isolated pagination: `src/pagination/textBlockV4Pagination.ts`; and
- direct tests: matching files under `tests/` plus the node-family matrix.

## Intentionally Not Changed

- package v3 parser and active v3 runtime;
- backend services, routes, repository, and revision envelopes;
- editor adapter, runtime, DOM, selection, canvas, and stale apply;
- concrete text engine, mixed layout pipeline, renderer, and artifact bytes;
- columns/table node-specific split semantics;
- generated TOC/page-number/repeat behavior;
- collaboration, offline merge, compliance, or approval workflows.

## Next Recommended Direction

Integrate the lifecycle-aware rich replacement through backend revision and
idempotency gates, then expose editor intent/stale apply through the core adapter.
Keep measured/mixed layout activation separate from content mutation transport.
