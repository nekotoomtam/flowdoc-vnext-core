import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { createServer } from "vite"

const semanticDirectory = process.argv[2]
if (semanticDirectory == null) {
  throw new Error("usage: node prepare-69c-docgen-local-input.mjs <semantic-directory>")
}
const repoRoot = resolve(import.meta.dirname, "../../..")
const server = await createServer({
  root: repoRoot,
  appType: "custom",
  logLevel: "error",
  resolve: { alias: { "@flowdoc/vnext-core": resolve(repoRoot, "src/index.ts") } },
  server: { middlewareMode: true, hmr: false },
})

try {
  const sourceRuntime = await server.ssrLoadModule(
    "/packages/uat-realdoc/scripts/verify-69c-section-adapter-runtime.ts",
  )
  const core = await server.ssrLoadModule("/src/index.ts")
  const uat = await server.ssrLoadModule("/packages/uat-realdoc/src/index.ts")
  const loaded = await sourceRuntime.load69cUatSectionAdapter({ semanticDirectory })
  const dataContract = uat.createFlowDocUatGenerationDataContractV1()
  const mappingProfile = uat.createFlowDocUatGenerationMappingProfileV1()
  const projection = core.projectVNextPublishedStructureTestInputV1({
    contractVersion: 1,
    kind: "published-structure-test-input-projection-request",
    structure: {
      owner: uat.flowDocUatPublishedStructureRefV1(),
      structureFingerprint: loaded.structure.structureFingerprint,
      document: loaded.structure.starterDocument,
    },
    dataContract,
    tables: [loaded.structure.tables.requirements, loaded.structure.tables.screenshots],
  })
  if (projection.status !== "ready") throw new Error("69C Published Preview projection blocked")
  const { instance: _instance, ...adaptedPayload } = loaded.adapterInput
  const adaptedPayloadText = JSON.stringify(adaptedPayload)
  const sourceByDigest = new Map(loaded.selectedImages.map((image) => [image.sha256, image]))
  const trustedAssets = Object.values(loaded.bundle.mediaSnapshot.registry.images).map((definition) => {
    const source = sourceByDigest.get(definition.digest.value)
    if (source == null) throw new Error(`69C trusted image bytes are missing: ${definition.id}`)
    return {
      definition,
      bytesBase64: readFileSync(source.absolutePath).toString("base64"),
    }
  })
  process.stdout.write(JSON.stringify({
    dataContract,
    mappingProfile,
    projection,
    adaptedPayloadText,
    request: {
      contractVersion: 1,
      kind: "docgen-local-admission-request",
      structure: uat.flowDocUatPublishedStructureRefV1(),
      assets: loaded.bundle.mediaSnapshot.registry,
      input: {
        kind: "canonical-data",
        data: loaded.bundle.dataSnapshot.data,
        collections: loaded.bundle.collectionSnapshot.collections,
      },
    },
    trustedAssets,
    evidence: {
      sourceBundleFingerprint: loaded.baseline.sourceBundleFingerprint,
      adapterBundleFingerprint: loaded.bundle.bundleFingerprint,
      selectedImageCanonicalDigest: loaded.baseline.firstSlice.screenshotCanonicalDigest,
      requirementCount: loaded.bundle.summary.requirementCount,
      screenshotCount: loaded.bundle.summary.screenshotCount,
      adaptedPayloadByteLength: Buffer.byteLength(adaptedPayloadText, "utf8"),
      projectionFingerprint: projection.projectionFingerprint,
      mappingProfileFingerprint: mappingProfile.profileFingerprint,
    },
  }))
} finally {
  await server.close()
}
