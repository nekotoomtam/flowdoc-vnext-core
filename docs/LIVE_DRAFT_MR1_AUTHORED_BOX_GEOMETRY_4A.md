# Live Draft MR1 Authored Box Geometry 4A

## Status

Phase 4A is accepted as a bounded Core-only authored-box geometry checkpoint.
Every accepted result retains `mayPublishLayout: false`,
`productionBinding: false`, and `stagedEditorApply: false`.

The strict positioned-object authority remains `core-synthetic-qa-only`.
List decoration, inline-image geometry, empty-block geometry, Editor/Backend
binding, Columns/Table integration, Table auto-fit, publication, production
activation, and Editor staged apply remain NO-GO.

## Outcome

The accepted implementation baseline is
`d39d61f8c16b46b4fb709d045890ab9ee8677fbd`.

Core now owns one shared Initial Flow/request binding inspector and one
immutable Authored Box Geometry result. The composition preserves content-local
Phase 3 behavior unchanged at y zero, then emits a separately fingerprinted
box-local Phase 4A projection. It changes no canonical schema, Phase 3 spatial
algorithm or fingerprint, Editor/Backend binding, container integration, or
runtime activation.

## Capability Matrix

| Capability | Phase 4A status |
| --- | --- |
| authored box width | Core Phase 4A accepted |
| vertical content insets | Core Phase 4A accepted |
| box-local line and fragment geometry | Core Phase 4A accepted |
| synthetic spatial wrapping | retained Phase 3A |
| inline images | NO-GO |
| list decoration | NO-GO |
| empty blocks | NO-GO |
| authored positioned objects | NO-GO |
| Columns/Table | NO-GO |
| Editor/Backend binding | NO-GO |
| publication/production | NO-GO |

## Authored Box Width Evidence

- `inspectVNextTextBlockInitialFlowRequestBindingV1(...)` is the shared owner
  for exact process-local Initial Flow/request equality. The text-only adapter
  consumes the same inspector without changing its accepted or blocked
  behavior.
- The exact bound request width preserves content-local Phase 3 behavior
  unchanged.
- Every `outerWidthPt`, `contentWidthPt`, and `contentInsetPt` edge is converted
  independently through `convertVNextPointToLayoutUnitV1(...)`.
- Acceptance requires:

  ```text
  contentWidthLayoutUnit == request.availableWidthLayoutUnit
  outerWidthLayoutUnit
    == leftInsetLayoutUnit
     + contentWidthLayoutUnit
     + rightInsetLayoutUnit
  ```

- Non-finite, negative, unsafe, or inconsistent arithmetic blocks instead of
  clamping or compensating.
- A narrower exact authored content width changes wrapping only through the
  exact request/tree/index chain. One-unit width drift blocks before Phase 3.

## Box-Local Projection Evidence

- Phase 3 executes unchanged with `startYLayoutUnit: 0` in content-local
  coordinates over `[0, request.availableWidthLayoutUnit]`.
- The box-local Phase 4A projection is a separate immutable result; it does not
  mutate the accepted Phase 3 result.
- `contentOriginXLayoutUnit` is the converted left inset and
  `contentOriginYLayoutUnit` is the converted top inset.
- Each accepted line y offset adds the y origin exactly once. Each interval,
  interval placement, and fragment x offset adds the x origin exactly once.
- Render ranges, source ranges, source segments, and content-local fingerprints
  remain provenance facts; translated lines and fragments receive regenerated
  Phase 4A fingerprints.
- Zero-inset evidence retains exact Phase 3 geometry after removing only the
  Phase 4A wrapper and regenerated fingerprint facts.

## Auto-Height And Spatial Evidence

- Phase 4A owns exact top/bottom inset ownership:

  ```text
  contentExtentBottomLayoutUnit =
    max(
      spatialLayout.summary.heightLayoutUnit,
      spatialIndex.summary.maximumBottomLayoutUnit
    )

  outerHeightLayoutUnit =
    topInsetLayoutUnit
    + contentExtentBottomLayoutUnit
    + bottomInsetLayoutUnit
  ```

- The retained `maximumBottomLayoutUnit` makes a spatial envelope below the
  text flow contribute to auto-height.
- An overlay removes no flow space, yet its retained clearance envelope still
  contributes to the minimum auto-height extent.
- The empty and overlay-only zero-query fast path retains
  `spatialIndexQueryCount: 0`; reading the retained maximum-bottom summary is
  not an additional Flow Region query.
- Phase 4A makes no additional spatial query and carries no spatial-line
  reuse/reconvergence claim.

## Identity And Failure Evidence

- The accepted result pins the exact document, section, TextBlock, instance
  revision, Initial Flow, authored-box owner/style/plan, parent region, request,
  persistent tree, spatial index, and Phase 3 layout fingerprint chain.
- Strict data-only root inspection, explicit production rejection, exact
  binding checks, safe projection, safe height arithmetic, recursive freezing,
  and process-local registration execute in a fixed fail-closed order.
- Cloned, stale, mutable, foreign, accessor-shaped, or publicly
  re-fingerprinted authority blocks without partial geometry.
- The authority chain carries no spatial-line reuse/reconvergence claim.
- Structured blocker ownership remains explicit:

  | Condition | Phase 4A blocker |
  | --- | --- |
  | list, inline image, empty/effectively empty, or hard-break-only capability | `initial-flow-capability-required` |
  | Initial Flow/request mismatch | `initial-flow-request-binding-mismatch` |
  | authored width or inset arithmetic mismatch | `authored-box-geometry-invalid` |
  | tree or index provenance mismatch | `persistent-flow-binding-mismatch` or `spatial-index-binding-mismatch` |
  | blocked Phase 3 layout | `spatial-layout-blocked` with ordered Phase 3 issue-code evidence |
  | unsafe projection or height | `box-local-projection-invalid` or `outer-height-invalid` |

- Blocked results expose no lines, fragments, geometry, summary, work, or
  fingerprint and remain non-publishable and non-production.

## PASS

- Exact authored content width, shared request binding, and safe outer-width
  arithmetic pass.
- Exact box-local x/y projection, regenerated fingerprints, and unchanged
  source mappings pass.
- Top and bottom insets contribute exactly once; the larger of flow height and
  retained spatial maximum bottom determines content extent.
- Overlay height without flow exclusion and the zero-query fast path pass.
- Strict capability, provenance, stale, accessor, production, unsafe
  arithmetic, tamper, and deterministic-fingerprint rows fail closed as
  intended.
- Focused tests, type-check, full Core verification, whitespace validation,
  and clean committed-branch verification pass.

## FAIL / BLOCKER

List decoration, inline-image geometry, empty-block geometry, Editor/Backend
binding, Columns/Table integration, Table auto-fit, publication, production
activation, and Editor staged apply remain NO-GO.

Fixed-height overflow, clipping, authored positioned-object contracts, spatial
line reuse/reconvergence, and later-phase product behavior are not accepted.

## RISK

- Shared adapter extraction can accidentally change legacy rejection ordering
  or blocked metadata.
- Complete translated geometry requires regenerated Phase 4A fingerprints;
  retaining a content-local fingerprint as translated authority would be
  incorrect.
- Independently converted edges can reveal exact width-sum differences that
  must continue to block rather than be compensated.
- A retained spatial envelope below the text must continue to participate in
  auto-height even when it does not exclude flow.

## UNKNOWN

- Inline-image baseline, ascent, descent, and line-box rules.
- List marker ownership, numbering, gap, and indentation geometry.
- Empty/effectively-empty TextBlock line geometry.
- Fixed-height overflow and clipping policy.
- Authored positioned-object identity, anchoring, persistence, and controls.
- Spatial reconvergence and line reuse.
- Product-scale memory, interaction, and rendering budgets.

## Verification

Focused command:

```text
npx vitest run tests/liveDraftMr1CompleteGeometryBoundary.test.ts tests/liveDraftMr1PersistentFlowFoundation.test.ts tests/liveDraftMr1SpatialWrapping3a.test.ts tests/liveDraftMr1AuthoredBoxGeometry4a.test.ts tests/textBlockInitialFlowRequestBindingV1.test.ts tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts tests/textBlockAuthoredBoxGeometryV1.test.ts tests/textBlockSpatialWrappingLayoutV1.test.ts
```

The focused Phase 4A gate passed 8 files / 130 tests.

Complete command:

```text
npm run check
```

The full `npm run check` passed 420 files / 2,113 tests including type-check.
`git diff --check` passed with no whitespace errors.

## Next Checkpoint

Stop after Phase 4A. `Phase 4B: Inline Image Line-Box Geometry` requires a
separately reviewed and explicitly approved design before implementation.
