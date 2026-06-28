# Vertical Slice Measurement Gate Boundary

Status: Phase 148 RC measurement selection and drift gate.

Phase 148 adds an RC-level measurement gate that compares caller-supplied
renderer-backed and approximate measurement summaries for the first vertical
slice.

This is a summary gate. It does not execute the external text-engine package,
replace default pagination measurement, mutate pagination, bind production
measurement, or hide digest/parity gaps.

## Boundary

Allowed:

- select measurement evidence by `measurementProfileId`;
- compare renderer-backed and approximate summary width, height, and line
  count;
- apply a caller-supplied drift tolerance policy;
- report digest and native/WASM parity status;
- return the Phase 146 measurement summary shape.

Blocked:

- importing the external text-engine package into core;
- calling renderer-backed provider code;
- replacing `measureVNextText(...)` defaults;
- mutating pagination or layout caches;
- claiming production measurement binding.

## PASS

- Wrong `measurementProfileId` blocks.
- Missing renderer-backed or approximate line boxes block.
- Drift over tolerance is warning or blocked based on policy.
- Digest and native/WASM parity gaps remain visible.

## FAIL / BLOCKER

- No blocker prevents using this summary gate as a Phase 151 RC input.

## RISK

- The gate trusts caller-supplied summaries until the E2E smoke wires real
  boundary outputs together.
- Missing digest/parity can allow RC evidence to proceed only as warning, not
  production readiness.

## UNKNOWN

- Final production drift tolerance remains unknown.
- Native/WASM parity promotion policy remains unknown.

## Files Changed

- `src/generation/verticalSliceMeasurementGate.ts`
- `src/index.ts`
- `docs/VERTICAL_SLICE_MEASUREMENT_GATE_BOUNDARY.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/verticalSliceMeasurementGate.test.ts`

## Behavior Changed

- Core now exposes a pure RC measurement summary gate.
- No default measurement replacement, renderer execution, external package
  import, pagination mutation, production binding, or package/document schema
  change is introduced.

## Tests Run

- `npm.cmd test -- tests/verticalSliceMeasurementGate.test.ts`
- `npm.cmd run check`

## Risks Left

- Feed this gate from the full RC smoke.
- Decide production drift policy in a later guarded phase.

## Intentionally Not Changed

- No external text-engine package import.
- No renderer-backed provider execution.
- No default pagination measurement replacement.
- No pagination cache mutation.
- No production measurement binding.
- No package/document schema change.
