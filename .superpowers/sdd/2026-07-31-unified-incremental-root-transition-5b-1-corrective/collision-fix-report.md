# Genuine forced-collision authority proof report

## Scope

- `tests/textBlockUnifiedLayoutAdversarialV2.test.ts`

No production or public-export file changed. The existing private
`createVNextTextBlockPersistentSceneWithForcedCollisionForTestInternalV2`
factory remains absent from `src/index.ts`.

## Root cause

The former test changed digest fields on a structured clone. That clone had no
Scene or Root WeakMap authority, so its rejection proved only the ordinary
clone gate. It never created two valid exact candidates through the forced
fingerprint factory and therefore did not pressure either retain identity or
Root dependency identity under a real digest collision.

## Corrected proof

The adversarial test now builds two prepared `image-only` graphs with different
image paint semantics (`contain` versus `cover`), then creates both Scenes
through the actual private forced-collision factory. It proves that:

- both Scenes are valid exact prepared candidates;
- their paint semantics and exact trees differ while their claimed Scene
  fingerprints are equal;
- their independently prepared line trees are distinct exact objects with the
  same claimed fingerprint;
- a cross-Scene whole-range retain is blocked with
  `delivery-plan-retain-payload-mismatch`;
- two canonically recomposed Root wrappers have equal semantic and composite
  fingerprints, but candidate preparation and registration reject the Root
  carrying the foreign exact Scene;
- the matching exact Root prepares, atomically registers all six graph
  authorities, and passes public Root inspection.

## RED / mutation evidence

Because the runtime exact-identity guard was already correct and this finding
was a missing proof, the new test was mutation-checked. Temporarily replacing
the retain comparison `item.node === next[index]?.node` with Scene-node
fingerprint equality, then running:

```text
npx vitest run tests/textBlockUnifiedLayoutAdversarialV2.test.ts -t "rejects genuine forced Scene collisions"
```

failed as intended: 1 failed / 5 skipped. The cross-Scene operation was
incorrectly `prepared` instead of blocked. The temporary mutation was reverted
immediately and is not part of the patch.

## GREEN / verification evidence

- Focused adversarial gate:
  `npx vitest run tests/textBlockUnifiedLayoutAdversarialV2.test.ts`
  passed, 1 file / 6 tests.
- `npm run type-check` passed with exit code 0.
- No collision factory or registry hook was added to the public index; the
  existing public-surface negative assertion remains active.
