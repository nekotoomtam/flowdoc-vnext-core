# Delivery accessor-safety fix report

## Scope

- `src/layout/textBlockSceneDeliveryV2.ts`
- `tests/textBlockSceneDeliveryV2.test.ts`

The public plan inspector now descriptor-parses every splice replacement chunk
before canonical comparison. The complete-delivery inspector descriptor-parses
every emitted chunk, mapping, line internal, source span, content/authored
geometry, paint run, authored frame, summary, observations, and work record
before ordinary reads, fingerprinting, or payload estimation. Parsers accept
ordinary object/null and Array structured-clone data only, reject symbols,
custom prototypes, accessors, malformed integer/range data, and repeated chunk
graphs, and copy validated public renderer data before later inspection.

## TDD evidence

RED command, before the delivery parser implementation:

```text
npx vitest run --config vitest.config.ts tests/textBlockSceneDeliveryV2.test.ts
```

Result: exit 1; 1 failed / 10 tests. The new nested splice source-span getter
case returned `valid` rather than `invalid-input`, proving the plan inspector
had canonically read nested accessor-backed renderer data.

GREEN command:

```text
npx vitest run --config vitest.config.ts tests/textBlockSceneDeliveryV2.test.ts
```

Result: exit 0; 1 file / 10 tests passed. The regression covers retain-path
array data, splice source spans, and complete-delivery source mappings, line
internals, content and authored geometry, paint runs, and authored-frame data.
Every getter read count is exactly zero; public plan rejection is
`invalid-input` and complete-delivery rejection is
`complete-delivery-data-mismatch`.

## Verification status

- Focused delivery test: passed, 1 file / 10 tests.
- `git diff --check`: passed.
- `npm run type-check`: currently blocked by unrelated concurrent edits in
  `textBlockUnifiedLayoutTransitionSceneInternalsV1.ts` and
  `tests/textBlockPersistentSceneV2.test.ts`; the delivery file reported no
  TypeScript errors. Re-run after those active-wave fixes land before commit.
