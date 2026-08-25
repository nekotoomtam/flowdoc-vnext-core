# Live Draft MR1-P Complete Geometry Boundary

Status: accepted as a bounded Core contract checkpoint. Persistent flow-tree
execution, spatial wrapping, product binding, publication, and production
remain NO-GO.

## Outcome

MR1-P introduces Initial TextBlock Flow as the capability-honest boundary in
front of the existing MR1 layout. It pins parent containing-region, authored
box, role/list identity, measurement, paragraph style, fonts, layout-unit
policy, declared line height, authoritative paragraph and per-face font-family
keys, resolved text-run typography, and complete known inline facts without
changing canonical Document v4.

Core now owns one shared effective shaping-style identity through
`createVNextTextBlockEffectiveShapingStyleIdentityV1(...)`. Initial Flow retains
the measurement/source key as `measurementStyleKey`, retains the producer key as
`effectiveShapingStyleKey`, and binds `paragraphFontFamilyKey` plus each pinned
face's authoritative `fontFamilyKey` into the frozen flow and fingerprint. The
actual `createFlowDocTextEngineMultiRunLayoutV1(...)` producer calls the same
helper, so plain text, supported local typography, misleading display labels,
unused pinned faces, and valid producer `localStyle` properties inserted outside
schema order preserve exact direct-MR1/adapter layout and fingerprint parity.

The historical Initial Flow handoff path invoked legacy MR1 through an explicit
adapter. That adapter proved exact legacy MR1 layout parity for accepted
text-subset-ready rows, then became historical evidence after later layout
lanes replaced it as current Core surface. List, inline-image, and empty-block
geometry still report `geometry-contract-required` in this checkpoint evidence.

Strict runtime schemas validate the retained root and nested measurement,
paragraph-style, font-face, authored-box, parent-region, and atom facts before
use. Canonical Initial Flow fingerprints and semantic legacy-context equality
remain independent of property insertion order, while exact direct-MR1 parity
retains the valid legacy request's original representation. The adapter
preserves that request's own enumerable key insertion order in a data-only
contained request. Descriptor-first containment accepts only ordinary dense
data arrays with the standard `Array.prototype`, a standard own `length`
descriptor, and canonical own data indices. It rejects custom prototypes,
holes, custom string or symbol properties, accessor or nonstandard descriptors,
cycles, and malformed lengths before output allocation or declared-length
iteration and without reading accessors. The strict data-only adapter envelope
accepts only plain/null-prototype roots with exactly the own data fields
`initialFlow` and `legacyRequest`; symbols, hidden or custom extras, and
accessors block deterministically with zero accessor reads. The strict canonical
validation applies complete Zod and semantic equality checks to the contained
snapshot, then passes that snapshot rather than Zod-reconstructed data to
unchanged MR1. Unknown fields, lowercase font digests, safe integer layout
units, and exact discriminated measurement-run variants remain mandatory.

The retired adapter accepted malformed runtime input as `unknown` and returned
deterministic structured blockers. Both blank and whitespace-only `layoutId`
values stopped before legacy invocation and returned metadata with
`layoutId: "unavailable"`; valid nonblank values remained unchanged. A field
resolving to `""` (an effectively rendered-empty field), a hard-break-only row,
and other zero-text cases required the empty-layout contract before legacy MR1.
Independent list-only and inline-image-only rows proved that each unsupported
geometry capability blocked on its own.

The current public MR1-P surface is:

- `createVNextTextBlockEffectiveShapingStyleIdentityV1(...)` for the shared
  effective shaping-style identity used by Core and the external producer.

The initial flow V1 implementation is internal-only in current core; retained
characterization evidence imports parent-region ownership, classification,
request binding, and process-local classifier provenance directly from
`src/layout`.

The initial-flow text-only legacy adapter is retired from current core; its
source, public export, and direct test are no longer current surface.

The Initial Flow handoff remains non-production and non-publishable:
publication and production activation remain NO-GO, and every accepted result
reports `mayPublishLayout: false`.

## Capability Matrix

| Capability | MR1-P status | Reason |
| --- | --- | --- |
| supported styled text and resolved fields | ready | complete measurement, authoritative paragraph/per-face family keys, and resolved typography retained; authored local `fontFamilyKey` overrides remain blocked |
| generated page number and hard break | ready | non-empty generated owner and mandatory-break facts retained; hard-break-only zero-text layout remains blocked |
| inline image | blocked-line-box-contract | frame, asset, and vertical alignment retained; baseline math not yet accepted |
| list item | blocked-decoration-contract | authored list identity retained; marker/indent owner not yet accepted |
| empty/effectively empty block | blocked-empty-layout-contract | canonical state retained, including empty resolved fields and hard-break-only rows; MR1 empty-line layout remains unsupported |
| authored box | ready | complete Core-derived box plan and owner fingerprint pinned |
| positioned objects | not-present | no canonical positioned-object contract is introduced |

## PASS

- Body, column, and table-cell parent regions use exact micro-point integers
  and deterministic Core fingerprints.
- Initial TextBlock Flow retains role, box, measurement, typography, policy,
  and full inline-image vertical alignment.
- The pinned `declaredLineHeightLayoutUnit` and every text-bearing atom's
  `resolvedGeometryStyle` bind the exact line-height, face, size, color, weight,
  style, `measurementStyleKey`, `effectiveShapingStyleKey`, decoration,
  strikethrough, and authoritative family key used by legacy MR1.
- The `paragraphFontFamilyKey` and each retained face `fontFamilyKey` are strict,
  fingerprinted inputs. Variant selection uses those keys, never the display
  `fontFamily`; duplicate mappings and paragraph/face key drift fail closed.
- Strict canonical validation rejects missing, null, malformed, uppercase-digest,
  nested unknown, or accessor-shaped facts without throwing; equivalent
  property order produces the same fingerprint and context.
- Supported local font size, color, weight, and style overrides are resolved
  exactly; decoration and strikethrough remain retained geometry-neutral facts.
- A recursively frozen classified object carries process-local classifier
  provenance, and the adapter verifies that authority before any capability or
  legacy-context check.
- For accepted text-subset-ready rows, the adapter reproduces exact legacy MR1
  layout parity, including requests emitted by the actual producer and requests
  whose retained input contains unused faces.
- A valid actual-producer request whose `localStyle` owns `fontStyle`,
  `fontWeight`, `textColor`, and `fontSize` in non-schema insertion order retains
  the exact direct MR1 layout and fingerprint chain.
- The data-only contained request preserves own enumerable key insertion order
  for valid producer calls. Ordinary dense data arrays require the standard
  `Array.prototype`, standard length/index data descriptors, and exact canonical
  indices before output allocation or declared-length iteration; custom
  prototypes, holes, custom keys or symbols, accessors, cycles, and malformed
  shapes block without reading accessors.
- The adapter root accepts only plain/null-prototype roots with exactly the own
  data fields `initialFlow` and `legacyRequest`; symbols, hidden/custom extras,
  and accessors block before either field is read.
- Both blank and whitespace-only `layoutId` values block before legacy MR1 with
  `layoutId: "unavailable"`; valid nonblank layout identities are preserved.
- An effectively rendered-empty field and hard-break-only content require the
  empty-layout contract; independent list-only and inline-image-only proofs stop
  before legacy MR1.
- Cloned flow objects, stale parent facts, width drift, style/font drift,
  frame drift, unsupported capabilities, and production binding fail closed.
- Every accepted result reports `mayPublishLayout: false`.

## FAIL / BLOCKER

- Inline-image baseline/ascent/descent integration is not implemented.
- List marker, numbering, gap, and continuation-indent ownership is not defined.
- Empty TextBlock line geometry is not accepted by MR1.
- Authored local `fontFamilyKey` overrides remain blocked as
  `resolved-run-typography`; MR1-P accepts only the authoritative paragraph
  family and per-face mappings pinned by the build context.
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

Reviewed Core runtime baseline: `c9a3e09`.

- Focused evidence is pinned to
  `packages/text-engine-rust-wasm/src/multiRunLayout.ts`,
  `src/layout/textBlockEffectiveShapingStyleIdentityV1.ts`,
  `tests/liveDraftMr1CompleteGeometryBoundary.test.ts`,
  `tests/textBlockInitialFlowParentRegionV1.test.ts`,
  `tests/textBlockInitialFlowInputV1.test.ts`,
  `tests/textBlockMultiRunLayoutV1.test.ts`.
- Runtime-focused result: 5 test files passed; 115 tests passed.
- Section-bounded documentation guard result: 1 test file passed; 5 tests passed.
- Combined focused verification: 6 files / 120 tests.
- `npm run type-check` passes.
- Full `npm run check` passes: 408 test files passed; 2028 tests passed.
- Working-tree and runtime-baseline diff whitespace validation pass.

## Next Checkpoint

Phase 2 is accepted as `MR1-Q Persistent Flow Tree Foundation`; see
`docs/LIVE_DRAFT_MR1_PERSISTENT_FLOW_FOUNDATION.md`. Proceed only to
`Phase 3: Core Spatial Wrapping 3A`. Do not start list/image geometry,
empty-block geometry, Editor binding, Backend binding, Columns/Table
integration, table auto-fit, publication, or production activation inside
Phase 3.
