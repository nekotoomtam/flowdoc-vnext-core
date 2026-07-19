import { createHash } from "node:crypto"
import { spawnSync } from "node:child_process"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import {
  createVNextPdfExportRequestV1,
  type VNextPdfExportRequestV1,
  type VNextPdfExportSourceIdentityV1,
  type VNextPdfImageAssetV1,
  type VNextPdfMeasuredDrawContractResultV1,
} from "@flowdoc/vnext-core"
import {
  executeFlowDocPdfExportHandoffV1,
  renderFlowDocLocalMeasuredDocumentPdfControlled,
  type FlowDocPdfRendererPilotFontResource,
  type FlowDocPdfRendererPilotImageResource,
} from "../../pdf-renderer-pilot/src/full.js"
import {
  createFlowDocUatMeasuredExportBundleV1,
  createFlowDocUatMeasuredExportPlanV1,
  FLOWDOC_UAT_SCREENSHOT_PLACEMENT_POLICY,
  resolveFlowDocUatSectionV1,
} from "../src/index.js"
import { measureFlowDocUatPlanNativeV1 } from "./uat-native-measurement-runtime.js"
import { load69cUatSectionAdapter } from "./verify-69c-section-adapter-runtime.js"

interface SubsetManifest {
  subsetId: string
  fontId: string
  postScriptName: string
  subsetPrefix: string
  source: { path: string; sha256: string; bytes: number }
  subset: { path: string; sha256: string; bytes: number; retainedGlyphIds: number[] }
}

interface RestartProbeInput {
  request: VNextPdfExportRequestV1
  currentSource: VNextPdfExportSourceIdentityV1
  measuredDrawContract: Extract<VNextPdfMeasuredDrawContractResultV1, { status: "consumable" }>
  fontManifests: string[]
  imageResources: Array<{ assetId: string; path: string }>
}

export interface Verify69cUatMeasuredExportResultV1 {
  evidence: Record<string, unknown>
  pdfBytes: Uint8Array
  restartProbePath: string
  restartExpected: {
    sha256: string
    byteLength: number
    pageCount: number
    receiptFingerprint: string
  }
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex")
}

function buildSubset(input: {
  repoRoot: string
  contractPath: string
  outputDirectory: string
  fontId: "ibm-plex-sans-thai-regular" | "ibm-plex-sans-thai-bold"
  sourcePath: string
  fileStem: string
  styleName: "Regular" | "Bold"
  subsetPrefix: string
  contractFingerprint: string
}): string {
  const subsetPath = resolve(input.outputDirectory, `${input.fileStem}.ttf`)
  const manifestPath = resolve(input.outputDirectory, `${input.fileStem}.manifest.v1.json`)
  const result = spawnSync("python", [
    resolve(input.repoRoot, "packages/pdf-renderer-pilot/scripts/build-canonical-report-font-subset.py"),
    "--request", input.contractPath,
    "--font-id", input.fontId,
    "--source", input.sourcePath,
    "--subset", subsetPath,
    "--manifest", manifestPath,
    "--phase-id", "PDF-EXPORT-REALDOC-D",
    "--subset-id", `flowdoc-local-measured-${input.styleName.toLowerCase()}-${input.contractFingerprint.slice(7, 23)}`,
    "--family-name", "FlowDoc Local Measured Document",
    "--postscript-name", input.fileStem,
    "--subset-prefix", input.subsetPrefix,
    "--style-name", input.styleName,
    "--font-specific-glyphs",
  ], { cwd: input.repoRoot, encoding: "utf8", maxBuffer: 4 * 1024 * 1024 })
  if (result.status !== 0) throw new Error(`UAT font subset build failed for ${input.fontId}:\n${result.stderr || result.stdout}`)
  return manifestPath
}

function fontResource(repoRoot: string, manifestPath: string): FlowDocPdfRendererPilotFontResource {
  const manifest = readJson<SubsetManifest>(manifestPath)
  return {
    fontId: manifest.fontId,
    subsetId: manifest.subsetId,
    subsetPrefix: manifest.subsetPrefix,
    postScriptName: manifest.postScriptName,
    subsetSha256: manifest.subset.sha256,
    sourceBytes: readFileSync(resolve(repoRoot, manifest.source.path)),
    subsetBytes: readFileSync(resolve(repoRoot, manifest.subset.path)),
  }
}

function createImageInputs(loaded: Awaited<ReturnType<typeof load69cUatSectionAdapter>>): {
  assets: VNextPdfImageAssetV1[]
  resources: FlowDocPdfRendererPilotImageResource[]
  probeResources: RestartProbeInput["imageResources"]
} {
  const sourceByDigest = new Map(loaded.selectedImages.map((image) => [image.sha256, image]))
  const assets = Object.values(loaded.bundle.mediaSnapshot.registry.images).map((image): VNextPdfImageAssetV1 => {
    const source = sourceByDigest.get(image.digest.value)
    requireFact(source != null, `UAT PDF image bytes are missing: ${image.id}`)
    requireFact(source.pixelWidth === image.intrinsic.widthPx && source.pixelHeight === image.intrinsic.heightPx,
      `UAT PDF image dimensions drifted: ${image.id}`)
    return {
      assetId: image.id,
      mediaType: image.mediaType,
      sha256: image.digest.value,
      pixelWidth: image.intrinsic.widthPx,
      pixelHeight: image.intrinsic.heightPx,
      bytesOwner: "backend",
      accessibility: { decorative: false, altText: "UAT screenshot evidence" },
    }
  })
  return {
    assets,
    resources: assets.map((asset) => ({
      assetId: asset.assetId,
      bytes: readFileSync(sourceByDigest.get(asset.sha256)!.absolutePath),
    })),
    probeResources: assets.map((asset) => ({
      assetId: asset.assetId,
      path: sourceByDigest.get(asset.sha256)!.absolutePath,
    })),
  }
}

export async function verify69cUatSectionMeasuredExport(input: {
  semanticDirectory: string
}): Promise<Verify69cUatMeasuredExportResultV1> {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const loaded = await load69cUatSectionAdapter(input)
  const resolution = resolveFlowDocUatSectionV1({
    contractVersion: 1,
    kind: "uat-section-resolution-request",
    adapterBundle: loaded.bundle,
    screenshotPlacementPolicy: FLOWDOC_UAT_SCREENSHOT_PLACEMENT_POLICY,
  })
  requireFact(resolution.status === "resolved", `69C section resolution blocked: ${JSON.stringify(resolution.issues)}`)
  const planResult = createFlowDocUatMeasuredExportPlanV1({ resolution: resolution.bundle })
  requireFact(planResult.status === "ready", `69C measured export plan blocked: ${JSON.stringify(planResult.issues)}`)
  const native = measureFlowDocUatPlanNativeV1({ repoRoot, plan: planResult.plan })
  const images = createImageInputs(loaded)
  const measured = createFlowDocUatMeasuredExportBundleV1({
    plan: planResult.plan,
    textEvidence: native.textEvidence,
    imageAssets: images.assets,
  })
  requireFact(measured.status === "measured", `69C measured composition blocked: ${JSON.stringify(measured.issues)}`)

  const tempDirectory = resolve(repoRoot, "tmp/pdfs/realdoc-d1")
  mkdirSync(tempDirectory, { recursive: true })
  const contractPath = resolve(tempDirectory, "69c-section-2-1-measured-contract.v1.json")
  writeFileSync(contractPath, `${JSON.stringify(measured.bundle.measuredDrawContract, null, 2)}\n`, "utf8")
  const manifestPaths = [
    buildSubset({
      repoRoot,
      contractPath,
      outputDirectory: tempDirectory,
      fontId: "ibm-plex-sans-thai-regular",
      sourcePath: "assets/fonts/IBM_Plex_Sans_Thai/IBMPlexSansThai-Regular.ttf",
      fileStem: "FlowDocLocalMeasuredDocument-Regular",
      styleName: "Regular",
      subsetPrefix: "FDLMRG",
      contractFingerprint: measured.bundle.measuredDrawContract.fingerprint,
    }),
    buildSubset({
      repoRoot,
      contractPath,
      outputDirectory: tempDirectory,
      fontId: "ibm-plex-sans-thai-bold",
      sourcePath: "assets/fonts/IBM_Plex_Sans_Thai/IBMPlexSansThai-Bold.ttf",
      fileStem: "FlowDocLocalMeasuredDocument-Bold",
      styleName: "Bold",
      subsetPrefix: "FDLMBD",
      contractFingerprint: measured.bundle.measuredDrawContract.fingerprint,
    }),
  ]
  const fontResources = manifestPaths.map((path) => fontResource(repoRoot, path))
  const sourceIdentity: VNextPdfExportSourceIdentityV1 = {
    documentId: loaded.bundle.instance.instanceId,
    documentRevision: loaded.bundle.instance.revision,
    documentFingerprint: measured.bundle.bundleFingerprint,
    sourcePackageId: `uat-section:${loaded.baseline.firstSlice.sectionNumber}`,
    sessionId: null,
  }
  const requestResult = createVNextPdfExportRequestV1({
    exportRequestId: "export:uat-69c-section-2-1:realdoc-d1",
    artifactId: "pdf:uat-69c-section-2-1:realdoc-d1",
    requestedAt: "2026-07-19T12:00:00.000Z",
    source: sourceIdentity,
    measuredDrawContract: measured.bundle.measuredDrawContract,
  })
  requireFact(requestResult.status === "ready", `69C PDF export request blocked: ${JSON.stringify(requestResult.issues)}`)
  const executionInput = {
    request: requestResult.request,
    currentSource: sourceIdentity,
    measuredDrawContract: measured.bundle.measuredDrawContract,
    fontResources,
    imageResources: images.resources,
    rendererMode: "local-measured-document" as const,
  }
  const first = executeFlowDocPdfExportHandoffV1(executionInput)
  const second = executeFlowDocPdfExportHandoffV1(executionInput)
  requireFact(first.status === "rendered", `69C local PDF rendering blocked: ${JSON.stringify(first.issues)}`)
  requireFact(second.status === "rendered"
    && Buffer.from(first.bytes).equals(Buffer.from(second.bytes))
    && first.receipt.receiptFingerprint === second.receipt.receiptFingerprint,
  "69C local PDF rendering is not deterministic")

  const cancelled = await renderFlowDocLocalMeasuredDocumentPdfControlled({
    proofId: "cancel:uat-69c-section-2-1:realdoc-d1",
    artifactId: "cancelled:uat-69c-section-2-1:realdoc-d1",
    contract: measured.bundle.measuredDrawContract,
    fontResources,
    imageResources: images.resources,
  }, {
    checkpointEveryPaintCommands: 1,
    control: { checkpoint: async () => ({ status: "cancel" }) },
  })
  requireFact(cancelled.status === "cancelled" && cancelled.bytes === null && cancelled.artifact === null,
    "69C local PDF cancellation returned artifact bytes")

  const restartProbePath = resolve(tempDirectory, "69c-section-2-1-restart-probe.v1.json")
  const restartInput: RestartProbeInput = {
    request: requestResult.request,
    currentSource: sourceIdentity,
    measuredDrawContract: measured.bundle.measuredDrawContract,
    fontManifests: manifestPaths,
    imageResources: images.probeResources,
  }
  writeFileSync(restartProbePath, `${JSON.stringify(restartInput)}\n`, "utf8")
  const manifests = manifestPaths.map((path) => readJson<SubsetManifest>(path))

  return {
    evidence: {
      evidenceVersion: 1,
      phaseId: "PDF-EXPORT-REALDOC-D.1",
      status: "accepted",
      sourceBaseline: {
        baselineId: loaded.baseline.baselineId,
        sourceBundleFingerprint: loaded.baseline.sourceBundleFingerprint,
        selectedImageCanonicalDigest: loaded.baseline.firstSlice.screenshotCanonicalDigest,
      },
      sources: {
        adapterBundleFingerprint: loaded.bundle.bundleFingerprint,
        importedTextNormalizationFingerprint: loaded.bundle.textNormalization.normalizationFingerprint,
        resolutionBundleFingerprint: resolution.bundle.bundleFingerprint,
        measuredPlanFingerprint: planResult.plan.planFingerprint,
        measuredBundleFingerprint: measured.bundle.bundleFingerprint,
      },
      nativeMeasurement: native.summary,
      importedTextNormalization: {
        profileId: loaded.bundle.textNormalization.profileId,
        ...loaded.bundle.textNormalization.summary,
      },
      composition: {
        ...measured.bundle.summary,
        resourceEnvelope: measured.bundle.resourceEnvelope,
        requirementsTable: measured.bundle.tableEvidence.requirements,
        screenshotsTable: measured.bundle.tableEvidence.screenshots,
      },
      renderer: {
        mode: first.renderer.mode,
        artifact: first.renderer.artifact,
        receipt: first.receipt,
        fontSubsets: manifests.map((manifest) => ({
          fontId: manifest.fontId,
          subsetId: manifest.subsetId,
          sourceByteLength: manifest.source.bytes,
          subsetByteLength: manifest.subset.bytes,
          subsetSha256: manifest.subset.sha256,
          retainedGlyphCount: manifest.subset.retainedGlyphIds.length,
        })),
      },
      determinism: {
        sameProcessByteEqual: true,
        sameProcessReceiptEqual: true,
        sha256: first.receipt.artifact.sha256,
      },
      cancellation: {
        status: cancelled.status,
        checkpoint: cancelled.checkpoint,
        bytesReturned: false,
        artifactReturned: false,
      },
      executionBoundary: {
        actualPdfBytesReturned: true,
        pdfBytesRetainedInEvidence: false,
        sourceContentRetainedInEvidence: false,
        importedLayoutWrapsRemovedBeforeMeasurement: true,
        nativeThaiShapingExecuted: true,
        nativeThaiSegmentationExecuted: true,
        coreTablePaginationExecuted: true,
        coreRendererProjectionExecuted: true,
        localRendererExecuted: true,
        backendStorageWrites: false,
        productionBinding: false,
      },
      nextPhase: "PDF-EXPORT-REALDOC-E Editor workflow and local artifact lifecycle",
    },
    pdfBytes: first.bytes,
    restartProbePath,
    restartExpected: {
      sha256: first.receipt.artifact.sha256,
      byteLength: first.receipt.artifact.byteLength,
      pageCount: first.receipt.artifact.pageCount,
      receiptFingerprint: first.receipt.receiptFingerprint,
    },
  }
}

export async function render69cUatRestartProbe(input: { probePath: string }): Promise<{
  sha256: string
  byteLength: number
  pageCount: number
  receiptFingerprint: string
}> {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const probe = readJson<RestartProbeInput>(input.probePath)
  const rendered = executeFlowDocPdfExportHandoffV1({
    request: probe.request,
    currentSource: probe.currentSource,
    measuredDrawContract: probe.measuredDrawContract,
    fontResources: probe.fontManifests.map((path) => fontResource(repoRoot, path)),
    imageResources: probe.imageResources.map((resource) => ({
      assetId: resource.assetId,
      bytes: readFileSync(resource.path),
    })),
    rendererMode: "local-measured-document",
  })
  requireFact(rendered.status === "rendered", `69C restart PDF rendering blocked: ${JSON.stringify(rendered.issues)}`)
  requireFact(sha256(rendered.bytes) === rendered.receipt.artifact.sha256, "69C restart byte digest drifted")
  return {
    sha256: rendered.receipt.artifact.sha256,
    byteLength: rendered.receipt.artifact.byteLength,
    pageCount: rendered.receipt.artifact.pageCount,
    receiptFingerprint: rendered.receipt.receiptFingerprint,
  }
}
