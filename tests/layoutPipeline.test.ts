import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { AuthoredNode, DocumentNode, TextBlockRole } from "../src/schema/document.js"
import {
  createApproximateVNextTextMeasurer,
  paginateVNextDocument,
} from "../src/pagination/measuredPagination.js"
import {
  createVNextLayoutPipelinePlan,
  runVNextLayoutPipeline,
  runVNextLayoutPipelineChunk,
  type VNextLayoutPipelineCursor,
} from "../src/pagination/layoutPipeline.js"

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

function pipelineDoc(blockCount = 8): DocumentNode {
  const blockIds = Array.from({ length: blockCount }, (_, index) => `block-${index}`)

  return {
    version: 3,
    document: {
      id: "layout-pipeline-doc",
      meta: { title: "Layout Pipeline" },
      sections: [{
        id: "section-main",
        type: "section",
        page: {
          size: "A4",
          orientation: "portrait",
          margin: {
            top: pt(360),
            right: pt(72),
            bottom: pt(360),
            left: pt(72),
          },
        },
        zoneIds: ["body-zone"],
        nodes: {
          "body-zone": { id: "body-zone", type: "zone", role: "body", childIds: blockIds },
          ...Object.fromEntries(blockIds.map((id, index) => [
            id,
            textBlock(id, `${index}: ${"x".repeat(220)}`),
          ])),
        },
      }],
    },
  }
}

describe("vNext layout pipeline", () => {
  it("creates a staged plan with deterministic measurement jobs", () => {
    const plan = createVNextLayoutPipelinePlan(pipelineDoc(3))

    expect(plan).toMatchObject({
      documentId: "layout-pipeline-doc",
      source: "vnext-pagination-plan",
      status: "planned",
      pipelineVersion: 1,
      stages: [
        "plan",
        "measure",
        "paginate",
        "fragment-artifact",
        "renderer-artifact",
        "export-readiness",
      ],
      totalMeasurementJobCount: 3,
    })
    expect(plan.jobs.map((job) => [job.nodeId, job.kind, job.stage])).toEqual([
      ["body-zone", "container-layout", "paginate"],
      ["block-0", "text-measurement", "measure"],
      ["block-1", "text-measurement", "measure"],
      ["block-2", "text-measurement", "measure"],
    ])
    expect(plan.measurementJobs.map((job) => job.dependsOnSourceItemIds)).toEqual([
      ["section-main:body-zone"],
      ["section-main:body-zone"],
      ["section-main:body-zone"],
    ])
  })

  it("resumes measurement work before emitting bounded artifact page chunks", () => {
    const doc = pipelineDoc(9)
    const baseOptions = {
      textMeasurer: createApproximateVNextTextMeasurer({ charWidthPt: 12, lineHeightPt: 24 }),
      measurementProfileId: "layout-pipeline-test",
      maxMeasurementJobs: 4,
      maxArtifactPages: 2,
    }

    const first = runVNextLayoutPipelineChunk(doc, baseOptions)

    expect(first.status).toBe("partial")
    expect(first.measurement).toMatchObject({
      stage: "measure",
      status: "partial",
      offset: 0,
      jobCount: 4,
      totalJobCount: 9,
    })
    expect(first.measurement.results.every((result) => result.status === "scheduled")).toBe(true)
    expect(first.artifact).toBeUndefined()
    expect(first.nextCursor).toEqual({
      measurementJobOffset: 4,
      artifactPageOffset: 0,
    })

    let cursor: VNextLayoutPipelineCursor | null = first.nextCursor
    const chunks = [first]
    const pageIndexes: number[] = []

    for (let guard = 0; cursor != null && guard < 20; guard += 1) {
      const chunk = runVNextLayoutPipelineChunk(doc, {
        ...baseOptions,
        cursor,
      })
      chunks.push(chunk)
      chunk.artifact?.pages.forEach((page) => pageIndexes.push(page.pageIndex))
      cursor = chunk.nextCursor
    }

    const full = paginateVNextDocument(doc, baseOptions)
    const artifactChunks = chunks.filter((chunk) => chunk.artifact != null)
    const lastChunk = chunks.at(-1)

    expect(full.pageCount).toBeGreaterThan(2)
    expect(lastChunk?.status).toBe("complete")
    expect(lastChunk?.nextCursor).toBeNull()
    expect(pageIndexes).toEqual(full.pages.map((page) => page.pageIndex))
    expect(artifactChunks.length).toBeGreaterThan(1)
    expect(artifactChunks.every((chunk) => (
      chunk.artifact != null &&
      chunk.artifact.pageCount <= baseOptions.maxArtifactPages &&
      chunk.artifact.renderCommands.every((command) => (
        command.pageIndex >= chunk.artifact!.pageOffset &&
        command.pageIndex < chunk.artifact!.pageOffset + chunk.artifact!.pageCount
      ))
    ))).toBe(true)
  })

  it("returns a complete pipeline run with renderer and export contracts", () => {
    const doc = pipelineDoc(2)
    const run = runVNextLayoutPipeline(doc, {
      textMeasurer: createApproximateVNextTextMeasurer({ charWidthPt: 12, lineHeightPt: 24 }),
      measurementProfileId: "layout-pipeline-contract",
    })

    expect(run).toMatchObject({
      source: "vnext-layout-pipeline",
      status: "complete",
      pipelineVersion: 1,
      rendererConsumption: {
        rendererContract: {
          consumes: "measured-pagination-fragments",
          requiresAuthoredDocumentForLayout: false,
          mayRelayout: false,
        },
      },
      exportReadiness: {
        rendererContract: {
          pdf: { consumes: "measured-pagination-output", mayRelayout: false },
          docx: { consumes: "measured-pagination-output", mayRelayout: false },
        },
      },
    })
    expect(run.pagination.pageCount).toBeGreaterThan(0)
    expect(run.rendererConsumption.commandCount).toBeGreaterThan(0)
  })

  it("keeps the layout pipeline independent from old runtime names", () => {
    const sourceUrl = new URL("../src/pagination/layoutPipeline.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toContain("flow-row")
    expect(source).not.toContain("flow-stack")
    expect(source).not.toContain("paragraph.split")
  })
})
