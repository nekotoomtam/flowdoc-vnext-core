# Paste / Delete Preflight Boundary

Status: Phase 160 paste/delete preflight boundary.

Phase 160 defines browser-local paste and delete preflight logic for the active
text-block island before production input uses it. The boundary classifies
actions as allow, transform, fallback, or reject.

This phase does not use arbitrary pasted HTML as package truth, allow structural
boundary delete, commit while IME composition is active, or implement browser
clipboard integration.

## Contract

`examples/template-builder-sandbox/public/pasteDeletePreflight.js` owns:

- `PASTE_DELETE_PREFLIGHT_SOURCE`;
- `PASTE_DELETE_PREFLIGHT_MODE`;
- `PASTE_DELETE_PREFLIGHT_ACTIONS`;
- `createPasteDeletePreflight(...)`;
- `pasteDeletePreflightLabel(...)`.

Preflight handles:

- plain text paste;
- rich text paste summary;
- unsupported HTML paste;
- delete selection;
- backspace near field chip;
- delete across chip boundary;
- delete across structural boundary;
- IME composition guard.

## Actions

- `allow`: action can proceed as-is.
- `transform`: action should be converted to a safer command or normalized
  text/fragments.
- `fallback`: action should use a simpler fallback lane.
- `reject`: action is blocked with diagnostics.

## PASS

- Paste/delete decisions are explicit.
- Unsafe HTML is rejected or normalized.
- Field chip boundaries are protected.
- Structural boundary deletes are blocked.
- IME composition blocks paste/delete mutation preflight.

## FAIL / BLOCKER

- No blocker prevents Phase 161 from defining renderer segment/hit-test
  evidence.
- Production editor readiness remains blocked.

## RISK

- Browser clipboard integration remains future work.
- Rich HTML sanitization remains future work.
- Delete behavior around complex inline mixes remains future work.

## UNKNOWN

- Production paste sanitization policy is unknown.
- Renderer-backed chip boundary hit-testing is unknown.
- Browser-specific delete event behavior is unknown.

## Files Changed

- `docs/PASTE_DELETE_PREFLIGHT_BOUNDARY.md`
- `examples/template-builder-sandbox/public/pasteDeletePreflight.js`
- `tests/pasteDeletePreflight.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/hybridManagedCardInputPlan.test.ts`

## Behavior Changed

- The sandbox now has a browser-local paste/delete preflight classifier.
- No package mutation, storage, renderer output, route, browser clipboard
  integration, or production DOM event behavior changed.

## Tests Run

- `npm.cmd test -- tests/pasteDeletePreflight.test.ts`
- `npm.cmd test -- tests/hybridManagedCardInputPlan.test.ts`
- `npm.cmd run check`

## Risks Left

- Phase 161: Renderer Segment / Hit-Test Evidence Boundary.
- Phase 162: Hybrid Input Close Audit.

## Intentionally Not Changed

- No arbitrary pasted HTML as package truth.
- No structural boundary delete.
- No commit while IME composition is active.
- No browser clipboard integration.
- No production contenteditable implementation.
- No full-document contenteditable.
- No collaboration/offline behavior.
- No storage/backend route.
- No PDF/DOCX renderer work.
- No package/document schema change.
- No legacy editor runtime copy.
