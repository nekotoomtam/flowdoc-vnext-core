import { createHash } from "node:crypto"
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import {
  FLOWDOC_FILE_JSON_ARTIFACT_BYTE_STORE_MODE,
  FLOWDOC_FILE_JSON_ARTIFACT_BYTE_STORE_SOURCE,
  FLOWDOC_FILE_JSON_STORAGE_PACKAGE,
  createFlowDocFileJsonArtifactByteStore,
  createFlowDocFileJsonArtifactByteStorePlan,
  createFlowDocFileJsonStorageAdapter,
} from "../packages/storage-file-json/src/index.js"
import { createVNextArtifactManifestPlan } from "../src/index.js"
import type { VNextArtifactManifestRecord } from "../src/index.js"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function tempStorageRoot(): string {
  return mkdtempSync(join(tmpdir(), "flowdoc-artifact-byte-store-"))
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex")
}

function pdfBytes(): Uint8Array {
  return Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n", "utf8")
}

function renderedManifest(input: {
  artifactId: string
  byteLength: number
  sha256: string
  storageKey: string
}): VNextArtifactManifestRecord {
  const plan = createVNextArtifactManifestPlan({
    artifactId: input.artifactId,
    sourcePackageId: "package:artifact-byte-store",
    sessionId: "session:artifact-byte-store",
    jobId: "job:artifact-byte-store",
    rendererProfileId: "pdf-spike-profile-v1",
    measurementProfileId: "text-engine-profile-v1",
    format: "pdf",
    mediaType: "application/pdf",
    byteLength: input.byteLength,
    sha256: input.sha256,
    storageKey: input.storageKey,
    createdAt: "2026-06-29T02:00:00.000Z",
    status: "rendered",
    error: null,
  })

  if (plan.record == null) throw new Error(`manifest did not validate: ${JSON.stringify(plan.issues)}`)
  return plan.record
}

describe("artifact byte store slice", () => {
  const tempRoots: string[] = []

  afterEach(() => {
    tempRoots.splice(0).forEach((root) => {
      rmSync(root, { recursive: true, force: true })
    })
  })

  function createTempByteStore() {
    const root = tempStorageRoot()
    tempRoots.push(root)

    return {
      root,
      byteStore: createFlowDocFileJsonArtifactByteStore({ rootDirectory: root }),
    }
  }

  it("writes artifact bytes, computes sha256, and reads the same bytes back", async () => {
    const { byteStore } = createTempByteStore()
    const bytes = pdfBytes()
    const expectedSha256 = sha256(bytes)

    const written = await byteStore.write({
      artifactId: "artifact:phase-174:pdf",
      mediaType: "application/pdf",
      bytes,
      expectedSha256,
    })

    expect(written.ok).toBe(true)
    if (!written.ok) throw new Error("expected artifact byte write to succeed")
    expect(written.source).toBe(FLOWDOC_FILE_JSON_ARTIFACT_BYTE_STORE_SOURCE)
    expect(written.mode).toBe(FLOWDOC_FILE_JSON_ARTIFACT_BYTE_STORE_MODE)
    expect(written.status).toBe("written")
    expect(written.artifact).toMatchObject({
      artifactId: "artifact:phase-174:pdf",
      mediaType: "application/pdf",
      byteLength: bytes.byteLength,
      sha256: expectedSha256,
    })
    expect(written.artifact.storageKey).toMatch(/^artifact-bytes-v1\.[A-Za-z0-9_-]+\.[a-f0-9]{64}\.bin$/u)
    expect(existsSync(written.artifact.filePath)).toBe(true)
    expect(written.contracts).toMatchObject({
      artifactByteWrites: true,
      recordEnvelopeWrites: false,
      manifestMutation: false,
      multiRecordTransactions: false,
      backendRoute: false,
      productionStorageReady: false,
    })
    expect(JSON.parse(JSON.stringify({
      status: written.status,
      artifact: written.artifact,
      contracts: written.contracts,
    }))).toEqual({
      status: written.status,
      artifact: written.artifact,
      contracts: written.contracts,
    })

    const readBack = await byteStore.read({ storageKey: written.artifact.storageKey })

    expect(readBack.ok).toBe(true)
    if (!readBack.ok) throw new Error("expected artifact byte read to succeed")
    expect(readBack.status).toBe("found")
    expect(readBack.artifact).toMatchObject({
      artifactId: "artifact:phase-174:pdf",
      byteLength: bytes.byteLength,
      sha256: expectedSha256,
      storageKey: written.artifact.storageKey,
    })
    expect(Buffer.from(readBack.bytes).equals(Buffer.from(bytes))).toBe(true)
  })

  it("returns bounded errors for digest mismatch, invalid input, and missing artifacts", async () => {
    const { byteStore } = createTempByteStore()
    const bytes = pdfBytes()
    const missingStorageKey = `artifact-bytes-v1.${Buffer.from("artifact:missing", "utf8").toString("base64url")}.${"a".repeat(64)}.bin`

    const digestMismatch = await byteStore.write({
      artifactId: "artifact:phase-174:mismatch",
      mediaType: "application/pdf",
      bytes,
      expectedSha256: "0".repeat(64),
    })
    const invalid = await byteStore.write({
      artifactId: "",
      mediaType: "",
      bytes: new Uint8Array(),
    })
    const missing = await byteStore.read({ storageKey: missingStorageKey })

    expect(digestMismatch).toMatchObject({
      ok: false,
      status: "digest-mismatch",
      artifact: null,
      issues: [expect.objectContaining({ code: "expected-sha256-mismatch" })],
    })
    expect(invalid).toMatchObject({
      ok: false,
      status: "invalid-request",
      artifact: null,
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "invalid-string", path: "artifactId" }),
        expect.objectContaining({ code: "invalid-string", path: "mediaType" }),
        expect.objectContaining({ code: "invalid-bytes", path: "bytes" }),
      ]),
    })
    expect(missing).toMatchObject({
      ok: false,
      status: "missing",
      artifact: expect.objectContaining({
        artifactId: "artifact:missing",
        storageKey: missingStorageKey,
      }),
      issues: [expect.objectContaining({ code: "artifact-bytes-missing" })],
    })
  })

  it("checks rendered manifest consistency without mutating the manifest schema", async () => {
    const { byteStore } = createTempByteStore()
    const bytes = pdfBytes()
    const written = await byteStore.write({
      artifactId: "artifact:phase-174:consistent",
      mediaType: "application/pdf",
      bytes,
    })

    expect(written.ok).toBe(true)
    if (!written.ok) throw new Error("expected artifact byte write to succeed")

    const manifest = renderedManifest({
      artifactId: written.artifact.artifactId,
      byteLength: written.artifact.byteLength,
      sha256: written.artifact.sha256,
      storageKey: written.artifact.storageKey,
    })
    const consistent = await byteStore.verifyManifestConsistency(manifest)
    const inconsistent = await byteStore.verifyManifestConsistency({
      ...manifest,
      byteLength: manifest.byteLength == null ? 1 : manifest.byteLength + 1,
    })
    const invalid = await byteStore.verifyManifestConsistency({
      ...manifest,
      status: "planned",
      byteLength: null,
      sha256: null,
      storageKey: null,
    })

    expect(consistent).toMatchObject({
      ok: true,
      status: "consistent",
      artifact: {
        artifactId: manifest.artifactId,
        byteLength: manifest.byteLength,
        sha256: manifest.sha256,
        storageKey: manifest.storageKey,
      },
      contracts: {
        manifestMutation: false,
        artifactByteWrites: true,
      },
    })
    if (!consistent.ok) throw new Error("expected manifest consistency check to succeed")
    expect(consistent.manifest.storageStatus).toBe("not-written")
    expect(inconsistent).toMatchObject({
      ok: false,
      status: "inconsistent",
      issues: [expect.objectContaining({ code: "byte-length-mismatch" })],
    })
    expect(invalid).toMatchObject({
      ok: false,
      status: "invalid-manifest",
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "artifact-not-rendered" }),
        expect.objectContaining({ code: "invalid-byte-length" }),
        expect.objectContaining({ code: "invalid-sha256" }),
        expect.objectContaining({ code: "invalid-storage-key" }),
      ]),
    })
  })

  it("keeps the record adapter separate from the artifact byte store", () => {
    const { root, byteStore } = createTempByteStore()
    const recordAdapter = createFlowDocFileJsonStorageAdapter({ rootDirectory: root })
    const bytePlan = createFlowDocFileJsonArtifactByteStorePlan(root)

    expect(recordAdapter.contracts.artifactByteWrites).toBe(false)
    expect(recordAdapter.contracts.multiRecordTransactions).toBe(false)
    expect(byteStore.contracts.artifactByteWrites).toBe(true)
    expect(byteStore.contracts.recordEnvelopeWrites).toBe(false)
    expect(bytePlan).toMatchObject({
      source: FLOWDOC_FILE_JSON_ARTIFACT_BYTE_STORE_SOURCE,
      mode: FLOWDOC_FILE_JSON_ARTIFACT_BYTE_STORE_MODE,
      status: "internal-alpha-byte-store",
      adapterPackageName: FLOWDOC_FILE_JSON_STORAGE_PACKAGE,
      corePackageName: "@flowdoc/vnext-core",
      byteDirectoryName: "artifact-bytes",
      storageKeyFormat: "artifact-bytes-v1.<base64url-artifact-id>.<sha256>.bin",
      consistencyCheck: {
        readsBytes: true,
        comparesArtifactId: true,
        comparesByteLength: true,
        comparesSha256: true,
        mutatesManifest: false,
      },
      contracts: {
        artifactByteWrites: true,
        recordEnvelopeWrites: false,
        backendRoute: false,
        productionStorageReady: false,
      },
    })
  })

  it("documents Phase 174 and keeps the historical Phase 175 handoff", () => {
    const source = readText("../packages/storage-file-json/src/index.ts")
    const doc = readText("../docs/ARTIFACT_BYTE_STORE_SLICE.md")
    const phase173Doc = readText("../docs/EXTERNAL_FILE_BACKED_STORAGE_ADAPTER_SLICE.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const phase173Test = readText("./storageFileJsonAdapter.test.ts")

    expect(source).toContain("createHash")
    expect(source).toContain("artifactByteWrites: true")
    expect(source).toContain("recordEnvelopeWrites: false")
    expect(source).not.toMatch(/better-sqlite3|sqlite3|postgres|pg|express|playwright|puppeteer|S3|aws-sdk/u)
    expect(doc).toContain("Status: Phase 174 artifact byte store slice.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Next recommended phase: Phase 175: Storage-backed RC Roundtrip Smoke.")
    expect(phase173Doc).toContain("Next recommended phase: Phase 174: Artifact Byte Store Slice.")
    expect(readme).toContain("Artifact byte store slice")
    expect(readme).toContain("docs/ARTIFACT_BYTE_STORE_SLICE.md")
    expect(ledger).toContain("| 174 | Artifact byte store slice | done |")
    expect(roadmap).toContain("## Historical Phase 174 Handoff")
    expect(roadmap).toContain("## Phase 174: Artifact Byte Store Slice")
    expect(roadmap).toContain("Current next step after Phase 174:")
    expect(roadmap).toContain("Phase 175: Storage-backed RC Roundtrip Smoke")
    expect(roadmap).toContain("Current next step after Phase 175:")
    expect(roadmap).toContain("Phase 176: Backend Route Contract To Storage Binding")
    expect(phase173Test).toContain("historical Phase 174 handoff")
  })
})
