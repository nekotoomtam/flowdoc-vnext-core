import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  parseFlowDocPackageV3DocumentV4,
  safeParseVNextResolvedProjectionInputV1,
  type VNextResolvedProjectionInputV1,
} from "../src/index.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function inputFixture(): VNextResolvedProjectionInputV1 {
  const raw = readFileSync(
    new URL("../fixtures/product-report-v4-image-target.flowdoc.json", import.meta.url),
    "utf8",
  )
  const pack = parseFlowDocPackageV3DocumentV4(JSON.parse(raw))
  const structureVersion = {
    structureId: "structure-product-report",
    structureVersionId: "structure-product-report-v4",
    versionOrdinal: 4,
  }
  const instance = {
    contractVersion: 1 as const,
    kind: "document-instance" as const,
    instanceId: "instance-product-report-001",
    revision: 8,
    structureVersion,
  }
  const document = clone(pack.document)
  document.document.id = instance.instanceId
  return {
    contractVersion: 1,
    kind: "resolved-projection-input",
    instance,
    document,
    published: {
      contractVersion: 1,
      kind: "published-resolution-bundle",
      publishedStructure: {
        contractVersion: 1,
        kind: "published-structure-version",
        ...structureVersion,
        sourceDraft: {
          structureId: structureVersion.structureId,
          draftId: "draft-product-report",
          revision: 12,
        },
      },
      fieldContract: {
        contractVersion: 1,
        kind: "published-field-contract",
        fieldContractId: "fields-product-report-v4",
        owner: structureVersion,
        registry: pack.fields,
      },
      styleCatalog: {
        contractVersion: 1,
        kind: "published-style-catalog",
        catalogId: "styles-product-report-v4",
        owner: structureVersion,
        styles: {
          body: { key: "body", runStyle: { fontFamilyKey: "sarabun", fontSize: { value: 11, unit: "pt" } } },
        },
      },
      staticMedia: {
        contractVersion: 1,
        kind: "published-static-media",
        mediaRegistryId: "static-media-product-report-v4",
        owner: structureVersion,
        registry: pack.assets,
      },
    },
    dataSnapshot: {
      contractVersion: 1,
      kind: "instance-data-snapshot",
      dataSnapshotId: "data-instance-product-report-001-r8",
      instance: clone(instance),
      data: { version: 2, values: { "customer.name": "Acme", "customer.logo": null } },
    },
    instanceMedia: {
      contractVersion: 1,
      kind: "instance-media-snapshot",
      mediaSnapshotId: "media-instance-product-report-001-r8",
      instance: clone(instance),
      registry: { version: 1, images: {} },
    },
  }
}

describe("resolved projection input pins", () => {
  it("accepts one exact published bundle and instance revision", () => {
    const input = inputFixture()
    const before = JSON.stringify(input)
    const result = safeParseVNextResolvedProjectionInputV1(input)

    expect(result).toMatchObject({ ok: true, issues: [] })
    if (!result.ok) throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.input.instance.revision).toBe(8)
    expect(result.input.published.fieldContract.registry.fields["customer.name"].type).toBe("text")
    expect(result.input.published.styleCatalog.styles.body.runStyle.fontFamilyKey).toBe("sarabun")
    expect(JSON.stringify(input)).toBe(before)
  })

  it("blocks mismatched owners, structure pins, instance revisions, and document ids", () => {
    const wrongOwner = inputFixture()
    wrongOwner.published.fieldContract.owner.structureVersionId = "other-version"
    const wrongPublished = inputFixture()
    wrongPublished.instance.structureVersion.structureVersionId = "other-version"
    const wrongDataRevision = inputFixture()
    wrongDataRevision.dataSnapshot.instance.revision = 7
    const wrongMediaInstance = inputFixture()
    wrongMediaInstance.instanceMedia.instance.instanceId = "other-instance"
    const wrongDocument = inputFixture()
    wrongDocument.document.document.id = "other-instance"

    for (const candidate of [wrongOwner, wrongPublished, wrongDataRevision, wrongMediaInstance, wrongDocument]) {
      const result = safeParseVNextResolvedProjectionInputV1(candidate)
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.issues.length).toBeGreaterThan(0)
    }
  })

  it("blocks cross-registry asset collisions instead of guessing ownership", () => {
    const input = inputFixture()
    input.instanceMedia.registry.images["asset-logo"] = clone(
      input.published.staticMedia.registry.images["asset-logo"],
    )

    const result = safeParseVNextResolvedProjectionInputV1(input)

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.issues).toContainEqual(expect.objectContaining({
      path: "instanceMedia.registry.images.asset-logo",
      message: expect.stringContaining("collides with published static media"),
    }))
  })

  it("strictly validates style identities and unknown properties", () => {
    const wrongStyleKey = inputFixture()
    wrongStyleKey.published.styleCatalog.styles.body.key = "heading"
    const unknown = clone(inputFixture()) as VNextResolvedProjectionInputV1 & { runtime?: unknown }
    unknown.runtime = { fetch: true }

    expect(safeParseVNextResolvedProjectionInputV1(wrongStyleKey).ok).toBe(false)
    expect(safeParseVNextResolvedProjectionInputV1(unknown).ok).toBe(false)
  })

  it("publishes Phase 273 without activating resolver or package fallback", () => {
    const doc = readFileSync(new URL("../docs/RESOLUTION_INPUT_PINS_CONTRACT.md", import.meta.url), "utf8")
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")

    expect(doc).toContain("belongs to one")
    expect(doc).toContain("exact Published Structure Version")
    expect(doc).toContain("Field definitions are not instance values")
    expect(doc).toContain("Cross-registry collisions block")
    expect(doc).toContain("no scalar/image value resolution yet")
    expect(readme).toContain("Phase 273 pins published field/style/static-media")
    expect(ledger).toContain("## Phase 273 Resolution Input Pins")
  })
})
