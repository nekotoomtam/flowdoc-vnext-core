# Hybrid Input Command Policy Boundary

Status: Phase 156 hybrid command policy boundary.

Phase 156 defines the command policy layer for the hybrid managed card input
lane. It decides whether commands are ready, should fall back to textarea
plain-text behavior, or are blocked with explicit diagnostics.

This phase does not execute commands, mutate package data, bind DOM events, or
implement field-chip behavior beyond policy decisions.

## Runtime Path

```text
Phase 154 ownership facts
  + Phase 155 active island lifecycle facts
  -> command policy matrix
  -> ready / fallback / blocked
  -> future DOM binding or commit bridge
```

## Command Kinds

`examples/template-builder-sandbox/public/hybridInputCommandPolicy.js` defines
policy for:

- `text.insert`;
- `text.delete`;
- `selection.replace`;
- `rich-inline.toggle-style`;
- `field-chip.insert`;
- `field-chip.delete`;
- `paste.text`;
- `paste.rich`;
- `commit`;
- `cancel`.

## Readiness

Each command returns:

- `ready`;
- `fallback`;
- `blocked`.

Each result carries:

- command kind;
- target type;
- execution mode;
- status;
- reason.

## Guard Policy

- IME composition blocks destructive commands and commit.
- Unsupported targets are blocked.
- Cross-block selections are blocked.
- Ambiguous style overlap blocks style toggles.
- Field chip internals cannot be edited as raw text.
- Unsupported HTML paste is blocked.
- Structural boundary delete is blocked.
- Textarea fallback can keep plain-text commands ready while rich commands
  fall back to plain-text behavior.

## PASS

- Commands return ready/fallback/blocked.
- IME composition blocks destructive commands.
- Field chip internals cannot be edited as raw text.
- Cross-block mutations are blocked.
- Managed card mode blocks text/rich commands while allowing cancel.
- Package mutation remains `not-mutated`.

## FAIL / BLOCKER

- No blocker prevents Phase 157 from adding a bounded DOM binding smoke.
- Production editor readiness remains blocked.

## RISK

- Command execution remains future work.
- Field chip delete/copy/paste contracts remain future work.
- Paste/delete preflight remains future work.
- Browser DOM selection is not bound yet.

## UNKNOWN

- Production paste sanitization policy is unknown.
- Field-chip clipboard behavior is unknown.
- Renderer segment/hit-test caret parity is unknown.

## Files Changed

- `docs/HYBRID_INPUT_COMMAND_POLICY_BOUNDARY.md`
- `examples/template-builder-sandbox/public/hybridInputCommandPolicy.js`
- `tests/hybridInputCommandPolicy.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/hybridManagedCardInputPlan.test.ts`

## Behavior Changed

- The sandbox now has a DOM-free command policy matrix for the hybrid input
  lane.
- No command execution, package mutation, storage, renderer output, route, or
  DOM event behavior changed.

## Tests Run

- `npm.cmd test -- tests/hybridInputCommandPolicy.test.ts`
- `npm.cmd test -- tests/hybridManagedCardInputPlan.test.ts`
- `npm.cmd run check`

## Risks Left

- Phase 157: DOM Binding Smoke Boundary.
- Phase 158: Active Island Commit Bridge Smoke.
- Phase 159: Field Chip Delete / Copy / Paste Command Boundary.
- Phase 160: Paste / Delete Preflight Boundary.

## Intentionally Not Changed

- No command execution.
- No package data mutation.
- No DOM binding.
- No field-chip implementation beyond command policy.
- No production contenteditable implementation.
- No full-document contenteditable.
- No collaboration/offline behavior.
- No storage/backend route.
- No PDF/DOCX renderer work.
- No package/document schema change.
- No legacy editor runtime copy.
