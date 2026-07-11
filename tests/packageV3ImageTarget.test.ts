import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  DataSnapshotV2Schema,
  ImageAssetRegistryV1Schema,
  VNEXT_PACKAGE_V3_IMAGE_TARGET_SOURCE,
  parseFlowDocPackageV2DocumentVNext,
  safeParseFlowDocPackageV2DocumentVNext,
  validateVNextPackageV3ImageTarget,
  type DataSnapshotV2,
  type FieldRegistry,
  type ImageAssetRegistryV1,
} from "../src/index.js"

const DIGEST = "a".repeat(64)

function assets(): ImageAssetRegistryV1 {
  return ImageAssetRegistryV1Schema.parse({
    version: 1,
    images: {
      "asset-logo": {
        id: "asset-logo",
        kind: "image",
        mediaType: "image/png",
        byteLength: 24816,
        digest: { algorithm: "sha256", value: DIGEST },
        intrinsic: { widthPx: 1200, heightPx: 600 },
      },
    },
  })
}

function fields(): FieldRegistry {
  return {
    version: 1,
    fields: {
      "customer.logo": {
        key: "customer.logo",
        label: "Customer Logo",
        type: "image",
      },
      "customer.name": {
        key: "customer.name",
        label: "Customer Name",
        type: "text",
      },
    },
  }
}

function data(values: DataSnapshotV2["values"]): DataSnapshotV2 {
  return DataSnapshotV2Schema.parse({ version: 2, values })
}

describe("Package v3 image target schemas", () => {
  it("accepts strict immutable image manifest facts", () => {
    expect(assets()).toEqual({
      version: 1,
      images: {
        "asset-logo": {
          id: "asset-logo",
          kind: "image",
          mediaType: "image/png",
          byteLength: 24816,
          digest: { algorithm: "sha256", value: DIGEST },
          intrinsic: { widthPx: 1200, heightPx: 600 },
        },
      },
    })
  })

  it("rejects mismatched ids, unsafe manifest facts, and unsupported media", () => {
    const base = assets().images["asset-logo"]
    const cases = [
      { ...base, id: "different-id" },
      { ...base, mediaType: "image/svg+xml" },
      { ...base, digest: { algorithm: "sha256", value: "ABC" } },
      { ...base, byteLength: 0 },
      { ...base, intrinsic: { widthPx: 0, heightPx: 600 } },
      { ...base, sourceUrl: "https://example.com/logo.png" },
      { ...base, storageKey: "private/logo.png" },
      { ...base, bytes: "base64" },
    ]

    for (const image of cases) {
      expect(ImageAssetRegistryV1Schema.safeParse({
        version: 1,
        images: { "asset-logo": image },
      }).success).toBe(false)
    }
  })

  it("accepts scalar and image-ref data in v2 while rejecting old or open shapes", () => {
    expect(data({
      "customer.logo": { kind: "image-asset-ref", assetId: "asset-logo" },
      "customer.name": "Example Customer",
      "report.total": 42,
      "report.ready": true,
      "report.optional": null,
    })).toMatchObject({ version: 2 })

    expect(DataSnapshotV2Schema.safeParse({ version: 1, values: {} }).success).toBe(false)
    expect(DataSnapshotV2Schema.safeParse({
      version: 2,
      values: { "customer.logo": { kind: "image-asset-ref", assetId: "asset-logo", url: "https://example.com" } },
    }).success).toBe(false)
  })

  it("validates image field values against field and asset registries", () => {
    const assetRegistry = assets()
    const fieldRegistry = fields()
    const snapshot = data({ "customer.logo": { kind: "image-asset-ref", assetId: "asset-logo" } })
    const sourceBefore = JSON.stringify({ assetRegistry, fieldRegistry, snapshot })
    const validation = validateVNextPackageV3ImageTarget(assetRegistry, fieldRegistry, snapshot)

    expect(validation).toEqual({
      source: VNEXT_PACKAGE_V3_IMAGE_TARGET_SOURCE,
      version: 1,
      status: "valid",
      issues: [],
      summary: {
        assetCount: 1,
        dataKeyCount: 1,
        imageFieldCount: 1,
        imageValueCount: 1,
        errorCount: 0,
      },
    })
    expect(JSON.stringify({ assetRegistry, fieldRegistry, snapshot })).toBe(sourceBefore)
    expect(JSON.parse(JSON.stringify(validation))).toEqual(validation)
  })

  it("blocks missing fields, wrong field types, scalar image values, and missing assets", () => {
    const validation = validateVNextPackageV3ImageTarget(
      assets(),
      fields(),
      data({
        "missing.logo": { kind: "image-asset-ref", assetId: "asset-logo" },
        "customer.name": { kind: "image-asset-ref", assetId: "asset-logo" },
        "customer.logo": "logo-id",
        "other.logo": { kind: "image-asset-ref", assetId: "asset-missing" },
      }),
    )

    expect(validation.status).toBe("blocked")
    expect(validation.issues.map((issue) => issue.code)).toEqual([
      "unknown-image-field",
      "image-value-field-type-mismatch",
      "image-field-value-invalid",
      "unknown-image-field",
    ])
    expect(JSON.parse(JSON.stringify(validation))).toEqual(validation)

    const missingAsset = validateVNextPackageV3ImageTarget(
      assets(),
      {
        ...fields(),
        fields: {
          ...fields().fields,
          "other.logo": { key: "other.logo", label: "Other Logo", type: "image" },
        },
      },
      data({ "other.logo": { kind: "image-asset-ref", assetId: "asset-missing" } }),
    )
    expect(missingAsset).toMatchObject({
      status: "blocked",
      issues: [{ code: "missing-image-asset", assetId: "asset-missing" }],
    })
  })

  it("keeps target schemas isolated from the active package v2 parser", () => {
    const raw = readFileSync(new URL("../fixtures/product-report-vnext-minimal.flowdoc.json", import.meta.url), "utf8")
    const active = parseFlowDocPackageV2DocumentVNext(JSON.parse(raw))
    const targetCandidate = {
      ...active,
      packageVersion: 3,
      assets: assets(),
      data: data({ "customer.logo": { kind: "image-asset-ref", assetId: "asset-logo" } }),
    }

    expect(active.packageVersion).toBe(2)
    expect(active.document.version).toBe(3)
    expect("assets" in active).toBe(false)
    expect(active.data?.version).toBe(1)
    expect(safeParseFlowDocPackageV2DocumentVNext(targetCandidate)).toMatchObject({
      ok: false,
      reason: "unsupported-version",
    })

    const activePackageSource = readFileSync(new URL("../src/persistence/package.ts", import.meta.url), "utf8")
    expect(activePackageSource).not.toContain("packageV3ImageTarget")
    expect(activePackageSource).not.toContain("ImageAssetRegistryV1Schema")
    expect(activePackageSource).not.toContain("DataSnapshotV2Schema")
  })
})
