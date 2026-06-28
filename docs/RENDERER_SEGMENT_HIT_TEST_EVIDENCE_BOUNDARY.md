# Renderer Segment / Hit-Test Evidence Boundary

Status: Phase 161 renderer segment and hit-test evidence boundary.

Phase 161 defines the evidence shape for renderer-backed text segments and
hit-test facts. It prepares future caret/selection parity work without
executing a renderer, binding DOM selection, replacing contenteditable range
mapping, or claiming caret parity.

## Contract

`src/renderer/segmentHitTestEvidence.ts` owns:

- `RENDERER_SEGMENT_HIT_TEST_EVIDENCE_SOURCE`;
- `RENDERER_SEGMENT_HIT_TEST_EVIDENCE_MODE`;
- renderer segment fact types;
- hit-test request/response types;
- `validateRendererSegmentEvidence(...)`;
- `createRendererHitTestEvidence(...)`.

Segment facts include:

- segment id;
- text-block id;
- inline child id;
- UTF-16 range;
- glyph range;
- line index;
- x/y/width/height box;
- atomic flag;
- field-chip flag;
- style facts.

Hit-test output includes:

- nearest offset;
- segment id;
- affinity;
- confidence.

## PASS

- Segment and hit-test evidence shape validates.
- Invalid UTF-16 ranges are blocked.
- Field chip atomic segments can be represented.
- Hit-test output can express uncertainty.
- Evidence is exported through the package boundary.

## FAIL / BLOCKER

- No blocker prevents Phase 162 from closing the hybrid input foundation pass.
- Production caret parity remains blocked.

## RISK

- Real renderer execution remains future work.
- Bidi caret affinity remains future work.
- Browser DOM selection integration remains future work.

## UNKNOWN

- Final renderer segment protocol is unknown.
- Production hit-test confidence thresholds are unknown.
- Cross-line and bidi affinity behavior is unknown.

## Files Changed

- `docs/RENDERER_SEGMENT_HIT_TEST_EVIDENCE_BOUNDARY.md`
- `src/renderer/segmentHitTestEvidence.ts`
- `src/index.ts`
- `tests/segmentHitTestEvidence.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/hybridManagedCardInputPlan.test.ts`
- `tests/activeIslandCommitBridge.test.ts`

## Behavior Changed

- The package now exposes renderer segment and hit-test evidence validation.
- The Phase 158 commit bridge smoke keeps its browser-adjacent spawn checks
  bounded under the full-suite timeout budget.
- No renderer execution, DOM selection binding, storage, route, PDF/DOCX output,
  or package/document schema change was added.

## Tests Run

- `npm.cmd test -- tests/segmentHitTestEvidence.test.ts`
- `npm.cmd test -- tests/hybridManagedCardInputPlan.test.ts`
- `npm.cmd run check`

## Risks Left

- Phase 162: Hybrid Input Close Audit.
- Production browser QA remains future work.
- Production renderer execution remains future work.

## Intentionally Not Changed

- No renderer execution.
- No DOM selection binding.
- No contenteditable range mapper replacement.
- No caret parity claim.
- No production measurement binding requirement.
- No production contenteditable implementation.
- No full-document contenteditable.
- No collaboration/offline behavior.
- No storage/backend route.
- No PDF/DOCX renderer work.
- No package/document schema change.
- No legacy editor runtime copy.
