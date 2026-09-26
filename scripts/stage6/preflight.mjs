import { cpus, totalmem } from 'node:os'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { performance } from 'node:perf_hooks'
import { buildColdQaWasm } from '../../tests/coldQaWasmBuild.ts'
import { fixture } from '../../tests/coldStage3Fixtures.ts'
import { applyEdit, balancedCatalog, base, burstEdit, commonCatalog, corpus, firstEdit, policy, preparationCatalog, sustainedEdit } from './corpus.mjs'
import { verifyPreflight } from './verify.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const historical = 'd5031b6151a0a6aba2fbe2c3320f122a935470a3'
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
const sha = value => createHash('sha256').update(value).digest('hex')
const sourcePaths = [
  'scripts/stage6/corpus.mjs', 'scripts/stage6/preflight.mjs', 'scripts/stage6/verify.mjs',
  'tests/stage6Preflight.test.ts', 'tests/fixtures/stage6/gate2a.v2.json',
  'tests/coldStage3Fixtures.ts', 'tests/coldQaWasmBuild.ts',
  'packages/text-engine-rust-wasm/src/coldSessionStage3.ts',
  'packages/text-engine-rust-wasm/rust-live-draft-engine/src/cold_session/commands.rs',
  'packages/text-engine-rust-wasm/rust-live-draft-engine/src/cold_session/qa_compare.rs',
  'packages/text-engine-rust-wasm/rust-live-draft-engine/Cargo.lock',
  'assets/fonts/Sarabun/Sarabun-Regular.ttf',
]
const legacyPaths = [
  'scripts/run-incremental-boundary-gate2a-v2.mjs',
  'scripts/verify-incremental-boundary-gate2a-v2.mjs',
  'tests/fixtures/creator-preview/incremental-boundary-gate2a.v2.json',
]
const hashFiles = paths => paths.map(path => ({ path, sha256: sha(readFileSync(resolve(root, path))) }))
const hashLegacy = () => legacyPaths.map(path => ({ path, sha256: sha(execFileSync('git', ['show', `${historical}:${path}`], { cwd: root })) }))
const rowCounts = () => ({
  preparation: preparationCatalog().length * (policy.warmup + policy.repetitions),
  preparedFirst: commonCatalog('prepared-first').length * (policy.warmup + policy.repetitions),
  sustained: commonCatalog('sustained').length * (policy.warmup + policy.repetitions),
  burst: policy.burstRevisions,
  adversarial: corpus.adversarial.length,
  cold: commonCatalog('cold').length * (policy.coldWarmup + policy.coldRepetitions),
})

export function obligationManifest() {
  return {
    policy, corpus,
    counts: rowCounts(),
    preparation: preparationCatalog(),
    preparedFirst: balancedCatalog('prepared-first'),
    sustained: balancedCatalog('sustained'),
    cold: balancedCatalog('cold'),
    burst: Array.from({ length: policy.burstRevisions }, (_, index) => ({ revision: index + 1, generator: 'burstEdit(text,revision,state)' })),
    adversarial: corpus.adversarial,
    mapping: {
      append: 'Stage4 committed insertion at end', backspace: 'Stage4 committed deletion at end',
      'mid-insert': 'Stage4 committed insertion at retained generated offset',
      replacement: 'Stage4 committed replacement at retained generated offsets',
      'composition-update': 'Retained generator is a committed replacement request; active composition is a separate required lifecycle case and current Stage4 rejects it',
      'composition-commit': 'Retained generator is a committed empty insertion request; it does not exercise an active-to-committed transition',
      'mixed-burst': 'Stage4 committed edits on one live receipt across 180 dependent revisions',
    },
    currentRunOwnedCaps: { sourceFactsUtf16: 512, propertyFactsUtf16: 512, shapingSegmentationInputUtf16: 1024 },
    currentLifecycle: ['no-anchor-recovery', 'eviction', 'cancellation', 'disposal-receipts', 'continuous-ordinary-structural'],
  }
}

function rawCall(wasm, method, input) {
  const request = method === 'stage3_dispose' ? input : JSON.stringify(input)
  wasm.stage3_begin_transfer()
  const started = performance.now()
  let response
  try { response = wasm[method](request) } finally { wasm.stage3_end_transfer() }
  const wasmIntervalMs = performance.now() - started
  return { method, request, response, parsed: JSON.parse(response), wasmIntervalMs,
    host: { jsonEncodePasses: method === 'stage3_dispose' ? 0 : 1, jsonDecodePasses: 1,
      allocationCounterScope: 'Rust ABI lifecycle',
      requestBytes: Buffer.byteLength(request), responseBytes: Buffer.byteLength(response),
      allocationCalls: wasm.stage3_allocation_count(0).toString(), allocatedBytes: wasm.stage3_allocation_count(1).toString(),
      deallocationCalls: wasm.stage3_allocation_count(2).toString(), deallocatedBytes: wasm.stage3_allocation_count(3).toString() } }
}

function rawVerify(wasm, receipt, input) {
  const request = JSON.stringify(input)
  wasm.stage3_begin_transfer()
  const started = performance.now()
  let response
  try { response = wasm.stage5_verify(receipt, request) } finally { wasm.stage3_end_transfer() }
  return { method: 'stage5_verify', receipt, request, response, parsed: JSON.parse(response), wasmIntervalMs: performance.now() - started,
    host: { jsonEncodePasses: 1, jsonDecodePasses: 1, allocationCounterScope: 'Rust ABI lifecycle', receiptBytes: Buffer.byteLength(receipt),
      requestBytes: Buffer.byteLength(request), responseBytes: Buffer.byteLength(response),
      allocationCalls: wasm.stage3_allocation_count(0).toString(), allocatedBytes: wasm.stage3_allocation_count(1).toString(),
      deallocationCalls: wasm.stage3_allocation_count(2).toString(), deallocatedBytes: wasm.stage3_allocation_count(3).toString() } }
}

export async function runPreflight(output) {
  if (existsSync(output)) throw new Error(`Immutable preflight path exists: ${output}`)
  const commit = git('rev-parse', 'HEAD'), sourceStatus = git('status', '--short')
  if (sourceStatus) throw new Error(`Preflight requires clean committed source: ${sourceStatus}`)
  const sourceManifest = hashFiles(sourcePaths)
  const wasm = await buildColdQaWasm()
  const wasmPath = resolve(root, 'packages/text-engine-rust-wasm/rust-live-draft-engine/target/cold-session-qa/cold_session_bg.wasm')
  const manifest = obligationManifest()
  const first = manifest.preparedFirst[0]
  const generated = firstEdit(first.language, first.size, first.operation)
  const expectedText = applyEdit(generated.text, generated.edit)
  const input = fixture(generated.text)
  const created = rawCall(wasm, 'stage3_create', input)
  const calls = [created]
  let firstRequiredResult
  if (created.parsed.status !== 'Created') {
    firstRequiredResult = { caseId: first.caseId, phase: 'cold-construction', status: created.parsed.status, reason: created.parsed.reason,
      source: generated.text, edit: generated.edit, expectedText, expectedRevision: 0, actualRevision: null, exact: false }
  } else {
    const receipt = created.parsed.receipt
    const command = { receipt, expectedRevision: 0, startOffset: generated.edit.start, endOffset: generated.edit.end,
      replacementText: generated.edit.insertedText, anchorSpanId: 'span-1', composition: 'committed' }
    const applied = rawCall(wasm, 'stage4_apply', command)
    calls.push(applied)
    const candidateReceipt = applied.parsed.status === 'Accepted' ? applied.parsed.nextReceipt : receipt
    const candidateText = applied.parsed.status === 'Accepted' ? expectedText : generated.text
    const verification = rawVerify(wasm, candidateReceipt, fixture(candidateText))
    calls.push(verification)
    const work = applied.parsed.affectedSummary?.work ?? null
    const cumulative = applied.parsed.affectedSummary?.acceptedCumulativeWork ?? null
    firstRequiredResult = { caseId: first.caseId, phase: 'prepared-first', status: applied.parsed.status,
      reason: applied.parsed.reason ?? null, source: generated.text, edit: generated.edit, expectedText,
      expectedRevision: 1, actualRevision: applied.parsed.nextRevision ?? applied.parsed.unchangedRevision,
      originalReceipt: receipt, resultingReceipt: candidateReceipt, exact: applied.parsed.status === 'Accepted' && verification.parsed.status === 'Equal',
      unchangedVerified: applied.parsed.status !== 'Accepted' && verification.parsed.status === 'Equal',
      independentOracle: verification.parsed, work, acceptedCumulativeWork: cumulative }
    calls.push(rawCall(wasm, 'stage3_dispose', candidateReceipt))
  }
  const failed = firstRequiredResult.status !== 'Accepted' || !firstRequiredResult.exact
  const result = {
    schemaVersion: 'core-stage6-preflight/1', finalAdmissionRun: false, gate: failed ? 'BLOCKER' : 'NOT_RUN',
    commit, sourceStatus, historical, sourceManifest, historicalManifest: hashLegacy(),
    assets: { fontSha256: sha(readFileSync(resolve(root, 'assets/fonts/Sarabun/Sarabun-Regular.ttf'))), wasmSha256: sha(readFileSync(wasmPath)) },
    environment: { node: process.version, platform: process.platform, arch: process.arch, cpuModel: cpus()[0]?.model,
      logicalCpuCount: cpus().length, totalMemory: totalmem(), processId: process.pid },
    obligations: manifest, firstRequiredResult, calls,
    accounting: { provider: firstRequiredResult.work ?? null, host: calls.map(call => call.host),
      acceptedCumulative: firstRequiredResult.acceptedCumulativeWork ?? null,
      timing: 'wasmIntervalMs is a diagnostic call interval excluding host JSON encoding and decoding; no admission latency claim.',
      gaps: ['host heap and GC unmeasured', 'full phase latency unmeasured', 'remaining provider and host work unmeasured'],
      coverage: failed ? 'First required case captured; all final warmups and repetitions plus remaining rows unexecuted. No latency or cumulative gate claim.' : 'First case only; all final warmups and repetitions unexecuted.' },
    preflightProbes: 1,
    executed: { preparation: 0, preparedFirst: 0, sustained: 0, burst: 0, adversarial: 0, cold: 0 },
    unexecuted: { ...manifest.counts },
    lifecycleUnexecuted: ['no-anchor-recovery', 'eviction', 'cancellation', 'disposal-receipts', 'continuous-ordinary-structural'],
    nextAction: failed ? 'Stage4/semantic contract change request for this exact committed corpus row; do not run final timing or change thresholds.' : 'PLAN acceptance before separately authorized final measurement.',
  }
  mkdirSync(dirname(output), { recursive: true })
  writeFileSync(output, JSON.stringify(result, null, 2), { flag: 'wx' })
  verifyPreflight(JSON.parse(readFileSync(output, 'utf8')))
  if (git('rev-parse', 'HEAD') !== commit || git('status', '--short') !== sourceStatus || sourceManifest.some(entry => sha(readFileSync(resolve(root, entry.path))) !== entry.sha256))
    throw new Error('Source changed during preflight; immutable raw result retained')
  return result
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const output = resolve(process.argv[2] ?? '')
  if (!process.argv[2]) throw new Error('Expected immutable output path')
  const result = await runPreflight(output)
  console.log(JSON.stringify({ gate: result.gate, firstRequiredResult: result.firstRequiredResult, unexecuted: result.unexecuted, output }, null, 2))
}
