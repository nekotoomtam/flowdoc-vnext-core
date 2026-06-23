import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import type { AuthoredNode, DocumentNode, VNextPdfRendererAdapterPlan } from "../src/index.js"
import {
  buildVNextMeasuredRendererConsumption,
  createVNextPdfRendererAdapterPlan,
  paginateVNextDocument,
} from "../src/index.js"
import {
  FLOWDOC_PDF_RENDERER_SPIKE_MODE,
  FLOWDOC_PDF_RENDERER_SPIKE_SOURCE,
  renderFlowDocMinimalPdfArtifact,
} from "../packages/pdf-renderer-spike/src/index.js"

function pt(value: number) {
  return { value, unit: "pt" as const }
}

function textBlock(id: string, text: string): AuthoredNode {
  return {
    id,
    type: "text-block",
    role: { role: "paragraph" },
    props: {},
    children: [{ id: `${id}-text`, type: "text", text }],
  }
}

function simpleDoc(): DocumentNode {
  return {
    version: 3,
    document: {
      id: "pdf-spike-doc",
      meta: { title: "PDF Spike" },
      sections: [{
        id: "section-main",
        type: "section",
        page: {
          size: "A4",
          orientation: "portrait",
          margin: {
            top: pt(72),
            right: pt(72),
            bottom: pt(72),
            left: pt(72),
          },
        },
        zoneIds: ["body-zone"],
        nodes: {
          "body-zone": { id: "body-zone", type: "zone", role: "body", childIds: ["body"] },
          body: textBlock("body", "Minimal PDF artifact"),
        },
      }],
    },
  }
}

function readyPdfPlan(): VNextPdfRendererAdapterPlan {
  const pagination = paginateVNextDocument(simpleDoc())
  return createVNextPdfRendererAdapterPlan(buildVNextMeasuredRendererConsumption(pagination))
}

function readText(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8")
}

describe("external minimal PDF renderer spike package", () => {
  it("produces non-empty PDF bytes and a stable local artifact manifest", () => {
    const plan = readyPdfPlan()
    const result = renderFlowDocMinimalPdfArtifact({
      spikeId: "phase-136-minimal-pdf",
      rendererProfileId: "pdf-spike-profile-v1",
      measurementProfileId: "approximate-test-profile",
      plan,
    })

    expect(result).toMatchObject({
      source: FLOWDOC_PDF_RENDERER_SPIKE_SOURCE,
      mode: FLOWDOC_PDF_RENDERER_SPIKE_MODE,
      status: "rendered",
      spikeId: "phase-136-minimal-pdf",
      renderContract: {
        consumes: "vnext-pdf-renderer-adapter-plan",
        output: "minimal-pdf-bytes",
        dependencyFree: true,
        textOnly: true,
        productionFidelity: false,
        storageWrites: false,
      },
      blockingIssues: [],
      warningIssues: [],
    })
    expect(result.bytes).not.toBeNull()
    expect(Buffer.from(result.bytes!).toString("utf8", 0, 8)).toBe("%PDF-1.4")
    expect(Buffer.from(result.bytes!).toString("utf8")).toContain("Minimal PDF artifact")
    expect(result.artifact).toMatchObject({
      artifactId: "pdf-spike:phase-136-minimal-pdf",
      format: "pdf",
      mediaType: "application/pdf",
      byteLength: result.bytes!.byteLength,
      sha256: createHash("sha256").update(result.bytes!).digest("hex"),
      storageStatus: "not-stored",
      localOnly: true,
      rendererProfileId: "pdf-spike-profile-v1",
      measurementProfileId: "approximate-test-profile",
    })
    expect(result.summary).toMatchObject({
      pageCount: plan.pageCount,
      textCommandCount: plan.summary.textCommandCount,
      byteLength: result.bytes!.byteLength,
    })
  })

  it("blocks unsafe or non-text PDF spike inputs", () => {
    const plan = readyPdfPlan()
    const blockedPlan: VNextPdfRendererAdapterPlan = {
      ...plan,
      status: "blocked",
      drawCommands: plan.drawCommands.filter((command) => command.operation !== "draw-text"),
      blockingIssues: [{
        severity: "blocking",
        code: "invalid-fragment-geometry",
        sectionId: "section-main",
        nodeId: "body",
        fragmentId: "body-fragment",
        pageIndex: 0,
        message: "blocked for test",
      }],
    }
    const result = renderFlowDocMinimalPdfArtifact({
      spikeId: "blocked-pdf",
      rendererProfileId: "pdf-spike-profile-v1",
      measurementProfileId: "approximate-test-profile",
      plan: blockedPlan,
      pageSizePt: {
        widthPt: 0,
        heightPt: 0,
      },
      bindProductionRenderer: true,
    })

    expect(result.status).toBe("blocked")
    expect(result.bytes).toBeNull()
    expect(result.artifact).toBeNull()
    expect(result.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "production-binding" }),
      expect.objectContaining({ code: "pdf-plan-blocked" }),
      expect.objectContaining({ code: "missing-text-commands" }),
      expect.objectContaining({ code: "invalid-page-size" }),
    ]))
  })

  it("keeps the PDF spike external and dependency-free", () => {
    const source = readText("packages/pdf-renderer-spike/src/index.ts")
    const packageJson = readText("packages/pdf-renderer-spike/package.json")
    const corePackageJson = readText("package.json")
    const coreIndex = readText("src/index.ts")

    expect(packageJson).toContain('"@flowdoc/vnext-core"')
    expect(packageJson).not.toMatch(/pdfkit|pdf-lib|jspdf|canvas|puppeteer|playwright/)
    expect(source).toContain('from "@flowdoc/vnext-core"')
    expect(source).toContain("import type")
    expect(source).not.toMatch(/from\s+["'](?:pdfkit|pdf-lib|jspdf|canvas|puppeteer|playwright)["']/)
    expect(source).not.toMatch(/require\(["'](?:pdfkit|pdf-lib|jspdf|canvas|puppeteer|playwright)["']\)/)
    expect(corePackageJson).not.toMatch(/pdfkit|pdf-lib|jspdf/)
    expect(coreIndex).not.toContain("pdf-renderer-spike")
    expect(coreIndex).not.toContain("FLOWDOC_PDF_RENDERER_SPIKE")
  })

  it("documents Phase 136 and the remaining production PDF gap", () => {
    const boundaryDoc = readText("docs/PDF_RENDERER_SPIKE_PACKAGE_BOUNDARY.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 136 external minimal PDF artifact spike package.")
    expect(boundaryDoc).toContain("minimal text-only PDF bytes")
    expect(boundaryDoc).toContain("not production fidelity")
    expect(readme).toContain("PDF renderer spike package boundary")
    expect(readme).toContain("docs/PDF_RENDERER_SPIKE_PACKAGE_BOUNDARY.md")
    expect(ledger).toContain("| 136 | External minimal PDF artifact spike package | done |")
    expect(roadmap).toContain("## Phase 136: External Minimal PDF Artifact Spike Package")
  })
})
