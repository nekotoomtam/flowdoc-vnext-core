# Live Draft MR1-P Complete Geometry Boundary

Status: accepted as a bounded Core contract checkpoint. Persistent flow-tree
execution, spatial wrapping, product binding, publication, and production
remain NO-GO.

## Outcome

MR1-P introduces Initial TextBlock Flow as the capability-honest boundary in
front of the existing MR1 layout. It pins parent containing-region, authored
box, role/list identity, measurement, paragraph style, fonts, layout-unit
policy, declared line height, resolved text-run typography, and complete known
inline facts without changing canonical Document v4.

The new Initial Flow handoff path invokes legacy MR1 only through the explicit
adapter. For accepted text-subset-ready rows, the adapter reproduces exact
legacy MR1 layout parity. List, inline-image, and empty-block geometry report
`geometry-contract-required`. Unsupported capability rows fail closed before
the adapter invokes legacy layout.

Strict runtime schemas validate the retained root and nested measurement,
paragraph-style, font-face, authored-box, parent-region, and atom facts before
they are dereferenced. The strict canonical validation and ordinal ordering make
fingerprints and legacy-context equality independent of property insertion
order. Lowercase font digests, safe integer layout units, and exact
discriminated measurement-run variants remain mandatory.

The public MR1-P surface is:

- `createVNextTextBlockInitialFlowParentRegionV1(...)` and
  `inspectVNextTextBlockInitialFlowParentRegionV1(...)` for parent-region
  ownership;
- `createVNextTextBlockInitialFlowV1(...)` and
  `inspectVNextTextBlockInitialFlowV1(...)` for classification and
  process-local provenance inspection; and
- `adaptVNextTextBlockInitialFlowToLegacyLayoutV1(...)` for the only new
  Initial Flow handoff to legacy MR1.

The Initial Flow handoff remains non-production and non-publishable:
publication and production activation remain NO-GO, and every accepted result
reports `mayPublishLayout: false`.

## Capability Matrix

| Capability | MR1-P status | Reason |
| --- | --- | --- |
| supported styled text and resolved fields | ready | complete measurement and resolved typography retained; `fontFamilyKey` is excluded |
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
- The pinned `declaredLineHeightLayoutUnit` and every text-bearing atom's
  `resolvedGeometryStyle` bind the exact line-height, face, size, color, weight,
  style, and retained measurement style used by legacy MR1.
- Strict canonical validation rejects missing, null, malformed, uppercase-digest,
  or nested unknown facts without throwing; equivalent property order produces
  the same fingerprint and context.
- Supported local font size, color, weight, and style overrides are resolved
  exactly; decoration and strikethrough remain retained geometry-neutral facts.
- A recursively frozen classified object carries process-local classifier
  provenance, and the adapter verifies that authority before any capability or
  legacy-context check.
- For accepted text-subset-ready rows, the adapter reproduces exact legacy MR1
  layout parity.
- Cloned flow objects, stale parent facts, width drift, style/font drift,
  frame drift, unsupported capabilities, and production binding fail closed.
- Every accepted result reports `mayPublishLayout: false`.

## FAIL / BLOCKER

- Inline-image baseline/ascent/descent integration is not implemented.
- List marker, numbering, gap, and continuation-indent ownership is not defined.
- Empty TextBlock line geometry is not accepted by MR1.
- `fontFamilyKey` has no authoritative mapping in the current input contract,
  so its presence fails closed as `resolved-run-typography`; it is never guessed.
- Persistent structural sharing and spatial wrapping are not implemented.
- List decoration, image line-box geometry, empty-block layout, persistent
  trees, spatial wrapping, Editor, Backend, table auto-fit, and publication
  remain unimplemented.

## RISK

- Initial Flow currently duplicates retained measurement and typography facts;
  Phase 2 must replace complete rescans without multiplying active memory.
- Width or global typography changes still require complete TextBlock reflow.
- Process-local classifier provenance deliberately does not create cross-process
  serialization authority; another process must classify and inspect its own
  exact frozen object.
- Names containing TextBlock can still be over-read unless consumers honor the
  capability report and adapter gate.

## UNKNOWN

- Exact list-decoration owner and marker-format contract.
- Exact inline-image baseline rules for baseline, middle, and text-bottom.
- Product-scale retained-memory and interaction budgets.

## Verification

Reviewed Core runtime baseline: `109675f`.

- Focused evidence is pinned to
  `tests/liveDraftMr1CompleteGeometryBoundary.test.ts`,
  `tests/textBlockInitialFlowParentRegionV1.test.ts`,
  `tests/textBlockInitialFlowInputV1.test.ts`,
  `tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts`, and
  `tests/textBlockMultiRunLayoutV1.test.ts`.
- Focused result: 5 test files passed; 44 tests passed.
- `npm run type-check` passes.
- Full `npm run check` passes: 408 test files passed; 1960 tests passed.
- Working-tree and runtime-baseline diff whitespace validation pass.

## Next Checkpoint

Proceed to Phase 2 Persistent Flow Tree Foundation. Implement the versioned
persistent B+ rope policy and remove `completeNextSemanticPassCount: 1` for the
accepted text subset. Do not start spatial wrapping, list decoration,
inline-image geometry, empty-block geometry, Editor, Backend, table auto-fit,
publication, or production activation in this checkpoint.
