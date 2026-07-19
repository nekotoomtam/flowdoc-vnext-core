import { createHash } from "node:crypto"
import { spawnSync } from "node:child_process"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import type {
  VNextPdfImageAssetV1,
  VNextPublishedStructureCanonicalSnapshotInputV1,
} from "@flowdoc/vnext-core"
import {
  createFlowDocUatMeasuredExportBundleV1,
  createFlowDocUatMeasuredExportPlanV1,
  FLOWDOC_UAT_SCREENSHOT_PLACEMENT_POLICY,
  resolveFlowDocUatCanonicalGenerationV1,
} from "../src/index.js"
import { measureFlowDocUatPlanNativeV1 } from "../scripts/uat-native-measurement-runtime.js"

export interface FlowDocUatLocalArtifactAssetBytesV1 {
  assetId: string
  bytes: Uint8Array
}

export interface FlowDocUatLocalArtifactFontResourceV1 {
  fontId: string
  subsetId: string
  subsetPrefix: string
  postScriptName: string
  subsetSha256: string
  sourceBytes: Uint8Array
  subsetBytes: Uint8Array
}

export interface FlowDocUatLocalArtifactImageResourceV1 {
  assetId: string
  bytes: Uint8Array
}

export type FlowDocUatLocalArtifactMaterializationResultV1 =
  | {
      status: "ready"
      materializationFingerprint: string
      resolutionFingerprint: string
      measuredPlanFingerprint: string
      measuredBundleFingerprint: string
      artifactInputFingerprint: string
      measuredDrawContract: Extract<
        ReturnType<typeof createFlowDocUatMeasuredExportBundleV1>,
        { status: "measured" }
      >["bundle"]["measuredDrawContract"]
      fontResources: FlowDocUatLocalArtifactFontResourceV1[]
      imageResources: FlowDocUatLocalArtifactImageResourceV1[]
      summary: {
        pageCount: number
        paintCommandCount: number
        glyphCount: number
        imageAssetCount: number
      }
      issues: []
    }
  | {
      status: "blocked"
      materializationFingerprint: null
      resolutionFingerprint: null
      measuredPlanFingerprint: null
      measuredBundleFingerprint: null
      artifactInputFingerprint: null
      measuredDrawContract: null
      fontResources: null
      imageResources: null
      summary: null
      issues: Array<{ code: string; path: string; message: string; severity: "error" }>
    }

interface SubsetManifestV1 {
  subsetId: string
  fontId: string
  postScriptName: string
  subsetPrefix: string
  source: { path: string; sha256: string }
  subset: { path: string; sha256: string }
}

const FONT_INPUTS = [
  {
    fontId: "ibm-plex-sans-thai-regular",
    sourcePath: "assets/fonts/IBM_Plex_Sans_Thai/IBMPlexSansThai-Regular.ttf",
    fileStem: "FlowDocLocalMeasuredDocument-Regular",
    styleName: "Regular",
    subsetPrefix: "FDLMRG",
  },
  {
    fontId: "ibm-plex-sans-thai-bold",
    sourcePath: "assets/fonts/IBM_Plex_Sans_Thai/IBMPlexSansThai-Bold.ttf",
    fileStem: "FlowDocLocalMeasuredDocument-Bold",
    styleName: "Bold",
    subsetPrefix: "FDLMBD",
  },
] as const

function sha256Bytes(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex")
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue)
  if (value == null || typeof value !== "object") return value
  return Object.fromEntries(Object.keys(value as Record<string, unknown>).sort().map((key) => [
    key,
    canonicalValue((value as Record<string, unknown>)[key]),
  ]))
}

function fingerprint(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(canonicalValue(value)), "utf8").digest("hex")}`
}

function buildFontResources(input: {
  repoRoot: string
  measuredDrawContract: Extract<
    ReturnType<typeof createFlowDocUatMeasuredExportBundleV1>,
    { status: "measured" }
  >["bundle"]["measuredDrawContract"]
}): FlowDocUatLocalArtifactFontResourceV1[] {
  const parent = resolve(input.repoRoot, "tmp/pdf-export-realdoc-e4")
  mkdirSync(parent, { recursive: true })
  const tempDirectory = mkdtempSync(resolve(parent, "materialization-"))
  try {
    const contractPath = resolve(tempDirectory, "measured-contract.v1.json")
    writeFileSync(contractPath, `${JSON.stringify(input.measuredDrawContract)}\n`, "utf8")
    return FONT_INPUTS.map((font) => {
      const subsetPath = resolve(tempDirectory, `${font.fileStem}.ttf`)
      const manifestPath = resolve(tempDirectory, `${font.fileStem}.manifest.v1.json`)
      const build = spawnSync("python", [
        resolve(input.repoRoot, "packages/pdf-renderer-pilot/scripts/build-canonical-report-font-subset.py"),
        "--request", contractPath,
        "--font-id", font.fontId,
        "--source", font.sourcePath,
        "--subset", subsetPath,
        "--manifest", manifestPath,
        "--phase-id", "PDF-EXPORT-REALDOC-E.4",
        "--subset-id", `flowdoc-local-measured-${font.styleName.toLowerCase()}-${input.measuredDrawContract.fingerprint.slice(7, 23)}`,
        "--family-name", "FlowDoc Local Measured Document",
        "--postscript-name", font.fileStem,
        "--subset-prefix", font.subsetPrefix,
        "--style-name", font.styleName,
        "--font-specific-glyphs",
      ], {
        cwd: input.repoRoot,
        encoding: "utf8",
        maxBuffer: 4 * 1024 * 1024,
        timeout: 120_000,
        windowsHide: true,
      })
      if (build.status !== 0) {
        throw new Error(`font subset build failed for ${font.fontId}: ${build.stderr || build.stdout}`)
      }
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as SubsetManifestV1
      const sourceBytes = readFileSync(resolve(input.repoRoot, manifest.source.path))
      const subsetBytes = readFileSync(resolve(input.repoRoot, manifest.subset.path))
      if (
        manifest.fontId !== font.fontId
        || sha256Bytes(sourceBytes) !== manifest.source.sha256
        || sha256Bytes(subsetBytes) !== manifest.subset.sha256
      ) throw new Error(`font subset identity drifted for ${font.fontId}`)
      return {
        fontId: manifest.fontId,
        subsetId: manifest.subsetId,
        subsetPrefix: manifest.subsetPrefix,
        postScriptName: manifest.postScriptName,
        subsetSha256: manifest.subset.sha256,
        sourceBytes: new Uint8Array(sourceBytes),
        subsetBytes: new Uint8Array(subsetBytes),
      }
    })
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true })
  }
}

function imageInputs(input: {
  canonicalInput: VNextPublishedStructureCanonicalSnapshotInputV1
  assets: readonly FlowDocUatLocalArtifactAssetBytesV1[]
}): {
  imageAssets: VNextPdfImageAssetV1[]
  imageResources: FlowDocUatLocalArtifactImageResourceV1[]
} {
  const bytesById = new Map<string, Uint8Array>()
  input.assets.forEach((asset) => {
    if (bytesById.has(asset.assetId)) throw new Error(`duplicate image bytes: ${asset.assetId}`)
    bytesById.set(asset.assetId, new Uint8Array(asset.bytes))
  })
  const definitions = Object.values(input.canonicalInput.mediaSnapshot.registry.images)
  if (definitions.length !== bytesById.size) throw new Error("image byte set does not match the canonical media registry")
  const imageAssets = definitions.map((definition): VNextPdfImageAssetV1 => {
    const bytes = bytesById.get(definition.id)
    if (
      bytes == null
      || bytes.byteLength !== definition.byteLength
      || sha256Bytes(bytes) !== definition.digest.value
    ) throw new Error(`image bytes do not match canonical media identity: ${definition.id}`)
    return {
      assetId: definition.id,
      mediaType: definition.mediaType,
      sha256: definition.digest.value,
      pixelWidth: definition.intrinsic.widthPx,
      pixelHeight: definition.intrinsic.heightPx,
      bytesOwner: "backend",
      accessibility: { decorative: false, altText: "Generated document image" },
    }
  })
  return {
    imageAssets,
    imageResources: imageAssets.map((asset) => ({
      assetId: asset.assetId,
      bytes: new Uint8Array(bytesById.get(asset.assetId)!),
    })),
  }
}

export function createFlowDocUatLocalArtifactMaterializationV1(input: {
  repoRoot?: string
  canonicalInput: VNextPublishedStructureCanonicalSnapshotInputV1
  canonicalInputFingerprint: string
  publishedStructureFingerprint: string
  assets: readonly FlowDocUatLocalArtifactAssetBytesV1[]
}): FlowDocUatLocalArtifactMaterializationResultV1 {
  try {
    const repoRoot = resolve(input.repoRoot ?? resolve(import.meta.dirname, "../../.."))
    const resolution = resolveFlowDocUatCanonicalGenerationV1({
      contractVersion: 1,
      kind: "uat-canonical-generation-resolution-request",
      canonicalInput: input.canonicalInput,
      canonicalInputFingerprint: input.canonicalInputFingerprint,
      publishedStructureFingerprint: input.publishedStructureFingerprint,
      screenshotPlacementPolicy: FLOWDOC_UAT_SCREENSHOT_PLACEMENT_POLICY,
    })
    if (resolution.status !== "resolved") throw new Error(`canonical UAT resolution blocked: ${JSON.stringify(resolution.issues)}`)
    const plan = createFlowDocUatMeasuredExportPlanV1({ resolution: resolution.bundle })
    if (plan.status !== "ready") throw new Error(`UAT measured plan blocked: ${JSON.stringify(plan.issues)}`)
    const native = measureFlowDocUatPlanNativeV1({ repoRoot, plan: plan.plan })
    const images = imageInputs(input)
    const measured = createFlowDocUatMeasuredExportBundleV1({
      plan: plan.plan,
      textEvidence: native.textEvidence,
      imageAssets: images.imageAssets,
    })
    if (measured.status !== "measured") throw new Error(`UAT measured artifact blocked: ${JSON.stringify(measured.issues)}`)
    const fontResources = buildFontResources({
      repoRoot,
      measuredDrawContract: measured.bundle.measuredDrawContract,
    })
    const artifactInputFingerprint = fingerprint({
      canonicalInputFingerprint: input.canonicalInputFingerprint,
      resolutionFingerprint: resolution.bundle.bundleFingerprint,
      measuredPlanFingerprint: plan.plan.planFingerprint,
      measuredBundleFingerprint: measured.bundle.bundleFingerprint,
      measuredContractFingerprint: measured.bundle.measuredDrawContract.fingerprint,
      fontResources: fontResources.map((font) => ({
        fontId: font.fontId,
        subsetId: font.subsetId,
        subsetSha256: font.subsetSha256,
      })),
      imageResources: images.imageAssets.map((image) => ({
        assetId: image.assetId,
        sha256: image.sha256,
      })),
    })
    return {
      status: "ready",
      materializationFingerprint: fingerprint(resolution.bundle.instanceMaterialization),
      resolutionFingerprint: resolution.bundle.bundleFingerprint,
      measuredPlanFingerprint: plan.plan.planFingerprint,
      measuredBundleFingerprint: measured.bundle.bundleFingerprint,
      artifactInputFingerprint,
      measuredDrawContract: measured.bundle.measuredDrawContract,
      fontResources,
      imageResources: images.imageResources,
      summary: {
        pageCount: measured.bundle.resourceEnvelope.pageCount,
        paintCommandCount: measured.bundle.resourceEnvelope.paintCommandCount,
        glyphCount: measured.bundle.resourceEnvelope.glyphCount,
        imageAssetCount: measured.bundle.resourceEnvelope.imageAssetCount,
      },
      issues: [],
    }
  } catch (error) {
    return {
      status: "blocked",
      materializationFingerprint: null,
      resolutionFingerprint: null,
      measuredPlanFingerprint: null,
      measuredBundleFingerprint: null,
      artifactInputFingerprint: null,
      measuredDrawContract: null,
      fontResources: null,
      imageResources: null,
      summary: null,
      issues: [{
        code: "uat-local-artifact-materialization-blocked",
        path: "materialization",
        message: error instanceof Error ? error.message : "UAT local artifact materialization blocked",
        severity: "error",
      }],
    }
  }
}

export { measureFlowDocUatPlanNativeV1 } from "../scripts/uat-native-measurement-runtime.js"
