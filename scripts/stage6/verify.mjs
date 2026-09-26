import { deepStrictEqual, strictEqual } from 'node:assert'
import { applyEdit, balancedCatalog, base, burstEdit, commonCatalog, corpus, digest, firstEdit, policy, preparationCatalog, sustainedEdit } from './corpus.mjs'

const corpusDigest = 'ca354f8b3c638eeefa7c4327f6c1253d06155cc2624aa99039767e30de7d8106'
const names = ['preparation', 'preparedFirst', 'sustained', 'burst', 'adversarial', 'cold']
const expectedCounts = { preparation: 825, preparedFirst: 4950, sustained: 4950, burst: 180, adversarial: 6, cold: 360 }

export function verifyPreflight(result) {
  strictEqual(result.schemaVersion, 'core-stage6-preflight/1')
  strictEqual(result.finalAdmissionRun, false)
  strictEqual(result.sourceStatus, '')
  strictEqual(result.historical, 'd5031b6151a0a6aba2fbe2c3320f122a935470a3')
  strictEqual(digest(result.obligations.corpus), corpusDigest)
  deepStrictEqual(result.obligations.policy, policy)
  deepStrictEqual(result.obligations.counts, expectedCounts)
  deepStrictEqual(result.obligations.currentRunOwnedCaps, { sourceFactsUtf16: 512, propertyFactsUtf16: 512, shapingSegmentationInputUtf16: 1024 })
  deepStrictEqual(result.obligations.preparation, preparationCatalog())
  deepStrictEqual(result.obligations.preparedFirst, balancedCatalog('prepared-first'))
  deepStrictEqual(result.obligations.sustained, balancedCatalog('sustained'))
  deepStrictEqual(result.obligations.cold, balancedCatalog('cold'))
  deepStrictEqual(result.obligations.adversarial, corpus.adversarial)
  strictEqual(result.obligations.burst.length, 180)
  let burstText = base('mixed', 1024), state = {}
  for (const [index, obligation] of result.obligations.burst.entries()) {
    strictEqual(obligation.revision, index + 1)
    const edit = burstEdit(burstText, index + 1, state)
    burstText = applyEdit(burstText, edit)
  }
  const fixed = firstEdit('thai', 256, 'append')
  const row = result.firstRequiredResult
  strictEqual(row.caseId, 'prepared-first-thai-256-append')
  strictEqual(row.source, fixed.text)
  deepStrictEqual(row.edit, fixed.edit)
  strictEqual(row.expectedText, applyEdit(fixed.text, fixed.edit))
  strictEqual(row.expectedRevision, 1)
  strictEqual(result.calls[0].method, 'stage3_create')
  strictEqual(JSON.parse(result.calls[0].request).authoredSpans[0].text, fixed.text)
  strictEqual(result.calls[0].parsed.status, 'Created')
  strictEqual(result.calls[1].method, 'stage4_apply')
  const command = JSON.parse(result.calls[1].request)
  deepStrictEqual({ start: command.startOffset, end: command.endOffset, insertedText: command.replacementText }, fixed.edit)
  strictEqual(command.composition, 'committed')
  strictEqual(command.receipt, result.calls[0].parsed.receipt)
  strictEqual(result.calls[1].parsed.status, row.status)
  strictEqual(result.calls[1].parsed.reason ?? null, row.reason)
  strictEqual(result.calls[1].parsed.unchangedReceipt, row.originalReceipt)
  strictEqual(result.calls[1].parsed.unchangedRevision, row.actualRevision)
  strictEqual(result.calls[2].method, 'stage5_verify')
  strictEqual(result.calls[2].receipt, row.resultingReceipt)
  strictEqual(JSON.parse(result.calls[2].request).authoredSpans[0].text, row.source)
  strictEqual(result.calls[2].parsed.status, 'Equal')
  strictEqual(result.calls[3].method, 'stage3_dispose')
  strictEqual(result.calls[3].parsed.status, 'Disposed')
  strictEqual(result.calls.length, 4)
  for (const call of result.calls) {
    strictEqual(typeof call.request, 'string')
    strictEqual(typeof call.response, 'string')
    deepStrictEqual(call.parsed, JSON.parse(call.response))
    strictEqual(call.host.requestBytes, Buffer.byteLength(call.request))
    strictEqual(call.host.responseBytes, Buffer.byteLength(call.response))
  }
  deepStrictEqual(result.accounting.provider, row.work)
  strictEqual(result.accounting.host.length, result.calls.length)
  strictEqual(Object.keys(row.work).length, 95)
  strictEqual(Object.keys(row.acceptedCumulativeWork).length, 91)
  deepStrictEqual(Object.keys(row.work).filter(field => !(field in row.acceptedCumulativeWork)).sort(),
    ['boundedOwnership', 'lineCertified', 'seamCertified', 'unsafeEdgesCertified'])
  for (const [field, value] of Object.entries(row.acceptedCumulativeWork)) {
    if (!/^[0-9a-f]{32}$/.test(value)) throw new Error(`Invalid cumulative slot: ${field}`)
    strictEqual(BigInt(`0x${value}`), 0n)
  }
  for (const name of names) strictEqual(result.executed[name] + result.unexecuted[name], expectedCounts[name])
  strictEqual(result.preflightProbes, 1)
  deepStrictEqual(result.executed, { preparation: 0, preparedFirst: 0, sustained: 0, burst: 0, adversarial: 0, cold: 0 })
  strictEqual(result.gate, 'BLOCKER')
  strictEqual(row.status, 'NotAdmissible')
  strictEqual(row.exact, false)
  strictEqual(row.unchangedVerified, true)
  strictEqual(result.unexecuted.burst, 180)
  return { valid: true, gate: result.gate, reason: row.reason, unexecuted: result.unexecuted }
}

export function verifySourceHashes(result, readCurrent, readHistorical) {
  for (const { path, sha256 } of result.sourceManifest) strictEqual(digest(readCurrent(path)), sha256, `Current source drift: ${path}`)
  for (const { path, sha256 } of result.historicalManifest) strictEqual(digest(readHistorical(path)), sha256, `Historical source drift: ${path}`)
}
