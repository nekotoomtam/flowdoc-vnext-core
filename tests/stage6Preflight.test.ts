import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
// @ts-expect-error Private Node-only harness module has no public declarations.
import { applyEdit, base, burstEdit, corpus, digest, firstEdit, policy, sustainedEdit } from '../scripts/stage6/corpus.mjs'
// @ts-expect-error Private Node-only harness module has no public declarations.
import { obligationManifest } from '../scripts/stage6/preflight.mjs'
// @ts-expect-error Private Node-only harness module has no public declarations.
import { verifyPreflight, verifySourceHashes } from '../scripts/stage6/verify.mjs'

describe('retained Stage 6 corpus preflight', () => {
  it('pins the original corpus and complete denominator before probing one required case', () => {
    const manifest = obligationManifest()
    expect(digest(corpus)).toBe('ca354f8b3c638eeefa7c4327f6c1253d06155cc2624aa99039767e30de7d8106')
    expect(manifest.counts).toEqual({ preparation: 825, preparedFirst: 4950, sustained: 4950, burst: 180, adversarial: 6, cold: 360 })
    expect(policy).toMatchObject({ warmup: 5, repetitions: 50, burstRevisions: 180, maxWindowUtf16: 512,
      maxShapeAndSegmentUtf16: 1024, preparedP95Ms: 8, preparedMaxMs: 16.7, maxScalingRatio: 1.5 })
    expect(manifest.preparedFirst).toHaveLength(90)
    expect(manifest.sustained).toHaveLength(90)
    expect(manifest.burst).toHaveLength(180)
    expect(manifest.adversarial).toEqual(corpus.adversarial)
  })

  it('preserves exact generated requests, including dependent burst revisions', () => {
    const first = firstEdit('thai', 256, 'append')
    expect(first.text).toBe(base('thai', 256))
    expect(first.edit).toEqual({ start: 256, end: 256, insertedText: 'ก' })
    expect(firstEdit('latin', 256, 'composition-update').edit).toEqual({ start: 255, end: 256, insertedText: 'กำ' })
    expect(firstEdit('latin', 256, 'composition-commit').edit).toEqual({ start: 256, end: 256, insertedText: '' })
    let text = base('mixed', 1024)
    const state = {}
    for (let revision = 1; revision <= 180; revision++) {
      const edit = burstEdit(text, revision, state)
      if (revision === 1) expect(edit).toEqual({ start: 1024, end: 1024, insertedText: 'ก' })
      text = applyEdit(text, edit)
    }
    expect(text).toHaveLength(1024)
    expect(sustainedEdit(base('latin', 256), 'composition-commit', 0)).toEqual({ start: 256, end: 256, insertedText: '' })
  })

  it.skipIf(!process.env.STAGE6_PREFLIGHT_ARTIFACT)('verifies immutable raw artifact and rejects denominator or response tampering', () => {
    const artifact = JSON.parse(readFileSync(process.env.STAGE6_PREFLIGHT_ARTIFACT!, 'utf8'))
    expect(verifyPreflight(artifact).gate).toBe('BLOCKER')
    verifySourceHashes(artifact, (path: string) => readFileSync(path), (path: string) => execFileSync('git', ['show', `${artifact.historical}:${path}`]))
    const reduced = structuredClone(artifact)
    reduced.unexecuted.burst = 179
    expect(() => verifyPreflight(reduced)).toThrow()
    const forged = structuredClone(artifact)
    forged.calls[1].parsed.status = 'Accepted'
    expect(() => verifyPreflight(forged)).toThrow()
  })
})
