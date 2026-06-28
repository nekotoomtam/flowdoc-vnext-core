# Field Chip Command Boundary

Status: Phase 159 field chip command boundary.

Phase 159 defines explicit v1 field-chip command contracts for the hybrid
active island lane. Field chips remain atomic managed inline units, not editable
raw text spans.

This phase does not bind DOM events, implement collaboration semantics, change
schema, or make arbitrary chip internals editable.

## Contract

`src/authoring/fieldChipCommands.ts` owns:

- `FIELD_CHIP_COMMAND_SOURCE`;
- `FIELD_CHIP_COMMAND_MODE`;
- `FIELD_CHIP_RICH_INLINE_OPERATION_KIND`;
- `createFieldChipCommand(...)`;
- command kinds:
  - `field-chip.delete`;
  - `field-chip.copy`;
  - `field-chip.paste`;
  - `field-chip.replace-with-text`;
  - `block-edit-inside-chip`.

## Command Policy

- `field-chip.delete` creates a planned rich inline replacement intent.
- `field-chip.copy` creates clipboard facts and no mutation intent.
- `field-chip.paste` creates a planned rich inline replacement intent from
  field-chip clipboard facts.
- `field-chip.replace-with-text` creates a planned rich inline replacement
  intent that preserves field-key visibility.
- `block-edit-inside-chip` is blocked.
- Any selection marked as inside a chip is blocked.
- Cross-block selection is blocked.
- Missing field keys are blocked.

## PASS

- Field chip commands are explicit and testable.
- Internal chip edit is blocked.
- Commands can produce safe rich inline intent or safe rejection.
- Field key visibility is preserved in command facts.
- Copy does not produce mutation intent.

## FAIL / BLOCKER

- No blocker prevents Phase 160 from defining paste/delete preflight.
- Production editor readiness remains blocked.

## RISK

- Rich inline replacement remains v1 full replacement intent.
- Clipboard serialization is still a local contract, not browser integration.
- Paste/delete browser event behavior remains future work.

## UNKNOWN

- Production clipboard format is unknown.
- Collaboration/offline field-chip merge behavior is unknown.
- Renderer hit-test behavior around chip boundaries is unknown.

## Files Changed

- `docs/FIELD_CHIP_COMMAND_BOUNDARY.md`
- `src/authoring/fieldChipCommands.ts`
- `src/index.ts`
- `tests/fieldChipCommands.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/hybridManagedCardInputPlan.test.ts`

## Behavior Changed

- The package now exposes pure field-chip command contracts.
- No DOM event binding, storage, renderer output, route, collaboration
  behavior, or package/document schema change was added.

## Tests Run

- `npm.cmd test -- tests/fieldChipCommands.test.ts`
- `npm.cmd test -- tests/hybridManagedCardInputPlan.test.ts`
- `npm.cmd run check`

## Risks Left

- Phase 160: Paste / Delete Preflight Boundary.
- Phase 161: Renderer Segment / Hit-Test Evidence Boundary.
- Phase 162: Hybrid Input Close Audit.

## Intentionally Not Changed

- No DOM event binding.
- No collaboration semantics.
- No package/document schema change.
- No arbitrary chip internals editable as text.
- No production contenteditable implementation.
- No full-document contenteditable.
- No storage/backend route.
- No PDF/DOCX renderer work.
- No legacy editor runtime copy.
