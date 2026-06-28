# Vertical Slice RC Scenario Boundary

Status: Phase 147 RC scenario fixture boundary.

Phase 147 adds the first product-shaped scenario fixture that can feed the
Phase 146 RC report builder.

The scenario boundary remains fixture-fed and pure. It does not read files,
write storage, run browser APIs, call renderers, import external spike
packages, or change package/document schema.

## Evidence

- `fixtures/vertical-slice-rc-report.v1.flowdoc.json` is a canonical package
  v2/document v3 report fixture.
- `fixtures/vertical-slice-rc-scenario.v1.json` declares the RC scenario id,
  package fixture, intended rich inline replacement, expected stale exact
  generation, expected PDF format, and expected storage collections.
- `src/generation/verticalSliceScenario.ts` validates the package and scenario
  supplied by callers and returns an RC report seed.
- `tests/verticalSliceScenario.test.ts` proves package parsing, scenario
  reference validation, Phase 146 feed compatibility, dependency cleanliness,
  and phase trail updates.

## Boundary

Allowed:

- add one canonical report fixture;
- add one scenario metadata fixture;
- validate target node ids and field keys;
- validate replacement inline children as text or field-ref;
- return RC report seed fields for the Phase 146 builder.

Blocked:

- mutating existing product fixtures;
- accepting old/prototype document shapes;
- adding repeat/collection materialization;
- adding workflow/reviewer runtime;
- loading fixtures from the source helper;
- adding browser, storage, server, renderer, or external spike package
  execution.

## PASS

- Scenario fixture parses as canonical package v2/document v3.
- Scenario references valid text-block and field ids.
- Scenario includes a field-ref chip case.
- Scenario can feed the Phase 146 report builder.

## FAIL / BLOCKER

- No blocker prevents using this scenario as the first RC smoke input.

## RISK

- The fixture is intentionally small and does not prove full report fidelity.
- The scenario declares expected artifact/storage outcomes but does not produce
  them.

## UNKNOWN

- Final product demo data and richer layout needs remain future work.
- Repeat/collection needs remain intentionally outside this RC scenario.

## Files Changed

- `fixtures/vertical-slice-rc-report.v1.flowdoc.json`
- `fixtures/vertical-slice-rc-scenario.v1.json`
- `src/generation/verticalSliceScenario.ts`
- `src/index.ts`
- `docs/VERTICAL_SLICE_RC_SCENARIO_BOUNDARY.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/verticalSliceScenario.test.ts`

## Behavior Changed

- Core now exposes a fixture-fed RC scenario validator and report seed
  boundary.
- No runtime storage, browser, server, renderer, external package, workflow,
  repeat/collection, or package/document schema behavior changed.

## Tests Run

- `npm.cmd test -- tests/verticalSliceScenario.test.ts`
- `npm.cmd run check`

## Risks Left

- Build measurement, artifact, and storage summary helpers.
- Run the E2E RC report smoke after those summaries exist.

## Intentionally Not Changed

- No existing fixture mutation.
- No old/prototype document shape.
- No repeat/collection materialization.
- No workflow/reviewer runtime.
- No fixture file reads inside source helper.
- No browser APIs.
- No storage writes.
- No server route.
- No renderer execution.
- No external spike package import.
- No package/document schema change.
