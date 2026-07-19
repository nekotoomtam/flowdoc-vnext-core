import { createHash } from "node:crypto"
import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import {
  VNextInstanceDataSnapshotV1Schema,
  VNextInstanceMediaSnapshotV1Schema,
  VNextTableCollectionSnapshotV1Schema,
} from "@flowdoc/vnext-core"
import {
  adaptFlowDocUatSemanticNoPagesSectionV1,
  createFlowDocUatStructureDefinitionV1,
  flowDocUatPublishedStructureRefV1,
  type FlowDocUatImageResourceInputV1,
  type FlowDocUatSectionDataBundleV1,
  type FlowDocUatStructureDefinitionV1,
} from "../src/index.js"

export interface SourceBaseline {
  baselineId: string
  sourceBundleFingerprint: string
  semanticSource: {
    rootFiles: Array<{ path: string; byteLength: number; sha256: string }>
    images: {
      fileCount: number
      totalByteLength: number
      totalPixelCount: number
      canonicalDigest: string
    }
  }
  firstSlice: {
    sectionNumber: string
    requirementCount: number
    featureTextCharacterCount: number
    screenshotCount: number
    screenshotByteLength: number
    screenshotPixelCount: number
    screenshotCanonicalDigest: string
  }
}

export interface CollectedImage extends FlowDocUatImageResourceInputV1 {
  absolutePath: string
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex")
}

function imageDigest(images: readonly CollectedImage[]): string {
  const lines = images.map((image) => (
    `${image.sourcePath}\t${image.byteLength}\t${image.pixelWidth}x${image.pixelHeight}\t${image.sha256}\n`
  )).join("")
  return sha256(Buffer.from(lines, "utf8"))
}

function collectImages(semanticDirectory: string): CollectedImage[] {
  const imageDirectory = resolve(semanticDirectory, "images")
  const entries = readdirSync(imageDirectory, { withFileTypes: true })
  const unsupported = entries.filter((entry) => !entry.isFile() || !entry.name.toLowerCase().endsWith(".png"))
  if (unsupported.length > 0) {
    throw new Error(`images directory contains unsupported entries: ${unsupported.map((entry) => entry.name).join(", ")}`)
  }
  return entries
    .sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0)
    .map((entry) => {
      const absolutePath = resolve(imageDirectory, entry.name)
      const bytes = readFileSync(absolutePath)
      const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      if (
        bytes.byteLength < 24
        || !bytes.subarray(0, 8).equals(signature)
        || bytes.subarray(12, 16).toString("ascii") !== "IHDR"
      ) {
        throw new Error(`${entry.name} is not a supported PNG`)
      }
      return {
        absolutePath,
        sourcePath: `images/${entry.name}`,
        mediaType: "image/png" as const,
        byteLength: bytes.byteLength,
        sha256: sha256(bytes),
        pixelWidth: bytes.readUInt32BE(16),
        pixelHeight: bytes.readUInt32BE(20),
      }
    })
}

function requireEqual(label: string, actual: unknown, expected: unknown): void {
  if (actual !== expected) throw new Error(`${label} mismatch: expected ${expected}, received ${actual}`)
}

export interface Loaded69cUatSectionAdapter {
  baseline: SourceBaseline
  semanticFile: { path: string; byteLength: number; sha256: string }
  selectedImages: CollectedImage[]
  structure: FlowDocUatStructureDefinitionV1
  bundle: FlowDocUatSectionDataBundleV1
  canonicalInputs: {
    dataSnapshot: boolean
    collectionSnapshot: boolean
    mediaSnapshot: boolean
  }
}

export async function load69cUatSectionAdapter(input: {
  semanticDirectory: string
}): Promise<Loaded69cUatSectionAdapter> {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const baseline = JSON.parse(readFileSync(resolve(
    repoRoot,
    "fixtures/pdf-export-realdoc-69c-source-baseline.v1.json",
  ), "utf8")) as SourceBaseline
  const semanticFile = baseline.semanticSource.rootFiles.find(
    (file) => file.path === "document_semantic_no_pages.json",
  )
  if (semanticFile == null) throw new Error("source baseline is missing the semantic map identity")
  const semanticPath = resolve(input.semanticDirectory, semanticFile.path)
  const semanticBytes = readFileSync(semanticPath)
  requireEqual("semantic map byte length", semanticBytes.byteLength, semanticFile.byteLength)
  requireEqual("semantic map sha256", sha256(semanticBytes), semanticFile.sha256)

  const allImages = collectImages(input.semanticDirectory)
  requireEqual("image count", allImages.length, baseline.semanticSource.images.fileCount)
  requireEqual(
    "image byte length",
    allImages.reduce((sum, image) => sum + image.byteLength, 0),
    baseline.semanticSource.images.totalByteLength,
  )
  requireEqual(
    "image pixel count",
    allImages.reduce((sum, image) => sum + image.pixelWidth * image.pixelHeight, 0),
    baseline.semanticSource.images.totalPixelCount,
  )
  requireEqual("image digest", imageDigest(allImages), baseline.semanticSource.images.canonicalDigest)

  const semanticDocument = JSON.parse(semanticBytes.toString("utf8")) as any
  const section = semanticDocument.modules
    .flatMap((module: any) => module.sections)
    .find((candidate: any) => candidate.section_number === baseline.firstSlice.sectionNumber)
  if (section == null) throw new Error("section 2.1 is missing")
  const selectedPaths = new Set(section.screenshots.map((screenshot: any) => screenshot.file))
  const selectedImages = allImages.filter((image) => selectedPaths.has(image.sourcePath))
  requireEqual("selected image count", selectedImages.length, baseline.firstSlice.screenshotCount)
  requireEqual(
    "selected image byte length",
    selectedImages.reduce((sum, image) => sum + image.byteLength, 0),
    baseline.firstSlice.screenshotByteLength,
  )
  requireEqual(
    "selected image pixel count",
    selectedImages.reduce((sum, image) => sum + image.pixelWidth * image.pixelHeight, 0),
    baseline.firstSlice.screenshotPixelCount,
  )
  requireEqual("selected image digest", imageDigest(selectedImages), baseline.firstSlice.screenshotCanonicalDigest)

  const structure = createFlowDocUatStructureDefinitionV1()
  const result = adaptFlowDocUatSemanticNoPagesSectionV1({
    source: {
      sourceSetId: "uat-69c-2026-07-17",
      sourceBundleFingerprint: baseline.sourceBundleFingerprint,
      semanticMap: {
        fileName: semanticFile.path,
        byteLength: semanticBytes.byteLength,
        sha256: semanticFile.sha256,
      },
    },
    semanticDocument,
    sectionNumber: baseline.firstSlice.sectionNumber,
    instance: {
      contractVersion: 1,
      kind: "document-instance",
      instanceId: "instance-uat-69c-section-2-1-local",
      revision: 0,
      structureVersion: flowDocUatPublishedStructureRefV1(),
    },
    imageResources: selectedImages.map(({ absolutePath: _absolutePath, ...resource }) => resource),
  })
  if (result.status !== "ready-with-warnings") {
    throw new Error(`69C section adapter blocked: ${JSON.stringify(result.issues)}`)
  }
  const bundle = result.bundle
  requireEqual("requirement count", bundle.summary.requirementCount, baseline.firstSlice.requirementCount)
  requireEqual("feature text characters", bundle.summary.featureTextCharacterCount, baseline.firstSlice.featureTextCharacterCount)
  requireEqual("screenshot count", bundle.summary.screenshotCount, baseline.firstSlice.screenshotCount)
  requireEqual("source image bytes", bundle.summary.sourceImageByteLength, baseline.firstSlice.screenshotByteLength)
  requireEqual("source image pixels", bundle.summary.sourceImagePixelCount, baseline.firstSlice.screenshotPixelCount)

  const canonicalInputs = {
    dataSnapshot: VNextInstanceDataSnapshotV1Schema.safeParse(bundle.dataSnapshot).success,
    collectionSnapshot: VNextTableCollectionSnapshotV1Schema.safeParse(bundle.collectionSnapshot).success,
    mediaSnapshot: VNextInstanceMediaSnapshotV1Schema.safeParse(bundle.mediaSnapshot).success,
  }
  if (!Object.values(canonicalInputs).every(Boolean)) throw new Error("adapter output failed canonical snapshot schemas")

  return { baseline, semanticFile, selectedImages, structure, bundle, canonicalInputs }
}

export async function verify69cUatSectionAdapter(input: {
  semanticDirectory: string
}): Promise<Record<string, unknown>> {
  const { baseline, semanticFile, structure, bundle, canonicalInputs } = await load69cUatSectionAdapter(input)

  return {
    evidenceVersion: 1,
    phaseId: "PDF-EXPORT-REALDOC-B",
    status: "accepted",
    sourceBaseline: {
      baselineId: baseline.baselineId,
      sourceBundleFingerprint: baseline.sourceBundleFingerprint,
      semanticMapSha256: semanticFile.sha256,
      fullImageSetCanonicalDigest: baseline.semanticSource.images.canonicalDigest,
      selectedImageCanonicalDigest: baseline.firstSlice.screenshotCanonicalDigest,
    },
    structure: {
      structureId: structure.structure.structureId,
      structureVersionId: structure.structure.structureVersionId,
      versionOrdinal: structure.structure.versionOrdinal,
      structureFingerprint: structure.structureFingerprint,
      summary: structure.summary,
      regionKinds: structure.regions.map((region) => region.kind),
    },
    adapter: {
      adapterId: bundle.adapterId,
      bundleFingerprint: bundle.bundleFingerprint,
      selectedSectionNumber: bundle.sourceSet.selectedSectionNumber,
      summary: bundle.summary,
      textNormalization: {
        profileId: bundle.textNormalization.profileId,
        normalizationFingerprint: bundle.textNormalization.normalizationFingerprint,
        summary: bundle.textNormalization.summary,
      },
      warningCodes: bundle.warnings.map((warning) => warning.code),
      linkGranularity: bundle.semantic.relations.linkGranularity,
      screenshotPlacement: bundle.semantic.relations.screenshotPlacement,
    },
    canonicalInputs,
    execution: bundle.execution,
    contracts: {
      sourceContentRetainedInEvidence: false,
      sourceSpecificSchemaAddedToCore: false,
      importedLayoutWrapsRemovedBeforeResolution: true,
      canonicalCoreNodeTypesOnly: structure.contracts.canonicalCoreNodeTypesOnly,
      instanceIdentityProvidedByVerifier: true,
      instanceAllocatedByAdapter: false,
      materializationExecuted: false,
      paginationExecuted: false,
      rendererExecuted: false,
      artifactProduced: false,
      productionBinding: false,
    },
    nextPhase: "PDF-EXPORT-REALDOC-C section 2.1 materialization and resolved projection",
  }
}
