import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { runV4IntegratedStressScale } from "./helpers/v4IntegratedStressScale.js"

describe("v4 integrated document stress scale matrix", () => {
  it.each([
    ["medium", { text: 600, columns: 600, table: 100, toc: 100, localPages: 25, tocLocalPages: 15 }],
    ["large", { text: 6_000, columns: 6_000, table: 1_000, toc: 1_000, localPages: 250, tocLocalPages: 143 }],
  ] as const)("runs the %s profile with exact bounded lane work", (profile, expected) => {
    const first = runV4IntegratedStressScale(profile)
    if (profile === "medium") {
      expect(JSON.stringify(runV4IntegratedStressScale(profile))).toBe(JSON.stringify(first))
    }
    expect(first).toMatchObject({
      workload: {
        textLineCount: expected.text,
        columnsFragmentCount: expected.columns,
        tableBodyRowCount: expected.table,
        tocHeadingCount: expected.toc,
      },
      lanes: {
        text: { localPageCount: expected.localPages, lineCount: expected.text, fragmentCount: expected.localPages },
        columns: {
          localPageCount: expected.localPages,
          work: {
            pageAttemptCount: expected.localPages,
            lanePlanCount: expected.localPages * 3,
            nestedPlanCount: expected.localPages * 2,
            checkpointLookupCount: expected.localPages,
            consumedFragmentCount: expected.columns,
            maximumObservedDepth: 3,
          },
        },
        table: {
          localPageCount: expected.localPages, bodyRowCount: expected.table,
          work: {
            pageAttemptCount: expected.localPages,
            rowPlanCount: expected.table + expected.localPages,
            consumedCandidateCount: expected.table + expected.localPages,
            repeatedHeaderRowPlanCount: expected.localPages - 1,
          },
        },
        tableRendererFacts: {
          localPageCount: expected.localPages,
          work: {
            pageVisitCount: expected.localPages,
            rowVisitCount: expected.table + expected.localPages,
            candidateVisitCount: expected.table + expected.localPages,
          },
        },
        toc: {
          localPageCount: expected.tocLocalPages,
          headingCount: expected.toc,
          semanticWork: { sectionVisitCount: 1, nodeVisitCount: expected.toc + 2, entryBuildCount: expected.toc },
          measurementWork: { textMeasurementCount: expected.toc + 2 },
          resolutionWork: {
            entryResolutionCount: expected.toc,
            placementIndexCount: expected.toc,
            headingDestinationIndexCount: expected.toc,
          },
          syntheticHeadingPageMap: true,
        },
      },
      sourceMutationCount: 0,
      integratedPageCount: null,
    })
    expect(first.blockers).toHaveLength(6)
    expect(first.lanes.toc.localPageCount).toBeGreaterThan(0)
    expect(first.lanes.toc.resolutionSerializedBytes).toBeLessThan(expected.toc * 10_000)
  }, 120_000)

  it("keeps Phase 361 scale evidence and the compact fingerprint fix discoverable", () => {
    const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")
    const doc = read("../docs/V4_INTEGRATED_DOCUMENT_STRESS_SCALE_MATRIX.md")
    expect(doc).toContain("about 175 MB")
    expect(doc).toContain("1,000 entry resolutions")
    expect(doc).toContain("integratedPageCount=null")
    expect(doc).toContain("## Fingerprint Boundary")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(read("../README.md")).toContain("Phase 361 executes medium and large integrated workload matrices")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 361 proves bounded medium/large integrated workload evidence")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 361 V4 Integrated Document Stress Scale Matrix")
  })
})
