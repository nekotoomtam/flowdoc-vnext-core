# Template Builder Rich Inline Commit Bridge Boundary

Status: Phase 125 rich inline commit bridge boundary.

Phase 125 executes the first bounded canonical rich inline commit path. The
sandbox bridge consumes Phase 124 commit plans only, applies a vNext-native
rich inline replacement operation, records history-ready authoring intent, and
invalidates live/exact outputs without rendering artifacts.

## PASS

- `src/authoring/richInlineCommit.ts` owns
  `runVNextRichInlineCommit(...)` and
  `createVNextRichInlineCommitHistoryRecord(...)`.
- The core helper validates vNext inline children, rejects duplicate ids,
  rejects unsupported targets, replaces text-block inline children, rebuilds
  graph/projection facts, returns text-block dirty scope, records key-history
  field usage, and marks exact output stale through render invalidation facts.
- `examples/template-builder-sandbox/src/mutationBridge.ts` exposes
  `commitRichInline(...)`, accepts only Phase 124
  `text-block.rich-inline.replace` plans, rejects stale plan revisions, calls
  the core helper, appends a history-ready record, updates the in-memory
  package, bumps document revision, and returns the existing bounded packet
  response.
- `examples/template-builder-sandbox/scripts/serve.mjs` exposes
  `/api/actions/commit-rich-inline`.
- `examples/template-builder-sandbox/public/app.js` adds a separate
  `commit-rich-inline` draft action that sends the Phase 124 canonical plan to
  the bridge without changing the plain text commit path.
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `sandbox.commitRichInlineDraft` as a wired commit lane.
- `tests/richInlineCommit.test.ts` proves core replacement, dirty scope,
  history-ready record, key-history facts, render invalidation, duplicate-id
  rejection, unsupported-target rejection, and package/DOM independence.
- `tests/templateBuilderSandboxBoundary.test.ts` proves bridge success,
  stale-plan rejection, invalid-plan rejection, packet updates, history-ready
  records, and live/exact invalidation summaries.

## FAIL / BLOCKER

- None for the Phase 125 bridge boundary.

## RISK

- Rich undo/redo replay is not implemented; the history record is undoable in
  intent, but the sandbox undo stack still supports only plain text patches.
- The first execution path performs full inline-child replacement rather than
  granular mixed-inline patching.
- Production contenteditable DOM capture still uses the current browser-local
  plan path instead of a hardened real editing surface.

## UNKNOWN

- Whether rich inline replacement remains the long-term operation shape or is
  decomposed into granular style/chip transactions.
- How collaboration should merge concurrent rich inline replacements.
- How durable persistence should store and replay rich inline history records.

## Files Changed

- `docs/TEMPLATE_BUILDER_RICH_INLINE_COMMIT_BRIDGE_BOUNDARY.md`
- `src/authoring/richInlineCommit.ts`
- `src/authoring/intentHistory.ts`
- `src/index.ts`
- `examples/template-builder-sandbox/src/mutationBridge.ts`
- `examples/template-builder-sandbox/scripts/serve.mjs`
- `examples/template-builder-sandbox/public/app.js`
- `examples/template-builder-sandbox/src/coreBoundary.ts`
- `examples/template-builder-sandbox/public/sandbox-snapshot.json`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/richInlineCommit.test.ts`
- `tests/templateBuilderSandboxBoundary.test.ts`

## Behavior Changed

- Accepted Phase 124 rich inline commit plans can now mutate the in-memory
  sandbox package through a vNext-native core helper.
- The mutation bridge returns bounded packets for rich inline commits and
  records authoring history/live layout summaries.
- Plain draft text commit, persistence, backend storage, collaboration,
  renderer output, and text-engine/WASM replacement behavior are unchanged.

## Tests Run

- `npm.cmd test -- tests/richInlineCommit.test.ts`
- `npm.cmd run build` in `examples/template-builder-sandbox`
- `npm.cmd test -- tests/templateBuilderSandboxBoundary.test.ts --testTimeout=30000`
- `npm.cmd run check`

## Risks Left

- Add rich undo/redo replay.
- Decide whether full inline replacement should evolve into granular rich
  inline transactions.
- Harden production contenteditable capture, selection affinity, and IME
  behavior.
- Add persistence, collaboration, renderer output, and exact export parity.

## Intentionally Not Changed

- No package/document schema changes.
- No parent editor runtime or legacy editor imports.
- No durable persistence write.
- No collaboration behavior.
- No renderer artifact output.
- No ICU4X execution or WASM/text-engine measurement replacement.
