import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  evaluateVNextVerticalSliceMeasurementGate,
  VNEXT_VERTICAL_SLICE_MEASUREMENT_GATE_MODE,
  VNEXT_VERTICAL_SLICE_MEASUREMENT_GATE_SOURCE,
  type VNextVerticalSliceMeasurementGateInput,
} from "../src/index.js"

function input(overrides: Partial<VNextVerticalSliceMeasurementGateInput> = {}): VNextVerticalSliceMeasurementGateInput {
  return {
    measurementProfileId: "measurement-profile-v1:rc",
    rendererProfileId: "pdf-spike-profile-v1",
    rendererBacked: {
      measurementProfileId: "measurement-profile-v1:rc",
      lineBoxCount: 2,
      widthPt: 240,
      heightPt: 28,
    },
    approximate: {
      measurementProfileId: "measurement-profile-v1:rc",
      lineBoxCount: 2,
      widthPt: 239.5,
      heightPt: 28,
    },
    runtime: {
      digestStatus: "present",
      nativeWasmParityStatus: "matched",
    },
    tolerance: {
      maxWidthDriftPt: 1,
      maxHeightDriftPt: 1,
      maxLineCountDrift: 0,
      overTolerance: "warning",
    },
    ...overrides,
  }
}

describe("vertical slice measurement gate", () => {
  it("accepts matching renderer-backed and approximate summaries inside tolerance", () => {
    const result = evaluateVNextVerticalSliceMeasurementGate(input())

    expect(result).toMatchObject({
      source: VNEXT_VERTICAL_SLICE_MEASUREMENT_GATE_SOURCE,
      mode: VNEXT_VERTICAL_SLICE_MEASUREMENT_GATE_MODE,
      status: "accepted",
      issues: [],
      summary: {
        status: "accepted",
        measurementProfileId: "measurement-profile-v1:rc",
        rendererProfileId: "pdf-spike-profile-v1",
        lineBoxCount: 2,
        widthDriftPt: 0.5,
        heightDriftPt: 0,
        lineCountDrift: 0,
        digestStatus: "present",
        nativeWasmParityStatus: "matched",
      },
      contracts: {
        summaryOnly: true,
        defaultMeasurementReplacement: false,
        productionBinding: false,
        externalPackageImports: false,
        rendererExecution: false,
        paginationMutation: false,
        packageSchemaChange: false,
      },
    })
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it("blocks wrong measurementProfileId and missing line boxes", () => {
    const result = evaluateVNextVerticalSliceMeasurementGate(input({
      rendererBacked: {
        measurementProfileId: "other-profile",
        lineBoxCount: 0,
        widthPt: 240,
        heightPt: 28,
      },
      approximate: {
        measurementProfileId: "measurement-profile-v1:rc",
        lineBoxCount: 0,
        widthPt: 240,
        heightPt: 28,
      },
    }))

    expect(result.status).toBe("blocked")
    expect(result.summary.status).toBe("blocked")
    expect(result.summary.lineBoxCount).toBeNull()
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ severity: "blocking", code: "renderer-backed-profile-mismatch" }),
      expect.objectContaining({ severity: "blocking", code: "missing-renderer-backed-line-boxes" }),
      expect.objectContaining({ severity: "blocking", code: "missing-approximate-line-boxes" }),
    ]))
  })

  it("reports drift over tolerance as warning or blocker based on policy", () => {
    const warning = evaluateVNextVerticalSliceMeasurementGate(input({
      rendererBacked: {
        measurementProfileId: "measurement-profile-v1:rc",
        lineBoxCount: 3,
        widthPt: 248,
        heightPt: 35,
      },
    }))
    const blocked = evaluateVNextVerticalSliceMeasurementGate(input({
      rendererBacked: {
        measurementProfileId: "measurement-profile-v1:rc",
        lineBoxCount: 3,
        widthPt: 248,
        heightPt: 35,
      },
      tolerance: {
        maxWidthDriftPt: 1,
        maxHeightDriftPt: 1,
        maxLineCountDrift: 0,
        overTolerance: "blocked",
      },
    }))

    expect(warning.status).toBe("warning")
    expect(warning.summary.status).toBe("warning")
    expect(warning.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ severity: "warning", code: "width-drift-over-tolerance" }),
      expect.objectContaining({ severity: "warning", code: "height-drift-over-tolerance" }),
      expect.objectContaining({ severity: "warning", code: "line-count-drift-over-tolerance" }),
    ]))
    expect(blocked.status).toBe("blocked")
    expect(blocked.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ severity: "blocking", code: "width-drift-over-tolerance" }),
    ]))
  })

  it("keeps missing digest and native/WASM parity visible without hiding them as pass", () => {
    const result = evaluateVNextVerticalSliceMeasurementGate(input({
      runtime: {
        digestStatus: "missing",
        nativeWasmParityStatus: "missing",
      },
    }))

    expect(result.status).toBe("warning")
    expect(result.summary).toMatchObject({
      status: "warning",
      digestStatus: "missing",
      nativeWasmParityStatus: "missing",
    })
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ severity: "warning", code: "digest-not-pinned" }),
      expect.objectContaining({ severity: "warning", code: "native-wasm-parity-not-proved" }),
    ]))
  })

  it("keeps the measurement gate independent from external engines and production binding", () => {
    const source = readFileSync(new URL("../src/generation/verticalSliceMeasurementGate.ts", import.meta.url), "utf8")
    const index = readFileSync(new URL("../src/index.ts", import.meta.url), "utf8")

    expect(source).toContain("defaultMeasurementReplacement: false")
    expect(source).toContain("productionBinding: false")
    expect(source).toContain("rendererExecution: false")
    expect(source).not.toContain("text-engine-rust-wasm")
    expect(source).not.toContain("createVNextRendererBackedTextMeasurer")
    expect(source).not.toContain("measureVNextText(")
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toMatch(/node:fs|node:path|node:http|node:https|express|fastify/)
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("localStorage")
    expect(index).toContain("./generation/verticalSliceMeasurementGate.js")
  })

  it("documents Phase 148 in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/VERTICAL_SLICE_MEASUREMENT_GATE_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 148 RC measurement selection and drift gate.")
    expect(boundaryDoc).toContain("Wrong `measurementProfileId` blocks")
    expect(readme).toContain("Vertical slice measurement gate")
    expect(readme).toContain("docs/VERTICAL_SLICE_MEASUREMENT_GATE_BOUNDARY.md")
    expect(ledger).toContain("| 148 | RC measurement selection and drift gate | done |")
    expect(roadmap).toContain("## Phase 148: RC Measurement Selection And Drift Gate")
  })
})
