import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createVNextRendererBackedTextMeasurer,
  createVNextRendererTextMeasurementProfilePlan,
  createVNextTextMeasurementCache,
  measureVNextText,
  VNEXT_RENDERER_TEXT_MEASUREMENT_MODE,
  VNEXT_RENDERER_TEXT_MEASUREMENT_SOURCE,
  type VNextRendererTextMeasurementProfile,
  type VNextRendererTextMeasurementRequest,
} from "../src/index.js"

function readyProfile(overrides: Partial<VNextRendererTextMeasurementProfile> = {}): VNextRendererTextMeasurementProfile {
  const { capabilities, ...profileOverrides } = overrides
  const base: VNextRendererTextMeasurementProfile = {
    profileId: "renderer-text-v1",
    availability: "ready",
    engine: "custom",
    revision: "rev-1",
    units: "pt",
    deterministic: true,
    capabilities: {
      lineBoxes: true,
      styleKey: true,
      availableWidth: true,
    },
  }

  return {
    ...base,
    ...profileOverrides,
    capabilities: {
      ...base.capabilities,
      ...capabilities,
    },
  }
}

describe("vNext renderer-backed text measurement boundary", () => {
  it("describes a ready renderer-backed text measurement profile without executing a renderer", () => {
    const plan = createVNextRendererTextMeasurementProfilePlan(readyProfile())

    expect(plan).toMatchObject({
      source: VNEXT_RENDERER_TEXT_MEASUREMENT_SOURCE,
      mode: VNEXT_RENDERER_TEXT_MEASUREMENT_MODE,
      status: "ready",
      profile: {
        profileId: "renderer-text-v1",
        availability: "ready",
        engine: "custom",
        revision: "rev-1",
        units: "pt",
        deterministic: true,
        capabilities: {
          lineBoxes: true,
          styleKey: true,
          availableWidth: true,
        },
      },
      rendererContract: {
        consumes: "vnext-text-measurement-input",
        produces: "vnext-text-measurement-draft",
        units: "pt",
        mayRelayoutDocument: false,
        requiresAuthoredDocumentForLayout: false,
        adapterMayAccessDom: false,
        adapterOwnsRendererExecution: false,
      },
      blockingIssues: [],
      warningIssues: [],
    })
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("adapts an external renderer measurement provider into the vNext text measurer contract", () => {
    const requests: VNextRendererTextMeasurementRequest[] = []
    const measurer = createVNextRendererBackedTextMeasurer(readyProfile(), {
      measure(input) {
        requests.push(input)
        return {
          lines: ["Renderer", "facts"],
          lineHeightPt: 12,
          widthPt: 64,
          heightPt: 24,
          lineBoxes: [{
            index: 0,
            text: "Renderer",
            startOffset: 0,
            endOffset: 8,
            widthPt: 64,
            heightPt: 12,
            yOffsetPt: 0,
          }, {
            index: 1,
            text: "facts",
            startOffset: 9,
            endOffset: 14,
            widthPt: 40,
            heightPt: 12,
            yOffsetPt: 12,
          }],
        }
      },
    })
    const cache = createVNextTextMeasurementCache()
    const input = {
      documentId: "doc",
      sectionId: "section-main",
      nodeId: "body",
      text: "Renderer facts",
      availableWidthPt: 80,
      styleKey: "paragraph/body",
      measurementProfileId: "renderer-text-v1",
    }

    const first = measureVNextText(input, measurer, cache)
    const second = measureVNextText(input, measurer, cache)

    expect(requests).toHaveLength(1)
    expect(requests[0]).toMatchObject({
      documentId: "doc",
      sectionId: "section-main",
      nodeId: "body",
      styleKey: "paragraph/body",
      measurementProfileId: "renderer-text-v1",
      rendererEngine: "custom",
      profileRevision: "rev-1",
      cacheKey: first.cacheKey,
      textHash: first.textHash,
    })
    expect(first).toMatchObject({
      cacheStatus: "miss",
      measurementProfileId: "renderer-text-v1",
      lines: ["Renderer", "facts"],
      widthPt: 64,
      heightPt: 24,
    })
    expect(first.lineBoxes).toHaveLength(2)
    expect(second).toMatchObject({
      cacheStatus: "hit",
      cacheKey: first.cacheKey,
      measurementProfileId: "renderer-text-v1",
    })
  })

  it("blocks unsafe renderer-backed text measurement profiles before a measurer is created", () => {
    const profile = readyProfile({
      profileId: " ",
      availability: "unavailable",
      units: "px",
      deterministic: false,
      capabilities: {
        lineBoxes: false,
        styleKey: false,
        availableWidth: false,
      },
    })
    const plan = createVNextRendererTextMeasurementProfilePlan(profile)

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues.map((issue) => issue.code)).toEqual([
      "missing-profile-id",
      "profile-unavailable",
      "non-point-units",
      "line-boxes-not-supported",
      "style-key-not-supported",
      "available-width-not-supported",
    ])
    expect(plan.warningIssues).toEqual([expect.objectContaining({
      code: "nondeterministic-profile",
      severity: "warning",
    })])
    expect(() => createVNextRendererBackedTextMeasurer(profile, {
      measure() {
        throw new Error("should not measure")
      },
    })).toThrow("blocked")
  })

  it("requires measurement cache identity to use the renderer-backed profile id", () => {
    const measurer = createVNextRendererBackedTextMeasurer(readyProfile(), {
      measure() {
        return {
          lines: ["ok"],
          lineHeightPt: 10,
          widthPt: 10,
          heightPt: 10,
        }
      },
    })

    expect(() => measureVNextText({
      documentId: "doc",
      sectionId: "section-main",
      nodeId: "body",
      text: "Mismatch",
      availableWidthPt: 80,
      styleKey: "paragraph/body",
      measurementProfileId: "other-profile",
    }, measurer)).toThrow("must match")
  })

  it("keeps the renderer-backed text measurement adapter independent from concrete renderers, DOM, documents, and layout", () => {
    const sourceUrl = new URL("../src/renderer/textMeasurementAdapter.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).toContain("VNextTextMeasurer")
    expect(source).toContain("VNextTextMeasurementDraft")
    expect(source).toContain("mayRelayoutDocument: false")
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/pdfkit|jspdf|pdf-lib|officegen|pizzip|mammoth|canvas|puppeteer|playwright/)
    expect(source).not.toContain('from "docx"')
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("localStorage")
    expect(source).not.toMatch(/\bdocument\.(querySelector|createElement|body|addEventListener)/)
    expect(source).not.toContain("HTMLElement")
    expect(source).not.toContain("window.")
    expect(source).not.toContain("/api/")
    expect(source).not.toContain("DocumentNode")
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toContain("runVNextLayoutPipeline")
    expect(source).not.toContain("buildVNextMeasuredRendererConsumption")
  })

  it("documents the renderer-backed text measurement boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/RENDERER_BACKED_TEXT_MEASUREMENT_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 95 implementation boundary.")
    expect(boundaryDoc).toContain("src/renderer/textMeasurementAdapter.ts")
    expect(boundaryDoc).toContain("This is a renderer-backed text measurement boundary.")
    expect(boundaryDoc).toContain("It is not a concrete renderer measurement engine.")
    expect(boundaryDoc).toContain("measurementProfileId")
    expect(readme).toContain("Renderer-backed text measurement boundary")
    expect(readme).toContain("docs/RENDERER_BACKED_TEXT_MEASUREMENT_BOUNDARY.md")
    expect(ledger).toContain("| 95 | Renderer-backed text measurement boundary | done |")
    expect(roadmap).toContain("## Phase 95: Renderer-backed Text Measurement Boundary")
  })
})
