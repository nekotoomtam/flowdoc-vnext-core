import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createV4IntegratedStressSmokeBundle,
  runV4IntegratedStressSmoke,
} from "./helpers/v4IntegratedStressSmoke.js"

describe("v4 integrated document stress smoke", () => {
  it("runs real public lane contracts while preserving explicit integration blockers", () => {
    const bundle = createV4IntegratedStressSmokeBundle()
    const before = JSON.stringify(bundle)
    const first = runV4IntegratedStressSmoke(bundle)
    const second = runV4IntegratedStressSmoke(bundle)

    expect(first).toMatchObject({
      profileId: "integrated-v4-stress-v1",
      lanes: {
        structure: { capability: "executable", status: "valid" },
        text: { capability: "executable", status: "paginated" },
        columns: { capability: "executable", status: "paginated" },
        table: { capability: "executable", status: "paginated" },
        tableRendererFacts: { capability: "contract-only", status: "consumable" },
        toc: {
          capability: "contract-only", status: "resolved",
          previewReadiness: "ready", artifactReadiness: "blocked",
          syntheticHeadingPageMap: true,
        },
      },
      blockers: [
        "mixed-body-composition",
        "whole-document-heading-page-map-production",
        "field-backed-toc-label-materialization",
        "integrated-renderer-artifact",
        "backend-stress-orchestration-persistence",
        "editor-integrated-stress-ui",
      ],
      integratedPageCount: null,
      contracts: {
        canonicalMutation: false, mixedComposition: "not-run",
        integratedRendering: "not-run", persistence: "not-run",
      },
    })
    expect(JSON.stringify(second)).toBe(JSON.stringify(first))
    expect(JSON.stringify(bundle)).toBe(before)
  })

  it("retains shared document identities across independently executable lanes", () => {
    const result = runV4IntegratedStressSmoke(createV4IntegratedStressSmokeBundle())
    expect(result.lanes.structure.summary.nodeCount).toBeGreaterThan(0)
    expect(result.lanes.text.summary?.lineCount).toBe(4)
    expect(result.lanes.columns.summary?.pageCount).toBeGreaterThan(0)
    expect(result.lanes.table.summary.pageCount).toBeGreaterThan(0)
    expect(result.lanes.toc.syntheticHeadingPageMap).toBe(true)
    expect(result.integratedPageCount).toBeNull()
  })

  it("keeps Phase 360 evidence and boundaries discoverable", () => {
    const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")
    const doc = read("../docs/V4_INTEGRATED_DOCUMENT_STRESS_SMOKE.md")
    expect(doc).toContain("integratedPageCount=null")
    expect(doc).toContain("synthetic-integrated-smoke-pages")
    expect(doc).toContain("## Expected Blockers")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(read("../README.md")).toContain("Phase 360 runs one shared v4 integrated stress smoke bundle")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 360 executes the shared integrated smoke bundle")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 360 V4 Integrated Document Stress Smoke")
  })
})
