import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { AuthoredNode, DocumentNode, TextBlockRole } from "../src/schema/document.js"
import {
  createVNextLayoutPipelinePlan,
  runVNextPausableLayoutJobEngineChunk,
  VNEXT_PAUSABLE_LAYOUT_JOB_ENGINE_MODE,
  VNEXT_PAUSABLE_LAYOUT_JOB_ENGINE_SOURCE,
  type VNextPausableLayoutJobEngineCursor,
} from "../src/index.js"

function pt(value: number) {
  return { value, unit: "pt" as const }
}

function textBlock(id: string, text: string, role: TextBlockRole = { role: "paragraph" }): AuthoredNode {
  return {
    id,
    type: "text-block",
    role,
    props: {},
    children: [{ id: `${id}-text`, type: "text", text }],
  }
}

function engineDoc(blockCount = 5): DocumentNode {
  const blockIds = Array.from({ length: blockCount }, (_, index) => `block-${index}`)

  return {
    version: 3,
    document: {
      id: "layout-job-engine-doc",
      meta: { title: "Layout Job Engine" },
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
          "body-zone": { id: "body-zone", type: "zone", role: "body", childIds: blockIds },
          ...Object.fromEntries(blockIds.map((id, index) => [
            id,
            textBlock(id, `${index}: ${"x".repeat(80)}`),
          ])),
        },
      }],
    },
  }
}

describe("vNext pausable layout job engine boundary", () => {
  it("advances layout pipeline jobs through bounded resumable chunks", () => {
    const plan = createVNextLayoutPipelinePlan(engineDoc(5))
    const chunks: ReturnType<typeof runVNextPausableLayoutJobEngineChunk>[] = []
    const completedJobIds: string[] = []
    let cursor: VNextPausableLayoutJobEngineCursor | null = null

    for (let guard = 0; guard < 10; guard += 1) {
      const chunk = runVNextPausableLayoutJobEngineChunk(plan, {
        cursor: cursor ?? undefined,
        maxJobs: 2,
      })
      chunks.push(chunk)
      chunk.results.forEach((result) => completedJobIds.push(result.jobId))
      cursor = chunk.nextCursor
      if (cursor == null) break
    }

    expect(chunks[0]).toMatchObject({
      source: VNEXT_PAUSABLE_LAYOUT_JOB_ENGINE_SOURCE,
      mode: VNEXT_PAUSABLE_LAYOUT_JOB_ENGINE_MODE,
      status: "partial",
      planDocumentId: "layout-job-engine-doc",
      engineContract: {
        consumes: "vnext-layout-pipeline-plan",
        produces: "layout-job-results",
        executesConcreteLayout: false,
        mayRelayoutDocument: false,
        mutatesDocument: false,
        storesCursor: false,
      },
      jobOffset: 0,
      jobCount: 2,
      totalJobCount: plan.totalJobCount,
    })
    expect(chunks[0].results.map((result) => [result.sourceItemId, result.output])).toEqual([
      ["section-main:body-zone", "pagination-job-recorded"],
      ["section-main:block-0", "measurement-job-recorded"],
    ])
    expect(chunks.at(-1)?.status).toBe("complete")
    expect(chunks.at(-1)?.nextCursor).toBeNull()
    expect(completedJobIds).toEqual(plan.jobs.map((job) => job.id))
    expect(chunks.every((chunk) => chunk.jobCount <= 2)).toBe(true)
    expect(JSON.parse(JSON.stringify(chunks[0]))).toEqual(chunks[0])
  })

  it("blocks when a resumed cursor skips dependency completion", () => {
    const plan = createVNextLayoutPipelinePlan(engineDoc(2))
    const chunk = runVNextPausableLayoutJobEngineChunk(plan, {
      cursor: {
        jobOffset: 1,
        completedSourceItemIds: [],
      },
      maxJobs: 1,
    })

    expect(chunk).toMatchObject({
      status: "blocked",
      jobOffset: 1,
      jobCount: 0,
      blockingIssues: [{
        severity: "blocking",
        code: "unsatisfied-dependency",
        jobId: "layout-job:section-main:block-0",
        sourceItemId: "section-main:block-0",
        missingSourceItemIds: ["section-main:body-zone"],
      }],
      nextCursor: {
        jobOffset: 1,
        completedSourceItemIds: [],
      },
    })
  })

  it("keeps the pausable job engine independent from concrete pagination, renderers, DOM, storage, and documents", () => {
    const sourceUrl = new URL("../src/pagination/layoutJobEngine.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).toContain("VNextLayoutPipelinePlan")
    expect(source).toContain("executesConcreteLayout: false")
    expect(source).toContain("mayRelayoutDocument: false")
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/pdfkit|jspdf|pdf-lib|officegen|pizzip|mammoth|canvas|puppeteer|playwright/)
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

  it("documents the pausable layout job engine boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/PAUSABLE_LAYOUT_JOB_ENGINE_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 96 implementation boundary.")
    expect(boundaryDoc).toContain("src/pagination/layoutJobEngine.ts")
    expect(boundaryDoc).toContain("This is a pausable layout job engine boundary.")
    expect(boundaryDoc).toContain("It is not a concrete layout execution engine.")
    expect(boundaryDoc).toContain("executesConcreteLayout = `false`")
    expect(readme).toContain("Pausable layout job engine boundary")
    expect(readme).toContain("docs/PAUSABLE_LAYOUT_JOB_ENGINE_BOUNDARY.md")
    expect(ledger).toContain("| 96 | Pausable layout job engine | done |")
    expect(roadmap).toContain("## Phase 96: Pausable Layout Job Engine")
  })
})
