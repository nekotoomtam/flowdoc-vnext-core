import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
  VNEXT_IMAGE_SOURCE_CONTRACT,
  VNEXT_IMAGE_SOURCE_CONTRACT_VERSION,
  VNEXT_TEXT_BLOCK_V1_VERSION_POLICY,
} from "../src/index.js"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

describe("Image source contract", () => {
  it("publishes JSON-safe target version and ownership facts", () => {
    expect(VNEXT_IMAGE_SOURCE_CONTRACT_VERSION).toBe(1)
    expect(VNEXT_IMAGE_SOURCE_CONTRACT).toMatchObject({
      status: "decision-only",
      contractVersion: 1,
      targetVersions: {
        packageVersion: 3,
        documentVersion: 4,
        assetRegistryVersion: 1,
        fieldRegistryVersion: 1,
        dataSnapshotVersion: 2,
      },
      sourceKinds: ["asset-ref", "image-field-ref"],
      placementTypes: ["inline-image", "image"],
      assetOwnership: {
        manifestOwner: "package",
        bytesOwner: "backend",
        locatorOwner: "backend",
        identity: "immutable-opaque-asset-id",
        digest: "sha256",
        canonicalMediaTypes: ["image/png", "image/jpeg"],
        packageStoresBytes: false,
        packageStoresLocator: false,
      },
    })
    expect(JSON.parse(JSON.stringify(VNEXT_IMAGE_SOURCE_CONTRACT))).toEqual(VNEXT_IMAGE_SOURCE_CONTRACT)
  })

  it("locks bounded authored placement and lifecycle decisions", () => {
    expect(VNEXT_IMAGE_SOURCE_CONTRACT.placement).toEqual({
      accessibility: "described-or-decorative",
      frame: "required-width-and-height",
      fitModes: ["contain", "cover"],
      crop: "optional-normalized-source-rectangle",
      inlineAtomicSlotCount: 1,
      floatingWrap: false,
    })
    expect(VNEXT_IMAGE_SOURCE_CONTRACT.lifecycle).toEqual({
      uploadStateOwner: "backend",
      cropOwner: "authored-placement",
      destructiveTransformCreatesNewAsset: true,
      referencedAssetDeletion: "blocked",
      blobGarbageCollectionOwner: "backend-retention-policy",
    })
  })

  it("resolves the target version policy to package v3 and document v4", () => {
    expect(VNEXT_TEXT_BLOCK_V1_VERSION_POLICY.target).toEqual({
      packageVersion: 3,
      documentVersion: 4,
      packageVersionCondition: "image-registry-requires-package-envelope-change",
    })
    expect(VNEXT_TEXT_BLOCK_V1_VERSION_POLICY.activationBlockers).not.toContain("package-v3-parser")
    expect(VNEXT_TEXT_BLOCK_V1_VERSION_POLICY.activationBlockers).not.toContain("package-v3-image-registry-schema")
    expect(VNEXT_TEXT_BLOCK_V1_VERSION_POLICY.activationBlockers).not.toContain("document-v4-full-schema")
    expect(VNEXT_TEXT_BLOCK_V1_VERSION_POLICY.activationBlockers).not.toContain("document-v4-schema")
    expect(VNEXT_TEXT_BLOCK_V1_VERSION_POLICY.activationBlockers).not.toContain("image-source-contract")
    expect(VNEXT_TEXT_BLOCK_V1_VERSION_POLICY.activationBlockers).not.toContain("v3-to-v4-migration-plan")
  })

  it("keeps image forms absent from the active package v2/document v3 schemas", () => {
    const documentSource = readText("src/schema/document.ts")
    const packageSource = readText("src/persistence/package.ts")

    expect(documentSource).not.toContain('z.literal("inline-image")')
    expect(documentSource).not.toContain('type: z.literal("image")')
    expect(packageSource).not.toContain("AssetRegistrySchema")
    expect(packageSource).not.toContain("image-asset-ref")
    expect(packageSource).toContain('version: z.literal(1)')
  })

  it("documents payloads, ownership, activation gates, and navigation", () => {
    const contract = readText("docs/IMAGE_SOURCE_CONTRACT.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")

    for (const section of [
      "## Truth Layers",
      "## Asset Manifest",
      "## Storage And Portability",
      "## Source Union",
      "## Image Field Values",
      "## Shared Placement Facts",
      "## Inline Image Payload",
      "## Block Image Payload",
      "## Resolution And Measurement",
      "## Upload And Mutation Lifecycle",
      "## Package Version Decision",
      "## Activation Gates",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) {
      expect(contract).toContain(section)
    }

    expect(contract).toContain("Authored nodes never persist URLs")
    expect(contract).toContain("caption remains an adjacent text-block")
    expect(contract).toContain("without floating, overlap, absolute x/y placement")
    expect(contract).toContain("Existing package v2 serializers would discard")
    expect(readme).toContain("docs/IMAGE_SOURCE_CONTRACT.md")
    expect(ledger).toContain("| 252 | Image source contract | done |")
    expect(ledger).toContain("## Phase 252 Image Source Contract")
  })
})
