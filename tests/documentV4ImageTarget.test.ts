import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  BlockImageNodeV4TargetSchema,
  ImageFrameV4TargetSchema,
  ImageSourceV4TargetSchema,
  ImageAssetRegistryV1Schema,
  InlineImageV4TargetSchema,
  TextBlockNodeSchema,
  TextBlockNodeV4TargetSchema,
  VNEXT_DOCUMENT_V4_IMAGE_TARGET_SOURCE,
  validateVNextDocumentV4ImageTarget,
  type FieldRegistry,
  type ImageAssetRegistryV1,
  type ImagePlacementV4Target,
} from "../src/index.js"

const DIGEST = "b".repeat(64)

function assets(): ImageAssetRegistryV1 {
  return ImageAssetRegistryV1Schema.parse({
    version: 1,
    images: {
      "asset-logo": {
        id: "asset-logo",
        kind: "image",
        mediaType: "image/png",
        byteLength: 1000,
        digest: { algorithm: "sha256", value: DIGEST },
        intrinsic: { widthPx: 600, heightPx: 300 },
      },
    },
  })
}

function fields(): FieldRegistry {
  return {
    version: 1,
    fields: {
      "customer.logo": { key: "customer.logo", label: "Customer Logo", type: "image" },
      "customer.name": { key: "customer.name", label: "Customer Name", type: "text" },
    },
  }
}

function frame() {
  return {
    width: { value: 12, unit: "mm" as const },
    height: { value: 6, unit: "mm" as const },
    fit: "contain" as const,
  }
}

function inlineImage(overrides: Record<string, unknown> = {}) {
  return {
    id: "inline-logo",
    type: "inline-image",
    source: { kind: "asset-ref", assetId: "asset-logo" },
    accessibility: { kind: "described", altText: "Customer logo" },
    frame: frame(),
    verticalAlign: "baseline",
    ...overrides,
  }
}

function blockImage(overrides: Record<string, unknown> = {}) {
  return {
    id: "hero-image",
    type: "image",
    source: { kind: "image-field-ref", fieldKey: "customer.logo", fallbackAssetId: "asset-logo" },
    accessibility: { kind: "decorative" },
    props: { frame: { ...frame(), fit: "cover" }, align: "center" },
    ...overrides,
  }
}

describe("Document v4 image target schemas", () => {
  it("accepts strict static and image-field source forms", () => {
    expect(ImageSourceV4TargetSchema.parse({ kind: "asset-ref", assetId: "asset-logo" })).toEqual({
      kind: "asset-ref",
      assetId: "asset-logo",
    })
    expect(ImageSourceV4TargetSchema.parse({
      kind: "image-field-ref",
      fieldKey: "customer.logo",
      fallbackAssetId: "asset-logo",
    })).toMatchObject({ kind: "image-field-ref", fieldKey: "customer.logo" })

    for (const source of [
      { kind: "asset-ref", assetId: "asset-logo", url: "https://example.com/logo.png" },
      { kind: "asset-ref", assetId: "asset-logo", bytes: "base64" },
      { kind: "image-field-ref", fieldKey: "customer.logo", fallbackUrl: "https://example.com" },
      { kind: "url", url: "https://example.com/logo.png" },
    ]) {
      expect(ImageSourceV4TargetSchema.safeParse(source).success).toBe(false)
    }
  })

  it("requires positive explicit frames and bounded normalized crop rectangles", () => {
    expect(ImageFrameV4TargetSchema.parse({
      ...frame(),
      crop: { x: 0.1, y: 0.2, width: 0.8, height: 0.7 },
    })).toMatchObject({ fit: "contain" })

    for (const invalidFrame of [
      { ...frame(), width: { value: 0, unit: "mm" } },
      { ...frame(), height: { value: -1, unit: "mm" } },
      { ...frame(), fit: "fill" },
      { ...frame(), crop: { x: 0.4, y: 0, width: 0.7, height: 1 } },
      { ...frame(), crop: { x: 0, y: 0.5, width: 1, height: 0.6 } },
      { ...frame(), x: 20, y: 30 },
    ]) {
      expect(ImageFrameV4TargetSchema.safeParse(invalidFrame).success).toBe(false)
    }
  })

  it("accepts inline-image only inside the target text-block grammar", () => {
    const target = TextBlockNodeV4TargetSchema.parse({
      id: "body",
      type: "text-block",
      role: { role: "paragraph" },
      props: {},
      children: [
        { id: "text-a", type: "text", text: "Logo " },
        inlineImage(),
      ],
    })

    expect(target.children[1]?.type).toBe("inline-image")
    expect(InlineImageV4TargetSchema.safeParse(inlineImage()).success).toBe(true)
    expect(InlineImageV4TargetSchema.safeParse(inlineImage({
      accessibility: { kind: "described", altText: "   " },
    })).success).toBe(false)
    expect(InlineImageV4TargetSchema.safeParse(inlineImage({
      accessibility: { kind: "decorative", altText: "ambiguous" },
    })).success).toBe(false)
    expect(TextBlockNodeSchema.safeParse(target).success).toBe(false)
    expect(TextBlockNodeV4TargetSchema.safeParse({ ...target, children: [] }).success).toBe(true)
    expect(TextBlockNodeV4TargetSchema.safeParse({
      ...target,
      children: [{ id: "empty", type: "text", text: "" }],
    }).success).toBe(false)
    expect(TextBlockNodeV4TargetSchema.safeParse({
      ...target,
      children: [{ id: "newline", type: "text", text: "A\nB" }],
    }).success).toBe(false)
  })

  it("keeps block image structural and separate from text-block children", () => {
    expect(BlockImageNodeV4TargetSchema.parse(blockImage())).toMatchObject({
      id: "hero-image",
      type: "image",
      props: { align: "center" },
    })

    for (const invalid of [
      blockImage({ children: [] }),
      blockImage({ caption: "Caption" }),
      blockImage({ wrap: "around" }),
      blockImage({ x: 10, y: 20 }),
      blockImage({ props: { ...blockImage().props, float: "left" } }),
    ]) {
      expect(BlockImageNodeV4TargetSchema.safeParse(invalid).success).toBe(false)
    }
  })

  it("validates authored source references against fields and assets", () => {
    const placements = [
      InlineImageV4TargetSchema.parse(inlineImage()),
      BlockImageNodeV4TargetSchema.parse(blockImage()),
    ] satisfies ImagePlacementV4Target[]
    const before = JSON.stringify({ placements, assets: assets(), fields: fields() })
    const validation = validateVNextDocumentV4ImageTarget(placements, assets(), fields())

    expect(validation).toEqual({
      source: VNEXT_DOCUMENT_V4_IMAGE_TARGET_SOURCE,
      version: 1,
      status: "valid",
      issues: [],
      summary: {
        placementCount: 2,
        inlineImageCount: 1,
        blockImageCount: 1,
        assetSourceCount: 1,
        fieldSourceCount: 1,
        errorCount: 0,
      },
    })
    expect(JSON.stringify({ placements, assets: assets(), fields: fields() })).toBe(before)
    expect(JSON.parse(JSON.stringify(validation))).toEqual(validation)
  })

  it("blocks missing assets, missing fields, wrong field types, and missing fallbacks", () => {
    const placements = [
      InlineImageV4TargetSchema.parse(inlineImage({
        id: "missing-static",
        source: { kind: "asset-ref", assetId: "asset-missing" },
      })),
      BlockImageNodeV4TargetSchema.parse(blockImage({
        id: "missing-field",
        source: { kind: "image-field-ref", fieldKey: "missing.logo", fallbackAssetId: "fallback-missing" },
      })),
      BlockImageNodeV4TargetSchema.parse(blockImage({
        id: "wrong-field",
        source: { kind: "image-field-ref", fieldKey: "customer.name" },
      })),
    ]

    const validation = validateVNextDocumentV4ImageTarget(placements, assets(), fields())

    expect(validation.status).toBe("blocked")
    expect(validation.issues.map((issue) => issue.code)).toEqual([
      "missing-image-asset",
      "missing-image-field",
      "missing-fallback-image-asset",
      "image-field-type-mismatch",
    ])
    expect(JSON.parse(JSON.stringify(validation))).toEqual(validation)
  })

  it("keeps active document schemas and repository navigation isolated", () => {
    const activeDocumentSource = readFileSync(new URL("../src/schema/document.ts", import.meta.url), "utf8")
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")

    expect(activeDocumentSource).not.toContain("documentV4ImageTarget")
    expect(activeDocumentSource).not.toContain('z.literal("inline-image")')
    expect(activeDocumentSource).not.toContain('type: z.literal("image")')
    expect(readme).toContain("docs/DOCUMENT_V4_IMAGE_TARGET_SCHEMAS.md")
    expect(ledger).toContain("| 254 | Document v4 image target schemas | done |")
    expect(ledger).toContain("## Phase 254 Document V4 Image Target Schemas")
  })
})
