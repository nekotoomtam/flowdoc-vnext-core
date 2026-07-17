import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockV4MeasuredLines,
  createVNextTextBlockV4MeasurementRequest,
  createVNextTextBlockV4MeasurementRequestFromResolvedNode,
  type VNextResolvedDocumentV1,
} from "../src/index.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function resolvedFixture(): VNextResolvedDocumentV1 {
  const frame = {
    width: { value: 10, unit: "mm" as const },
    height: { value: 5, unit: "mm" as const },
    fit: "contain" as const,
  }
  return {
    source: "vnext-resolved-document",
    contractVersion: 1,
    status: "resolved",
    instanceId: "instance-report-001",
    instanceRevision: 8,
    structureVersionId: "structure-report-v4",
    document: {
      version: 4,
      document: {
        id: "instance-report-001",
        sections: [{
          id: "section-main",
          type: "section",
          page: {
            size: "A4",
            orientation: "portrait",
            margin: {
              top: { value: 20, unit: "mm" }, right: { value: 20, unit: "mm" },
              bottom: { value: 20, unit: "mm" }, left: { value: 20, unit: "mm" },
            },
          },
          zoneIds: ["body-zone"],
          nodes: {
            "body-zone": { id: "body-zone", type: "zone", role: "body", childIds: ["body-text"] },
            "body-text": {
              id: "body-text",
              type: "text-block",
              role: { role: "paragraph" },
              props: { textStyleId: "body" },
              children: [
                { id: "hello", type: "text", text: "Hello " },
                { id: "customer", type: "field-ref", key: "customer.name" },
                { id: "break", type: "line-break" },
                {
                  id: "logo", type: "inline-image",
                  source: { kind: "image-field-ref", fieldKey: "customer.logo" },
                  accessibility: { kind: "decorative" }, frame, verticalAlign: "baseline",
                },
              ],
            },
          },
        }],
      },
    },
    pins: {
      fieldContractId: "fields-v4", styleCatalogId: "styles-v4",
      staticMediaRegistryId: "static-v4", dataSnapshotId: "data-r8",
      instanceMediaSnapshotId: "media-r8",
    },
    bindings: {
      fields: [{
        inlineId: "customer", textBlockId: "body-text", fieldKey: "customer.name",
        value: "Acme", valueSource: "data-snapshot",
      }],
      images: [{
        placementId: "logo", fieldKey: "customer.logo", assetId: "customer-logo",
        assetOwner: "instance-media", valueSource: "data-snapshot",
      }],
      styles: [{
        textBlockId: "body-text", styleKey: "body", runStyle: { fontFamilyKey: "sarabun" },
        localInlineStyleRemainsOverride: true,
      }],
    },
    resources: {
      staticMedia: { version: 1, images: {} },
      instanceMedia: {
        version: 1,
        images: {
          "customer-logo": {
            id: "customer-logo", kind: "image", mediaType: "image/png", byteLength: 100,
            digest: { algorithm: "sha256", value: "a".repeat(64) },
            intrinsic: { widthPx: 100, heightPx: 50 },
          },
        },
      },
    },
    execution: {
      inputFetch: "not-run", authoredGraphMutation: false, generatedExpansion: "not-run",
      pagination: "not-run", rendering: "not-run",
    },
    issues: [],
  }
}

describe("text-block v4 measurement source ranges", () => {
  it("creates resolved runs while retaining authored inline identities", () => {
    const resolved = resolvedFixture()
    const before = JSON.stringify(resolved)
    const result = createVNextTextBlockV4MeasurementRequest(resolved, {
      textBlockId: "body-text", availableWidthPt: 300, measurementProfileId: "thai-primary-v1",
    })

    expect(result.status).toBe("ready")
    if (result.status !== "ready") throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.request).toMatchObject({
      documentId: "instance-report-001",
      instanceRevision: 8,
      sectionId: "section-main",
      textBlockId: "body-text",
      styleKey: "body",
      renderedText: `Hello Acme\n\uFFFC`,
    })
    expect(result.request.runs.map((run) => [run.inlineId, run.kind, run.renderStartOffset, run.renderEndOffset])).toEqual([
      ["hello", "text", 0, 6],
      ["customer", "resolved-field", 6, 10],
      ["break", "hard-break", 10, 11],
      ["logo", "inline-image", 11, 12],
    ])
    expect(result.request.runs[1]).toMatchObject({ fieldKey: "customer.name", renderedText: "Acme" })
    expect(result.request.runs[3]).toMatchObject({ assetId: "customer-logo", frame: { fit: "contain" } })
    expect(JSON.stringify(resolved)).toBe(before)
  })

  it("maps accepted measured lines back to canonical and resolved source offsets", () => {
    const requestResult = createVNextTextBlockV4MeasurementRequest(resolvedFixture(), {
      textBlockId: "body-text", availableWidthPt: 300, measurementProfileId: "thai-primary-v1",
    })
    if (requestResult.status !== "ready") throw new Error("request blocked")

    const result = acceptVNextTextBlockV4MeasuredLines(requestResult.request, [
      { index: 0, startOffset: 0, endOffset: 8, text: "Hello Ac", widthPt: 70, heightPt: 14 },
      { index: 1, startOffset: 8, endOffset: 11, text: "me", widthPt: 20, heightPt: 14 },
      { index: 2, startOffset: 11, endOffset: 12, text: "\uFFFC", widthPt: 28, heightPt: 16 },
    ])

    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.lines[0].sourceStart).toEqual({
      textBlockId: "body-text", inlineId: "hello", authoredOffset: 0,
      resolvedOffset: 0, affinity: "forward",
    })
    expect(result.lines[0].sourceEnd).toEqual({
      textBlockId: "body-text", inlineId: "customer", authoredOffset: 0,
      resolvedOffset: 2, affinity: "backward",
    })
    expect(result.lines[1].sourceStart).toMatchObject({
      inlineId: "customer", authoredOffset: 0, resolvedOffset: 2,
    })
    expect(result.lines[1].sourceEnd).toMatchObject({
      inlineId: "break", authoredOffset: 1, resolvedOffset: 1,
    })
    expect(result.lines[2].sourceStart).toMatchObject({ inlineId: "logo", authoredOffset: 0 })
    expect(result.lines[2].sourceEnd).toMatchObject({ inlineId: "logo", authoredOffset: 1 })
    expect(result.summary).toEqual({ lineCount: 3, renderedLength: 12, totalHeightPt: 44 })
  })

  it("accepts one zero-range measured line for a canonical empty block", () => {
    const resolved = resolvedFixture()
    const body = resolved.document.document.sections[0].nodes["body-text"]
    if (body.type !== "text-block") throw new Error("fixture body missing")
    body.children = []
    resolved.bindings.fields = []
    resolved.bindings.images = []
    const requestResult = createVNextTextBlockV4MeasurementRequest(resolved, {
      textBlockId: "body-text", availableWidthPt: 300, measurementProfileId: "thai-primary-v1",
    })
    if (requestResult.status !== "ready") throw new Error("request blocked")

    const result = acceptVNextTextBlockV4MeasuredLines(requestResult.request, [
      { index: 0, startOffset: 0, endOffset: 0, text: "", widthPt: 0, heightPt: 14 },
    ])

    expect(result.status).toBe("accepted")
    if (result.status === "accepted") {
      expect(result.lines[0].sourceStart).toMatchObject({ inlineId: null, authoredOffset: 0 })
      expect(result.lines[0].sourceEnd).toMatchObject({ inlineId: null, authoredOffset: 0 })
    }
  })

  it("blocks unexpanded page-number and missing resolved binding facts", () => {
    const page = resolvedFixture()
    const pageBody = page.document.document.sections[0].nodes["body-text"]
    if (pageBody.type !== "text-block") throw new Error("fixture body missing")
    pageBody.children.push({ id: "page", type: "page-number" })
    const missingField = resolvedFixture()
    missingField.bindings.fields = []
    const missingImage = resolvedFixture()
    missingImage.bindings.images = []

    expect(createVNextTextBlockV4MeasurementRequest(page, {
      textBlockId: "body-text", availableWidthPt: 300, measurementProfileId: "profile",
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "generated-inline-unresolved" })] })
    expect(createVNextTextBlockV4MeasurementRequest(missingField, {
      textBlockId: "body-text", availableWidthPt: 300, measurementProfileId: "profile",
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "resolved-field-binding-missing" })] })
    expect(createVNextTextBlockV4MeasurementRequest(missingImage, {
      textBlockId: "body-text", availableWidthPt: 300, measurementProfileId: "profile",
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "resolved-image-binding-missing" })] })
  })

  it("retains generated page-number ownership through exact measurement", () => {
    const resolved = resolvedFixture()
    const section = resolved.document.document.sections[0]
    const zone = section.nodes["body-zone"]
    if (zone.type !== "zone") throw new Error("fixture zone missing")
    zone.role = "footer"
    const textBlock = section.nodes["body-text"]
    if (textBlock.type !== "text-block") throw new Error("fixture body missing")
    textBlock.children = [
      { id: "label", type: "text", text: "Page " },
      { id: "page", type: "page-number" },
    ]
    const ownerFingerprint = `sha256:${"a".repeat(64)}`
    const requestResult = createVNextTextBlockV4MeasurementRequestFromResolvedNode({
      documentId: resolved.instanceId,
      instanceRevision: resolved.instanceRevision,
      sectionId: section.id,
      textBlock,
      availableWidthPt: 300,
      measurementProfileId: "thai-primary-v1",
      styleKey: "body",
      resolvedTextByInlineId: {},
      resolvedImageByPlacementId: {},
      generatedTextByInlineId: {
        page: { kind: "page-number", value: "8888", ownerFingerprint },
      },
    })

    expect(requestResult.status).toBe("ready")
    if (requestResult.status !== "ready") throw new Error("generated request blocked")
    expect(requestResult.request).toMatchObject({
      renderedText: "Page 8888",
      runs: [
        { inlineId: "label", kind: "text", renderedText: "Page " },
        {
          inlineId: "page",
          kind: "generated-page-number",
          renderedText: "8888",
          generatedOwnerFingerprint: ownerFingerprint,
        },
      ],
    })
    const accepted = acceptVNextTextBlockV4MeasuredLines(requestResult.request, [{
      index: 0,
      startOffset: 0,
      endOffset: 9,
      text: "Page 8888",
      widthPt: 48,
      heightPt: 12,
    }])
    expect(accepted).toMatchObject({
      status: "accepted",
      lines: [{
        sourceEnd: { inlineId: "page", authoredOffset: 1, resolvedOffset: 4 },
      }],
    })

    const invalidOwner = createVNextTextBlockV4MeasurementRequestFromResolvedNode({
      documentId: resolved.instanceId,
      instanceRevision: resolved.instanceRevision,
      sectionId: section.id,
      textBlock,
      availableWidthPt: 300,
      measurementProfileId: "thai-primary-v1",
      styleKey: "body",
      resolvedTextByInlineId: {},
      resolvedImageByPlacementId: {},
      generatedTextByInlineId: {
        page: { kind: "page-number", value: "1", ownerFingerprint: "not-pinned" },
      },
    })
    expect(invalidOwner).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "generated-inline-owner-invalid" })],
    })
  })

  it("blocks incomplete, discontinuous, invalid-geometry, and unsafe UTF-16 line results", () => {
    const resolved = resolvedFixture()
    const field = resolved.bindings.fields[0]
    field.value = "👩"
    const requestResult = createVNextTextBlockV4MeasurementRequest(resolved, {
      textBlockId: "body-text", availableWidthPt: 300, measurementProfileId: "profile",
    })
    if (requestResult.status !== "ready") throw new Error("request blocked")
    const length = requestResult.request.renderedText.length

    const incomplete = acceptVNextTextBlockV4MeasuredLines(requestResult.request, [
      { index: 0, startOffset: 0, endOffset: 2, text: "He", widthPt: 10, heightPt: 14 },
    ])
    const gap = acceptVNextTextBlockV4MeasuredLines(requestResult.request, [
      { index: 0, startOffset: 1, endOffset: length, text: "", widthPt: 10, heightPt: 14 },
    ])
    const geometry = acceptVNextTextBlockV4MeasuredLines(requestResult.request, [
      { index: 0, startOffset: 0, endOffset: length, text: "", widthPt: 10, heightPt: 0 },
    ])
    const unsafe = acceptVNextTextBlockV4MeasuredLines(requestResult.request, [
      { index: 0, startOffset: 0, endOffset: 7, text: "Hello ", widthPt: 10, heightPt: 14 },
      { index: 1, startOffset: 7, endOffset: length, text: "", widthPt: 10, heightPt: 14 },
    ])

    expect(incomplete).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "line-coverage-incomplete" })] })
    expect(gap).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "line-coverage-gap" })] })
    expect(geometry).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "invalid-line-geometry" })] })
    expect(unsafe.status).toBe("blocked")
    expect(unsafe.issues.some((item) => item.code === "unsafe-render-offset")).toBe(true)
  })

  it("keeps measured source packets separate from pagination and renderer execution", () => {
    const source = readFileSync(new URL("../src/pagination/textBlockV4Measurement.ts", import.meta.url), "utf8")
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toContain("runVNextLayoutPipeline")
    expect(source).not.toContain("renderVNext")
    expect(source).not.toContain("fetch(")
  })

  it("publishes Phase 278 without claiming a line breaker or pagination", () => {
    const doc = readFileSync(new URL("../docs/TEXT_BLOCK_V4_MEASUREMENT_SOURCE_RANGES.md", import.meta.url), "utf8")
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")

    expect(doc).toContain("resolved measurement packet and line-range acceptance")
    expect(doc).toContain("Field-ref remains one atomic authored slot")
    expect(doc).toContain("cover the complete rendered stream")
    expect(doc).toContain("no shaper, line breaker")
    expect(readme).toContain("Phase 278 creates v4 resolved measurement packets")
    expect(ledger).toContain("## Phase 278 Text-block V4 Measurement Source Ranges")
  })
})
