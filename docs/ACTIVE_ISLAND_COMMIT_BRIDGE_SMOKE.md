# Active Island Commit Bridge Smoke

Status: Phase 158 active island commit bridge smoke.

Phase 158 connects accepted active-island capture facts to the existing vNext
rich inline commit path in a bounded sandbox smoke. It uses the v1
`text-block.rich-inline.replace` policy and the existing
`sandbox.commitRichInline` bridge path.

This phase does not implement granular rich inline operations, collaboration or
offline merge safety, raw contenteditable HTML commits, storage/backend routes,
or production input readiness.

## Runtime Path

```text
Phase 157 accepted capture facts
  + Phase 155 commit request facts
  + Phase 156 commit command policy
  -> active island commit bridge smoke
  -> sandbox.commitRichInline request
  -> existing rich inline commit bridge
  -> packet refresh and exact stale signal
```

## Contract

`examples/template-builder-sandbox/public/activeIslandCommitBridge.js` owns:

- `ACTIVE_ISLAND_COMMIT_BRIDGE_SOURCE`;
- `ACTIVE_ISLAND_COMMIT_BRIDGE_MODE`;
- `ACTIVE_ISLAND_COMMIT_OPERATION_KIND`;
- `createActiveIslandCommitBridgeSmoke(...)`;
- `activeIslandCommitBridgeSmokeLabel(...)`.

Accepted bridge facts include:

- bridge action `sandbox.commitRichInline`;
- operation kind `text-block.rich-inline.replace`;
- planned inline children;
- target text-block id;
- base/document revision;
- packet response mode;
- live/exact stale expectation;
- runtime cache refresh expectation.

Rejected bridge facts include:

- unsafe island capture;
- active IME composition;
- missing island commit request;
- command policy not ready;
- missing or mismatched target text-block id;
- missing text snapshot.

## PASS

- Accepted island capture facts convert to a rich inline commit request.
- The request routes through the existing sandbox rich inline mutation bridge.
- Live/exact stale signal is preserved after accepted commit.
- Rejected or unsafe island facts do not produce a bridge request.
- Runtime cache refresh remains bounded to packet response expectations.

## FAIL / BLOCKER

- No blocker prevents Phase 159 from defining field-chip delete/copy/paste
  command contracts.
- Production editor readiness remains blocked.

## RISK

- The v1 bridge still uses full inline-child replacement.
- Collaboration/offline merge safety remains explicitly unproved.
- Field-chip delete/copy/paste remains future work.
- Paste/delete preflight remains future work.

## UNKNOWN

- Granular rich inline operation shape is unknown.
- Collaboration/offline conflict behavior is unknown.
- Production browser commit timing is unknown.

## Files Changed

- `docs/ACTIVE_ISLAND_COMMIT_BRIDGE_SMOKE.md`
- `examples/template-builder-sandbox/public/activeIslandCommitBridge.js`
- `tests/activeIslandCommitBridge.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/hybridManagedCardInputPlan.test.ts`

## Behavior Changed

- The sandbox now has a browser-local bridge request smoke from safe active
  island capture facts to the existing rich inline commit bridge.
- No storage write, backend route, production contenteditable input, raw DOM
  HTML commit, renderer output, or package/document schema change was added.

## Tests Run

- `npm.cmd test -- tests/activeIslandCommitBridge.test.ts`
- `npm.cmd test -- tests/hybridManagedCardInputPlan.test.ts`
- `npm.cmd run check`

## Risks Left

- Phase 159: Field Chip Delete / Copy / Paste Command Boundary.
- Phase 160: Paste / Delete Preflight Boundary.
- Phase 161: Renderer Segment / Hit-Test Evidence Boundary.
- Phase 162: Hybrid Input Close Audit.

## Intentionally Not Changed

- No granular rich inline operations.
- No collaboration/offline safety claim.
- No raw contenteditable HTML commit.
- No bypass of the rich inline commit boundary.
- No storage/backend route.
- No production contenteditable implementation.
- No full-document contenteditable.
- No PDF/DOCX renderer work.
- No package/document schema change.
- No legacy editor runtime copy.
