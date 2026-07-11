import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  FlowDocPackageV3ParseError,
  parseFlowDocPackageV3DocumentV4,
  safeParseFlowDocPackageV2DocumentVNext,
  safeParseFlowDocPackageV3DocumentV4,
  serializeFlowDocPackageV3DocumentV4,
  validateVNextPackageV3DocumentV4References,
  type FlowDocPackageV3DocumentV4,
} from "../src/index.js"

function rawFixture(): Record<string, unknown> {
  const raw = readFileSync(new URL("../fixtures/product-report-v4-image-target.flowdoc.json", import.meta.url), "utf8")
  return JSON.parse(raw) as Record<string, unknown>
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function packageFixture(): FlowDocPackageV3DocumentV4 {
  return parseFlowDocPackageV3DocumentV4(rawFixture())
}

function bodyImage(pack: FlowDocPackageV3DocumentV4) {
  const node = pack.document.document.sections[0].nodes["body-image"]
  if (node.type !== "image") throw new Error("fixture body image missing")
  return node
}

function bodyText(pack: FlowDocPackageV3DocumentV4) {
  const node = pack.document.document.sections[0].nodes["body-text"]
  if (node.type !== "text-block") throw new Error("fixture body text missing")
  return node
}

describe("Package v3/document v4 parser", () => {
  it("parses, validates, and serializes the target acceptance fixture", () => {
    const raw = rawFixture()
    const sourceBefore = JSON.stringify(raw)
    const result = safeParseFlowDocPackageV3DocumentV4(raw)

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.package).toMatchObject({
      packageVersion: 3,
      id: "product-report-v4-image-target",
      document: { version: 4 },
      assets: { version: 1 },
      fields: { version: 1 },
      data: { version: 2 },
    })
    expect(validateVNextPackageV3DocumentV4References(result.package)).toMatchObject({
      status: "valid",
      issues: [],
      summary: {
        fieldRefCount: 1,
        imagePlacementCount: 2,
        dataKeyCount: 2,
        errorCount: 0,
      },
    })
    expect(serializeFlowDocPackageV3DocumentV4(result.package)).toEqual(result.package)
    expect(JSON.stringify(raw)).toBe(sourceBefore)
  })

  it("rejects unknown keys at package and nested target boundaries", () => {
    const packageExtra = rawFixture()
    packageExtra.prototypeOnly = true

    const frameExtra = clone(packageFixture())
    const width = bodyImage(frameExtra).props.frame.width as unknown as Record<string, unknown>
    width.prototypeOnly = true

    const fieldExtra = clone(packageFixture())
    const field = fieldExtra.fields.fields["customer.name"] as unknown as Record<string, unknown>
    field.prototypeOnly = true

    const pageUnitExtra = clone(packageFixture())
    const top = pageUnitExtra.document.document.sections[0].page.margin.top as unknown as Record<string, unknown>
    top.prototypeOnly = true

    for (const candidate of [packageExtra, frameExtra, fieldExtra, pageUnitExtra]) {
      const result = safeParseFlowDocPackageV3DocumentV4(candidate)
      expect(result).toMatchObject({ ok: false, reason: "invalid-package" })
      if (!result.ok) expect(result.issues.some((item) => item.code === "unrecognized_keys")).toBe(true)
    }
  })

  it("reports package and document version mismatches as unsupported", () => {
    const packageMismatch = rawFixture()
    packageMismatch.packageVersion = 2
    const documentMismatch = rawFixture()
    const document = documentMismatch.document as Record<string, unknown>
    document.version = 3

    expect(safeParseFlowDocPackageV3DocumentV4(packageMismatch)).toMatchObject({
      ok: false,
      reason: "unsupported-version",
    })
    expect(safeParseFlowDocPackageV3DocumentV4(documentMismatch)).toMatchObject({
      ok: false,
      reason: "unsupported-version",
    })
  })

  it("rejects package identity, field key drift, and scalar fallback on image fields", () => {
    const idMismatch = clone(packageFixture())
    idMismatch.id = "different-package-id"

    const fieldKeyMismatch = clone(packageFixture())
    fieldKeyMismatch.fields.fields["customer.name"].key = "different.key"

    const imageFallback = clone(packageFixture())
    imageFallback.fields.fields["customer.logo"].fallback = "asset-logo"

    for (const candidate of [idMismatch, fieldKeyMismatch, imageFallback]) {
      expect(safeParseFlowDocPackageV3DocumentV4(candidate)).toMatchObject({
        ok: false,
        reason: "invalid-package",
      })
    }
  })

  it("returns exact package paths for structural failures", () => {
    const candidate = clone(packageFixture())
    const section = candidate.document.document.sections[0]
    section.nodes["header-break"] = { id: "header-break", type: "page-break", props: {} }
    const header = section.nodes["header-zone"]
    if (header.type !== "zone") throw new Error("fixture header missing")
    header.childIds.push("header-break")

    const result = safeParseFlowDocPackageV3DocumentV4(candidate)

    expect(result).toMatchObject({ ok: false, reason: "invalid-structure" })
    if (!result.ok) {
      expect(result.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({
          source: "structure",
          code: "page-break-outside-body-zone",
          path: "document.document.sections[0].nodes.header-zone.childIds[1]",
        }),
      ]))
    }
  })

  it("blocks authored, image, fallback, and data reference mismatches", () => {
    const candidate = clone(packageFixture())
    bodyImage(candidate).source = { kind: "asset-ref", assetId: "asset-missing" }
    const text = bodyText(candidate)
    const inlineImage = text.children.find((inline) => inline.type === "inline-image")
    if (inlineImage?.type !== "inline-image") throw new Error("fixture inline image missing")
    inlineImage.source = {
      kind: "image-field-ref",
      fieldKey: "customer.name",
      fallbackAssetId: "fallback-missing",
    }
    const fieldRef = text.children.find((inline) => inline.type === "field-ref")
    if (fieldRef?.type !== "field-ref") throw new Error("fixture field ref missing")
    fieldRef.key = "customer.logo"
    if (!candidate.data) throw new Error("fixture data missing")
    candidate.data.values["customer.name"] = 42
    candidate.data.values["unknown.key"] = "unknown"

    const result = safeParseFlowDocPackageV3DocumentV4(candidate)

    expect(result).toMatchObject({ ok: false, reason: "invalid-references" })
    if (!result.ok) {
      const codes = result.issues.map((item) => item.code)
      expect(codes).toEqual(expect.arrayContaining([
        "missing-image-asset",
        "image-field-type-mismatch",
        "missing-fallback-image-asset",
        "non-inline-field-ref",
        "invalid-data-value-type",
        "unknown-data-key",
      ]))
      expect(result.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: "missing-image-asset",
          path: "document.document.sections[0].nodes.body-image.source.assetId",
        }),
        expect.objectContaining({
          code: "image-field-type-mismatch",
          path: "document.document.sections[0].nodes.body-text.children[3].source.fieldKey",
        }),
      ]))
    }
  })

  it("throws the named parse error for invalid target packages", () => {
    const candidate = rawFixture()
    candidate.packageVersion = 2

    expect(() => parseFlowDocPackageV3DocumentV4(candidate)).toThrow(FlowDocPackageV3ParseError)
    try {
      parseFlowDocPackageV3DocumentV4(candidate)
    } catch (error) {
      expect(error).toMatchObject({ name: "FlowDocPackageV3ParseError", reason: "unsupported-version" })
    }
  })

  it("keeps the active parser and runtime entrypoints isolated", () => {
    const candidate = rawFixture()
    expect(safeParseFlowDocPackageV2DocumentVNext(candidate)).toMatchObject({
      ok: false,
      reason: "unsupported-version",
    })

    for (const path of [
      "../src/runtime/session.ts",
      "../src/authoring/editableSession.ts",
      "../src/generation/runtime.ts",
    ]) {
      const source = readFileSync(new URL(path, import.meta.url), "utf8")
      expect(source).not.toContain("packageV3")
      expect(source).not.toContain("safeParseFlowDocPackageV3DocumentV4")
    }
  })

  it("publishes Phase 256 navigation", () => {
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")

    expect(readme).toContain("docs/PACKAGE_V3_DOCUMENT_V4_PARSER.md")
    expect(ledger).toContain("| 256 | Package v3/document v4 parser | done |")
    expect(ledger).toContain("## Phase 256 Package V3 Document V4 Parser")
  })
})
