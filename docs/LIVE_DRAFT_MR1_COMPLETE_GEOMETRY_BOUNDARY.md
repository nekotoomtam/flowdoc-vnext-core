# Live Draft MR1-P Complete Geometry Boundary

Status: accepted as a bounded Core contract checkpoint. Persistent flow-tree
execution, spatial wrapping, product binding, publication, and production
remain NO-GO.

## Outcome

MR1-P introduces Initial TextBlock Flow as the capability-honest boundary in
front of the existing MR1 layout. It pins parent containing-region, authored
box, role/list identity, measurement, paragraph style, fonts, layout-unit
policy, and complete known inline facts without changing canonical Document v4.

The new Initial Flow handoff path invokes legacy MR1 only through the explicit
adapter. For accepted text-subset-ready rows, the adapter reproduces exact
legacy MR1 layout parity. List, inline-image, and empty-block geometry report
`geometry-contract-required`. Unsupported capability rows fail closed before
the adapter invokes legacy layout.

The Initial Flow handoff remains non-production and non-publishable:
publication and production activation remain NO-GO, and every accepted result
reports `mayPublishLayout: false`.

## Capability Matrix

| Capability | MR1-P status | Reason |
| --- | --- | --- |
| styled text and resolved fields | ready | complete measurement and typography facts retained |
| generated page number and hard break | ready | owner and mandatory-break facts retained |
| inline image | blocked-line-box-contract | frame, asset, and vertical alignment retained; baseline math not yet accepted |
| list item | blocked-decoration-contract | authored list identity retained; marker/indent owner not yet accepted |
| empty block | blocked-empty-layout-contract | canonical state retained; MR1 empty-line layout remains unsupported |
| authored box | ready | complete Core-derived box plan and owner fingerprint pinned |
| positioned objects | not-present | no canonical positioned-object contract is introduced |

## PASS

- Body, column, and table-cell parent regions use exact micro-point integers
  and deterministic Core fingerprints.
- Initial TextBlock Flow retains role, box, measurement, typography, policy,
  and full inline-image vertical alignment.
- For accepted text-subset-ready rows, the adapter reproduces exact legacy MR1
  layout parity.
- Cloned flow objects, stale parent facts, width drift, style/font drift,
  frame drift, unsupported capabilities, and production binding fail closed.
- Every accepted result reports `mayPublishLayout: false`.

## FAIL / BLOCKER

- Inline-image baseline/ascent/descent integration is not implemented.
- List marker, numbering, gap, and continuation-indent ownership is not defined.
- Empty TextBlock line geometry is not accepted by MR1.
- Persistent structural sharing and spatial wrapping are not implemented.
- List decoration, image line-box geometry, empty-block layout, persistent
  trees, spatial wrapping, Editor, Backend, table auto-fit, and publication
  remain unimplemented.

## RISK

- Initial Flow currently duplicates retained measurement and typography facts;
  Phase 2 must replace complete rescans without multiplying active memory.
- Width or global typography changes still require complete TextBlock reflow.
- Names containing TextBlock can still be over-read unless consumers honor the
  capability report and adapter gate.

## UNKNOWN

- Exact list-decoration owner and marker-format contract.
- Exact inline-image baseline rules for baseline, middle, and text-bottom.
- Product-scale retained-memory and interaction budgets.

## Verification

- Focused Initial Flow, adapter, and retained MR1 layout tests pass.
- TypeScript type-check passes.
- Full `npm run check` passes.
- Diff whitespace validation passes.

## Next Checkpoint

Proceed to Phase 2 Persistent Flow Tree Foundation. Implement the versioned
persistent B+ rope policy and remove `completeNextSemanticPassCount: 1` for the
accepted text subset. Do not start spatial wrapping, list decoration,
inline-image geometry, empty-block geometry, Editor, Backend, table auto-fit,
publication, or production activation in this checkpoint.
