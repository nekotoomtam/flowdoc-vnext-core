# Live Draft MR1 Layout Unit Policy

Status: MR1 fixed-point foundation accepted on 2026-07-21. Multi-run shaping,
positioned fragments, renderer binding, and production activation remain
inactive.

## Outcome

MR1 introduces one versioned numeric policy for new canonical text-layout
contracts:

```text
1 point = 1,000,000 layout units
layout unit = signed safe integer
rounding = half away from zero
cross-runtime comparison = exact integer
```

The policy lives in `src/layout/layoutUnitPolicyV1.ts`. It exposes:

- stable policy identity and fingerprint;
- strict signed-safe-integer schemas;
- fail-closed point-to-layout-unit and layout-unit-to-point conversion;
- deterministic signed font-metric scaling from font units; and
- explicit overflow and invalid-input issues.

Authored document values remain in their existing `pt` and `mm` shapes. New
MR1 layout work converts to integer layout units at the measurement boundary
and converts back to points once at the renderer paint boundary.

## Rounding And Safety

Font metrics scale without floating-point geometry:

```text
scaled layout value = signedRoundDivide(
  font metric * font size layout units,
  units per em
)
```

The product must remain a JavaScript safe integer. Invalid font metrics,
non-positive font sizes, non-positive `unitsPerEm`, non-finite point values,
unsafe converted coordinates, and unsafe multiplication block without a
partial value. Negative half values round away from zero symmetrically with
positive half values.

Rust execution may use `i64`, but any value crossing the public JSON boundary
must fit the signed JavaScript safe-integer range retained by this policy.

## Boundary

This foundation does not:

- change persisted TextBlock or Text Run schemas;
- migrate existing float geometry or its 2/4/6-decimal policies;
- change `measureVNextText(...)`;
- change existing pagination or display-list behavior;
- import or execute Rust, WASM, Canvas, PDF, DOM, storage, or Backend code;
- bind a production renderer; or
- replace the accepted approximate-versus-renderer drift policy.

The historical renderer-drift thresholds and the MR1 exact-integer policy have
different owners. Renderer-drift evidence may retain thresholded point
comparisons; Browser/Node MR1 canonical layout facts must compare exact integer
values after normalization.

## Evidence

`tests/layoutUnitPolicyV1.test.ts` proves:

- stable JSON-safe policy identity and fingerprint;
- one million layout units per point;
- symmetric positive/negative half-away-from-zero conversion;
- negative-zero normalization;
- exact signed font-metric scaling;
- fail-closed non-finite, invalid, and unsafe arithmetic; and
- independence from renderer, engine, storage, and document mutation runtime.

## Next

Define the versioned MR1 resolved-shaping-run, positioned-line, and
line-fragment contracts using layout integers and this policy fingerprint.
The existing XR-5 path remains unchanged until those facts pass Node and real
Browser evidence.
