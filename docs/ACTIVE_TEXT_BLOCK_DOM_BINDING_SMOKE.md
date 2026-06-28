# Active Text-Block DOM Binding Smoke

Status: Phase 157 DOM binding smoke boundary.

Phase 157 adds the first bounded DOM-binding smoke for the active text-block
island. The smoke consumes contenteditable-like surface facts and bounded
selection offsets, then emits JSON-safe capture diagnostics.

This is not production DOM range support. It does not commit to core, handle
paste/delete semantics, support all browsers, or claim production input
readiness.

## Runtime Path

```text
Phase 155 active island state
  -> contenteditable-like surface facts
  -> bounded UTF-16 selection offsets
  -> JSON-safe DOM binding smoke capture
  -> future commit bridge smoke
```

## Contract

`examples/template-builder-sandbox/public/activeTextBlockDomBinding.js` owns:

- `ACTIVE_TEXT_BLOCK_DOM_BINDING_SOURCE`;
- `ACTIVE_TEXT_BLOCK_DOM_BINDING_MODE`;
- `createActiveTextBlockDomBindingSmoke(...)`;
- `activeTextBlockDomBindingSmokeLabel(...)`.

Captured facts include:

- active node id;
- text-block id;
- text content snapshot;
- selection start/end as UTF-16 offsets;
- composition active flag;
- safe/unsafe capture status;
- diagnostics for unsafe capture.

Unsafe capture reasons include:

- no active text-block island;
- missing contenteditable surface;
- missing contenteditable root;
- target text-block mismatch;
- text snapshot mismatch;
- missing or out-of-range selection offsets;
- DOM Range/object selection facts in this bounded smoke.

## PASS

- One active text block can expose a contenteditable island smoke.
- Capture facts are bounded and JSON-safe.
- Unsafe capture is rejected with diagnostics.
- DOM state remains browser-local.
- Composition state is carried as a fact.

## FAIL / BLOCKER

- No blocker prevents Phase 158 from connecting accepted facts to a commit
  bridge smoke.
- Production editor readiness remains blocked.

## RISK

- This smoke intentionally rejects real DOM Range/object selection facts.
- Browser-specific selection behavior remains future work.
- Paste/delete behavior is not implemented.
- Commit bridge execution remains future work.

## UNKNOWN

- Production browser support matrix is unknown.
- Renderer segment/hit-test caret parity is unknown.
- Final DOM selection normalization policy is unknown.

## Files Changed

- `docs/ACTIVE_TEXT_BLOCK_DOM_BINDING_SMOKE.md`
- `examples/template-builder-sandbox/public/activeTextBlockDomBinding.js`
- `tests/activeTextBlockDomBinding.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/hybridManagedCardInputPlan.test.ts`
- `tests/templateBuilderSandboxBoundary.test.ts`

## Behavior Changed

- The sandbox now has a JSON-safe DOM binding smoke capture boundary for one
  active text-block island.
- No package data, history, storage, renderer output, route, production DOM
  event behavior, or core commit behavior changed.

## Tests Run

- `npm.cmd test -- tests/activeTextBlockDomBinding.test.ts`
- `npm.cmd test -- tests/hybridManagedCardInputPlan.test.ts`
- `npm.cmd test -- tests/templateBuilderSandboxBoundary.test.ts -t "applies sandbox bridge structural packets through the browser runtime cache"`
- `npm.cmd run check`

## Risks Left

- Phase 158: Active Island Commit Bridge Smoke.
- Phase 159: Field Chip Delete / Copy / Paste Command Boundary.
- Phase 160: Paste / Delete Preflight Boundary.
- Phase 161: Renderer Segment / Hit-Test Evidence Boundary.

## Intentionally Not Changed

- No production DOM range support.
- No all-browser support claim.
- No paste/delete semantics.
- No commit to core.
- No production contenteditable implementation.
- No full-document contenteditable.
- No collaboration/offline behavior.
- No storage/backend route.
- No PDF/DOCX renderer work.
- No package/document schema change.
- No legacy editor runtime copy.
