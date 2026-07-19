import { resolve } from "node:path"
import { createServer } from "vite"

const repoRoot = resolve(import.meta.dirname, "../../..")

async function stdin() {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString("utf8")
}

const server = await createServer({
  root: repoRoot,
  appType: "custom",
  logLevel: "error",
  resolve: { alias: { "@flowdoc/vnext-core": resolve(repoRoot, "src/index.ts") } },
  server: { middlewareMode: true, hmr: false },
})

try {
  const runtime = await server.ssrLoadModule("/packages/uat-realdoc/local-runtime/index.ts")
  const value = JSON.parse(await stdin())
  const result = runtime.createFlowDocUatLocalArtifactMaterializationV1({
    repoRoot,
    canonicalInput: value.canonicalInput,
    canonicalInputFingerprint: value.canonicalInputFingerprint,
    publishedStructureFingerprint: value.publishedStructureFingerprint,
    assets: value.assets.map((asset) => ({
      assetId: asset.assetId,
      bytes: new Uint8Array(Buffer.from(asset.bytesBase64, "base64")),
    })),
  })
  if (result.status === "blocked") {
    process.stdout.write(JSON.stringify(result))
  } else {
    process.stdout.write(JSON.stringify({
      ...result,
      fontResources: result.fontResources.map((resource) => ({
        fontId: resource.fontId,
        subsetId: resource.subsetId,
        subsetPrefix: resource.subsetPrefix,
        postScriptName: resource.postScriptName,
        subsetSha256: resource.subsetSha256,
        sourceBytesBase64: Buffer.from(resource.sourceBytes).toString("base64"),
        subsetBytesBase64: Buffer.from(resource.subsetBytes).toString("base64"),
      })),
      imageResources: result.imageResources.map((resource) => ({
        assetId: resource.assetId,
        bytesBase64: Buffer.from(resource.bytes).toString("base64"),
      })),
    }))
  }
} finally {
  await server.close()
}
