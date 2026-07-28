# Task 7 Report: V2 Spatial Index, Move/Resize, And Flow Regions

## Outcome

Committed Task 7 as `1693485b1a8664cb27393fbebb1c046054e07e45` with message
`feat(layout): index v2 flow regions`.

## TDD evidence

The initial required RED command was:

```sh
npx vitest run tests/textBlockSpatialIndexV2.test.ts tests/textBlockFlowRegionProviderV2.test.ts
```

It failed as intended: 2 files / 7 tests failed because
`createVNextTextBlockSpatialIndexV2` was not exported and therefore was not a
function. The fixture setup completed; there were no syntax or fixture failures.

After implementing the V2 contracts and wrappers, the same focused command
passed: 2 files / 10 tests.

## Files and behavior

- `src/layout/textBlockSpatialIndexContractV2.ts` defines the V2 index,
  update, region, issue, and inspector contracts.
- `src/layout/textBlockSpatialIndexV2.ts` validates the exact Initial
  Flow/evidence/tree authority tuple, materializes and freezes V2-owned treap
  nodes, fingerprints the V2 wrapper, and binds only that frozen index object
  to the retained V2 authority.
- `src/layout/textBlockSpatialIndexUpdateV2.ts` performs strict-envelope,
  authority-bound path-copy moves/resizes via the Task 6 kernel, reports only
  old/new affected bands and path-copy work, and binds the resulting index to
  the same authority.
- `src/layout/textBlockFlowRegionProviderV2.ts` validates the V2 index/tuple
  before calling the Task 6 provider kernel. Its empty and overlay-only
  flow-affecting-zero path uses the kernel's zero-query fast path.
- `tests/helpers/textBlockInlineImageFlowV2.ts` now builds the exact V2
  persistent tree paired with the existing Initial Flow/evidence fixture.
- `tests/textBlockSpatialIndexV2.test.ts` covers accepted immutable build,
  foreign Initial Flow rejection, move affected-band union, stale fingerprint
  rejection, and no-complete-rebuild work.
- `tests/textBlockFlowRegionProviderV2.test.ts` covers left/right/middle
  subtraction, top/bottom barriers, overlay neutrality, zero-space event
  advancement, and the zero-query fast path.
- `src/index.ts` exports all public V2 contracts and entrypoints.

## Verification

```sh
npx vitest run tests/textBlockSpatialIndexV2.test.ts tests/textBlockFlowRegionProviderV2.test.ts
# PASS: 2 files / 10 tests

npx vitest run tests/textBlockSpatialIndexV2.test.ts tests/textBlockFlowRegionProviderV2.test.ts tests/textBlockSpatialIndexV1.test.ts tests/textBlockSpatialIndexUpdateV1.test.ts tests/textBlockFlowRegionProviderV1.test.ts tests/textBlockV1LayoutCompatibility.test.ts
# PASS: 6 files / 34 tests

npm run type-check
# PASS

git diff --check
# PASS

git diff --cached --check
# PASS
```

## Concerns and review notes

No blocking concerns. The V2 wrappers own process-local registrations,
fingerprints, freezing, authority/index bindings, and inspectors; the V1
entry parser and Task 6 treap/region kernels remain unchanged. Private maps
are not exposed through accepted outputs. Blocked index/update/region results
contain no partial index, update, or interval payloads.

## Intentionally untouched scope

Task 8 spatial wrapping layout integration; Editor/Backend; fixed-height,
list, and empty geometry; Columns/Table; publication/production; staged
apply; and all V1/kernel behavior were intentionally not changed.

## Fix Round 1

Fix Round 1 hardened Task 7 V2-only boundaries without changing V1 or Task 6
kernels. Focused RED was observed before implementation: null `entries` threw
while calling the V1 parser, an owner-bearing update was rejected by the old
envelope, and the package barrel exposed privileged index construction helpers.

The build envelope now requires a standard dense Array and snapshots only
plain/null-prototype, exact data records (including entry and clearance
records). Update and provider envelopes apply the same exact-record discipline
to their outer and nested geometry/band/inset values. Class instances,
accessors, extra/symbol keys, and throwing proxy traps fail closed without
invoking accessors. A fully transparent forwarding Proxy is indistinguishable
from its target in portable ECMAScript; no Node-only detection or structured
clone pass was added.

The public barrel now exports only V2 entrypoints and inspectors. Construction,
materialization, binding, query, fingerprint, and freezing helpers remain
module-internal to Task 7, and callers receive a defensive copy rather than a
live entry Map. Index, update, and provider inspectors now retain and compare
canonical facts/fingerprints with recursive freezing. Update inspection verifies
the exact update/previous-index/next-index pair.

The user-approved update API now requires `geometryOwnerFingerprint`; mismatches
block with no partial update. Accepted update artifacts retain that owner and
explicitly report `mayPublishLayout: false` and `productionBinding: false`.

Fix Round 1 focused verification: 2 files / 13 tests PASS. Final six-file gate
PASS: 6 files / 37 tests. `npm run type-check`, `git diff --check`, and staged
`git diff --cached --check` PASS. Fix Round 1 commit:
`efa3909364fda63b627512d8e709316cc0d8cd40` (`fix(layout): harden v2 spatial authority`).

## Fix Round 2/5

Replaced post-guard reassignment of `unknown` parameters in the V2 update and
provider wrappers with explicit `acceptedInput` locals. This preserves the
existing exact-record validation while giving TypeScript a stable, soundly
narrowed value for property access and object spread. Verification: six-file
gate PASS (6 files / 37 tests), `npm run type-check` PASS, and
`git diff --check` PASS.

The reported `tests/textBlockSpatialIndexV1.test.ts` `Block | undefined`
location is unchanged when read directly from parent commit `1693485`; no V1
file was edited.

## Fix Round 3/5

Historical context: `2145d4a` narrowed V2 envelope locals and `855fccd` added
the corresponding spatial guard body test coverage. This round adds a primitive
nonblank-string requirement for `objectId` and `geometryOwnerFingerprint` in
the exact update envelope. It therefore blocks Symbols and objects with
throwing coercion hooks before Map lookup or diagnostic interpolation, with
`update: null` and `nextIndex: null`.

Focused RED reproduced both failures before the source change: a Symbol object
id threw `Cannot convert a Symbol value to a string`, and an object with a
throwing coercion hook threw that error. Focused GREEN: 2 files / 17 tests.
New public-boundary rows cover cloned index rejection, move and resize changes
to provider intervals under the same exact authority, unsafe arithmetic,
invalid bands, and invalid insets. Empty/overlay zero-query paths remain
covered by the existing rows.

Final verification before committing: six-file Task 7 gate PASS (6 files / 41
tests), `npm run type-check` completed PASS, `git diff --check` PASS.
