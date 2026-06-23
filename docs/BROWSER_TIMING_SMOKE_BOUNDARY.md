# Browser Timing Smoke Boundary

Status: Phase 142 browser timing smoke boundary.

Phase 142 adds a dependency-free timing smoke for the template-builder sandbox
browser-runtime path. It records coarse operation timings for boot, visible
range apply, scroll update, selection jump, structural command apply, rich
inline draft open, and rich inline commit.

This is a smoke harness, not a production benchmark.

## Evidence

- `examples/template-builder-sandbox/scripts/browser-smoke.mjs` emits bounded
  JSON timing output.
- `examples/template-builder-sandbox/package.json` exposes `npm run
  browser-smoke`.
- `tests/browserTimingSmoke.test.ts` runs the script, checks operation names,
  validates finite timings, and guards against adding Playwright/Puppeteer to
  the core package.
- The result records `browserDriver = `not-bound`` and
  `productionBenchmark = false`.

## Boundary

Allowed:

- measure coarse sandbox-runtime timings with conservative thresholds;
- output diagnostic JSON;
- keep browser-driver tooling optional and unbound;
- keep the smoke outside production performance claims.

Blocked:

- adding Playwright/Puppeteer or browser automation dependencies to core;
- claiming production browser performance readiness;
- setting strict production thresholds;
- requiring a browser driver in `npm.cmd run check`;
- changing package/document schema.

## PASS

- Timing JSON is produced.
- The smoke covers boot, visible range, scroll, selection, structural command,
  rich inline draft, and rich inline commit operations.
- Thresholds are explicit and conservative.
- Core tests remain green without browser-driver dependencies.

## FAIL / BLOCKER

- No blocker was found for closing this smoke boundary.

## RISK

- The smoke uses the sandbox runtime path and does not launch a real browser
  driver yet.
- Timing is coarse and should not be used as a production performance
  benchmark.

## UNKNOWN

- Production browser thresholds remain unknown.
- Real browser driver choice, CI availability, and screenshot/interaction QA
  remain future work.

## Files Changed

- `examples/template-builder-sandbox/scripts/browser-smoke.mjs`
- `examples/template-builder-sandbox/package.json`
- `docs/BROWSER_TIMING_SMOKE_BOUNDARY.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/browserTimingSmoke.test.ts`

## Behavior Changed

- The sandbox now has a dependency-free timing smoke script.
- No core runtime, renderer, storage, backend route, package/document schema,
  or production browser behavior changed.

## Tests Run

- `npm.cmd test -- tests/browserTimingSmoke.test.ts`
- `npm.cmd run check`

## Risks Left

- Add real browser-driver timing once the project accepts a browser automation
  dependency or CI capability.
- Define production thresholds separately from this smoke.
- Add interaction and visual QA outside the core package.

## Intentionally Not Changed

- No Playwright/Puppeteer dependency.
- No production performance claim.
- No strict production threshold.
- No renderer artifact output.
- No storage/backend route.
- No package/document schema change.

## Non-goals

No production benchmark suite, real browser driver dependency, screenshot QA,
renderer artifact generation, storage, backend route, collaboration behavior,
or schema change is introduced in this phase.
