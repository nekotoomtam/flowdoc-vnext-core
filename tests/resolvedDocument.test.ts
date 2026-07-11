import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  parseFlowDocPackageV3DocumentV4,
  resolveVNextDocumentV1,
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
  const bodyText = document.document.sections[0].nodes["body-text"]
  if (bodyText.type !== "text-block") throw new Error("fixture body text missing")
  bodyText.props.textStyleId = "body"
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
        sourceDraft: { structureId: structureVersion.structureId, draftId: "draft-product-report", revision: 12 },
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

describe("resolved document projection", () => {
  it("resolves scalar, static/fallback image, and text-style bindings without mutating the graph", () => {
    const input = inputFixture()
    const before = JSON.stringify(input)

    const result = resolveVNextDocumentV1(input)

    expect(result.status).toBe("resolved")
    if (result.status !== "resolved") throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.bindings.fields).toContainEqual({
      inlineId: "body-name",
      textBlockId: "body-text",
      fieldKey: "customer.name",
      value: "Acme",
      valueSource: "data-snapshot",
    })
    expect(result.bindings.images).toEqual(expect.arrayContaining([
      {
        placementId: "body-inline-logo",
        fieldKey: "customer.logo",
        assetId: "asset-logo",
        assetOwner: "published-static-media",
        valueSource: "authored-fallback",
      },
      {
        placementId: "body-image",
        assetId: "asset-logo",
        assetOwner: "published-static-media",
        valueSource: "authored-static",
      },
    ]))
    expect(result.bindings.styles).toEqual([{
      textBlockId: "body-text",
      styleKey: "body",
      runStyle: { fontFamilyKey: "sarabun", fontSize: { value: 11, unit: "pt" } },
      localInlineStyleRemainsOverride: true,
    }])
    expect(result.document).toEqual(input.document)
    expect(result.document).not.toBe(input.document)
    expect(result.execution).toEqual({
      inputFetch: "not-run",
      authoredGraphMutation: false,
      generatedExpansion: "not-run",
      pagination: "not-run",
      rendering: "not-run",
    })
    expect(JSON.stringify(input)).toBe(before)
  })

  it("resolves Data Snapshot image values only from instance media", () => {
    const input = inputFixture()
    const asset = clone(input.published.staticMedia.registry.images["asset-logo"])
    asset.id = "asset-customer-logo"
    asset.digest.value = "d".repeat(64)
    input.instanceMedia.registry.images[asset.id] = asset
    input.dataSnapshot.data.values["customer.logo"] = { kind: "image-asset-ref", assetId: asset.id }

    const result = resolveVNextDocumentV1(input)

    expect(result.status).toBe("resolved")
    if (result.status !== "resolved") throw new Error("resolution blocked")
    expect(result.bindings.images).toContainEqual({
      placementId: "body-inline-logo",
      fieldKey: "customer.logo",
      assetId: "asset-customer-logo",
      assetOwner: "instance-media",
      valueSource: "data-snapshot",
    })
  })

  it("uses authored scalar fallback or empty text when a value is absent", () => {
    const fallback = inputFixture()
    delete fallback.dataSnapshot.data.values["customer.name"]
    const bodyText = fallback.document.document.sections[0].nodes["body-text"]
    if (bodyText.type !== "text-block") throw new Error("fixture body text missing")
    const field = bodyText.children.find((inline) => inline.id === "body-name")
    if (field?.type !== "field-ref") throw new Error("fixture field missing")
    field.fallback = "Unknown customer"
    const empty = clone(fallback)
    const emptyText = empty.document.document.sections[0].nodes["body-text"]
    if (emptyText.type !== "text-block") throw new Error("fixture body text missing")
    const emptyField = emptyText.children.find((inline) => inline.id === "body-name")
    if (emptyField?.type !== "field-ref") throw new Error("fixture field missing")
    delete emptyField.fallback

    const fallbackResult = resolveVNextDocumentV1(fallback)
    const emptyResult = resolveVNextDocumentV1(empty)

    expect(fallbackResult.status === "resolved" && fallbackResult.bindings.fields[0]).toMatchObject({
      value: "Unknown customer", valueSource: "authored-fallback",
    })
    expect(emptyResult.status === "resolved" && emptyResult.bindings.fields[0]).toMatchObject({
      value: "", valueSource: "empty",
    })
  })

  it("blocks invalid field, data, style, structure, and media references", () => {
    const unknownData = inputFixture()
    unknownData.dataSnapshot.data.values.unknown = "value"
    const wrongDataType = inputFixture()
    wrongDataType.dataSnapshot.data.values["customer.name"] = 42
    const missingStyle = inputFixture()
    delete missingStyle.published.styleCatalog.styles.body
    const missingStatic = inputFixture()
    delete missingStatic.published.staticMedia.registry.images["asset-logo"]
    const missingInstance = inputFixture()
    missingInstance.dataSnapshot.data.values["customer.logo"] = {
      kind: "image-asset-ref", assetId: "missing-instance-asset",
    }
    const invalidStructure = inputFixture()
    invalidStructure.document.document.sections[0].zoneIds.push("missing-zone")

    const cases = [
      [unknownData, "unknown-data-key"],
      [wrongDataType, "invalid-data-value-type"],
      [missingStyle, "missing-text-style"],
      [missingStatic, "missing-static-media"],
      [missingInstance, "missing-instance-media"],
      [invalidStructure, "invalid-instance-document"],
    ] as const
    cases.forEach(([input, code]) => {
      const result = resolveVNextDocumentV1(input)
      expect(result.status).toBe("blocked")
      expect(result.issues.some((item) => item.code === code)).toBe(true)
      expect(result.document).toBeNull()
      expect(result.bindings).toBeNull()
    })
  })

  it("publishes Phase 274 without activating generated expansion or rendering", () => {
    const doc = readFileSync(new URL("../docs/RESOLVED_DOCUMENT_PROJECTION_CONTRACT.md", import.meta.url), "utf8")
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")

    expect(doc).toContain("preserves a cloned materialized")
    expect(doc).toContain("Resolution is all-or-blocked")
    expect(doc).toContain("authored `asset-ref` resolves only")
    expect(doc).toContain("Generated expansion must later consume resolved bindings")
    expect(readme).toContain("Phase 274 resolves pinned scalar, image, and text-style")
    expect(ledger).toContain("## Phase 274 Resolved Document Projection")
  })
})
