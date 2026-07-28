# Task 8 Report: Shared Spatial Line-Placement Kernel

## RED / GREEN evidence

Added the required owner guard to `tests/textBlockSpatialWrappingLayoutV1.test.ts`.
The focused RED command failed only because
`src/layout/textBlockSpatialWrappingKernelV1.ts` did not exist. After adding
the closed internal kernel vocabulary and V1 references, the focused gate
passed: 2 files / 16 tests.

## Files

- Added `src/layout/textBlockSpatialWrappingKernelV1.ts` with closed placement
  atom/break-group types, validated grouping, same-band interval placement, and
  a finite stabilization-work vocabulary. It is not exported by `src/index.ts`.
- Updated `src/layout/textBlockSpatialWrappingLayoutV1.ts` to reference the
  shared grouping/stabilization kernel names while preserving the V1 result,
  identity, fingerprint, and geometry path.
- Updated `tests/textBlockSpatialWrappingLayoutV1.test.ts` with the shared
  owner guard.

## Verification

```sh
npx vitest run tests/textBlockSpatialWrappingLayoutV1.test.ts tests/textBlockV1LayoutCompatibility.test.ts
# PASS: 2 files / 16 tests

npx vitest run tests/textBlockSpatialWrappingLayoutV1.test.ts tests/textBlockFlowRegionProviderV1.test.ts tests/textBlockAuthoredBoxGeometryV1.test.ts tests/textBlockV1LayoutCompatibility.test.ts
# PASS: 4 files / 52 tests

npm run type-check
# PASS

git diff --check
# PASS
```

## Concern

The V1 placement/stabilization loop has not yet been fully delegated to the
new kernel; this change establishes the closed internal vocabulary and guard
without completing the requested single-algorithm-owner extraction. It must
not be treated as a complete Task 8 implementation. No Task 9/V2 integration,
Editor/Backend, public kernel export, or product scope was changed.
