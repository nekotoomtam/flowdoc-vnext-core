# Text Engine Rustybuzz Smoke Corpus Boundary

Status: Phase 115 rustybuzz smoke corpus boundary.

Phase 115 expands the Phase 113/114 smoke path from one Sarabun sample to every
Phase 107 rustybuzz smoke case. The new package-local corpus harness proves
that each raw rustybuzz fixture can be mapped through the Phase 114 raw mapping
boundary and then accepted by the Phase 109 evidence acceptance boundary.

## Evidence

- `packages/text-engine-rust-wasm/fixtures/rustybuzz-native-smoke.corpus.v1.json`
  lists the raw rustybuzz fixture for each Phase 107 smoke case.
- The package now includes raw fixtures for Thai combining marks, mixed Thai/
  Latin/digit heading text, and the Noto Sans Thai currency fallback case in
  addition to the existing greeting fixture.
- `packages/text-engine-rust-wasm/src/rustybuzzSmokeCorpus.ts` maps every
  Phase 107 smoke case through `createFlowDocRustybuzzRawEvidenceMappingPlan`.
- `tests/textEngineRustybuzzSmokeCorpus.test.ts` proves all four mapped cases
  pass Phase 109 evidence acceptance.

## Boundary

Allowed:

- require one raw rustybuzz smoke fixture per Phase 107 smoke case;
- build adapter requests from existing Phase 107 cases and Thai corpus samples;
- aggregate mapped evidence coverage across fonts, samples, styles, glyphs,
  zero-advance glyphs, and repeated-cluster cases;
- keep WASM digest warnings visible per mapped case.

Blocked:

- production measurement binding;
- partial smoke corpus coverage;
- browser/worker WASM loading;
- ICU4X line break execution;
- multi-line wrapping beyond single-line smoke boxes;
- pagination measurer replacement.

## Result

The native rustybuzz smoke lane now covers the whole Phase 107 case set:
Sarabun regular greeting, Sarabun regular combining marks, Sarabun bold mixed
heading text, and Noto Sans Thai currency fallback text. This closes the
single-sample mapping unknown while deliberately leaving WASM parity and line
breaking as later risks.

## Non-goals

No ICU4X execution, WASM build, WASM loading, browser runtime loader,
production adapter binding, multi-line wrapping, Thai oracle comparison,
pagination draft mutation, renderer output, backend route, artifact write,
storage write, or package/document schema change is introduced in this phase.
