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
  const uat = await server.ssrLoadModule("/packages/uat-realdoc/src/index.ts")
  const loaded = await sourceRuntime.load69cUatSectionAdapter({ semanticDirectory })
  const dataContract = uat.createFlowDocUatGenerationDataContractV1()
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
    },
  }))
} finally {
  await server.close()
}
