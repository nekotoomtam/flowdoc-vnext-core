# Hybrid Input Runtime Ownership Boundary

Status: Phase 154 input runtime ownership boundary.

Phase 154 turns the Phase 153 hybrid managed card input plan into the first
testable runtime ownership contract. It classifies browser-local input targets
and command readiness before any DOM binding, contenteditable behavior, package
mutation, storage, or renderer work.

This phase is an ownership boundary only. It does not implement production
contenteditable input.

## Runtime Path

```text
selected runtime node
  -> input ownership classifier
  -> managed card / active text-block island / textarea fallback / rejected
  -> command readiness facts
  -> future active island lifecycle or commit bridge
```

## Ownership Split

Managed card runtime:

- owns non-text structure selection and focus;
- keeps tables, generated content, static zones, and page-shell structure out
  of arbitrary contenteditable DOM;
- exposes structural command readiness without committing mutations.

Active text-block island runtime:

- owns one active text-block island target at a time;
- owns browser-local selection and IME readiness facts only;
- never mutates canonical package data directly.

Command policy:

- owns command readiness shape;
- records `ready` or `blocked` status with an owner and reason;
- blocks commit preparation while IME composition is active.

Commit bridge:

- owns only future accepted commit facts;
- remains `not-run` in Phase 154;
- does not bypass the future rich inline commit bridge.

Fallback textarea path:

- owns plain-text fallback target selection;
- records explicit fallback reasons;
- stays browser-local until a later commit bridge phase.

App-shell integration:

- owns focus coordination, active target switching, toolbar readiness display,
  and inspector display;
- does not own canonical mutation semantics.

## Contract

`examples/template-builder-sandbox/public/inputRuntimeOwnership.js` defines:

- `HYBRID_INPUT_RUNTIME_OWNERSHIP_SOURCE`;
- `HYBRID_INPUT_RUNTIME_OWNERSHIP_MODE`;
- active input target types:
  - `none`;
  - `managed-card-selection`;
  - `active-text-block-island`;
  - `textarea-fallback`;
  - `rejected`;
- rejection reasons for unsupported targets, full-document contenteditable,
  raw DOM HTML package truth, missing node ids, non-text island requests,
  invalid fallback requests, ineligible text blocks, and multiple active
  islands;
- `createHybridInputCommandReadiness(...)`;
- `createHybridInputRuntimeOwnership(...)`;
- `hybridInputRuntimeOwnershipLabel(...)`.

The ownership result carries:

- `activeNodeId`;
- `activeTextBlockId`;
- `targetType`;
- `reason`;
- `allowedCommands`;
- `blockedCommands`;
- `fallbackReason`;
- `commandReadiness`;
- explicit owner facts for managed cards, active island runtime, command
  policy, commit bridge, fallback textarea path, and app-shell integration;
- browser-local, canonical-package, core-commit, and production-readiness
  status facts.

## Browser-Local Versus Core Truth

Browser-local:

- active input target;
- selection and composition readiness facts;
- fallback decision diagnostics;
- command readiness display facts.

Canonical package truth:

- remains `not-mutated` in Phase 154;
- does not consume DOM ranges, DOM HTML, focus state, selection objects, or
  transient composition text.

Core commit path:

- remains `not-run`;
- future accepted rich inline commits must still pass through the existing
  rich inline commit boundary.

## PASS

- Input runtime ownership can classify `none`, `managed-card-selection`,
  `active-text-block-island`, `textarea-fallback`, and `rejected` targets.
- Unsupported targets return explicit rejection reasons.
- Only one active text-block island can be selected.
- Command readiness facts identify owner, status, command, and reason.
- IME composition blocks commit bridge preparation.
- Browser-local ownership is separated from canonical package truth.

## FAIL / BLOCKER

- No blocker prevents Phase 155 from defining the active island lifecycle.
- Production editor readiness remains blocked.

## RISK

- The ownership contract is still a pure classifier; browser DOM selection and
  lifecycle state transitions are future work.
- Phase 156 must keep command policy separate from active island state so this
  module does not become a monolith.
- Field chip delete/copy/paste remains unresolved until the later field-chip
  command boundary.

## UNKNOWN

- Final production browser support matrix is unknown.
- Exact renderer-owned segment and hit-test facts are unknown.
- Production paste sanitization policy is unknown.

## Files Changed

- `docs/HYBRID_INPUT_RUNTIME_OWNERSHIP_BOUNDARY.md`
- `examples/template-builder-sandbox/public/inputRuntimeOwnership.js`
- `tests/hybridInputRuntimeOwnership.test.ts`
- `tests/hybridManagedCardInputPlan.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`

## Behavior Changed

- The sandbox now has a browser-safe ownership classifier for hybrid managed
  card input targets.
- No package data, history, storage, renderer output, route, or app-shell DOM
  behavior changed.

## Tests Run

- `npm.cmd test -- tests/hybridInputRuntimeOwnership.test.ts`
- `npm.cmd test -- tests/hybridManagedCardInputPlan.test.ts`
- `npm.cmd run check`

## Risks Left

- Phase 155: Active Text-Block Island Boundary.
- Phase 156: Hybrid Command Policy Boundary.
- Phase 157: DOM Binding Smoke Boundary.
- Phase 158: Active Island Commit Bridge Smoke.

## Intentionally Not Changed

- No production contenteditable implementation.
- No full-document contenteditable.
- No collaboration/offline behavior.
- No storage/backend route.
- No PDF/DOCX renderer work.
- No package/document schema change.
- No legacy editor runtime copy.
- No DOM event binding.
- No canonical package mutation.
