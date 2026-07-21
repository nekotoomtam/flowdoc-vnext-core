import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  convertVNextLayoutUnitToPointV1,
  convertVNextPointToLayoutUnitV1,
  createVNextLayoutUnitPolicyV1,
  scaleVNextFontMetricToLayoutUnitV1,
  VNEXT_LAYOUT_UNITS_PER_POINT,
  VNextLayoutUnitV1Schema,
} from "../src/index.js"

describe("layout unit policy v1", () => {
  it("locks one point to one million signed safe layout units", () => {
    const first = createVNextLayoutUnitPolicyV1()
    const second = createVNextLayoutUnitPolicyV1()

    expect(first).toMatchObject({
      status: "accepted-policy",
      pointUnit: "pt",
      layoutUnit: "micro-point",
      layoutUnitsPerPoint: 1_000_000,
      numericShape: "signed-safe-integer",
      rounding: "half-away-from-zero",
      crossRuntimeComparison: "exact-integer",
      rendererConversion: "divide-once-at-paint-boundary",
      authoredDocumentUnitsChanged: false,
      legacyGeometryMigration: false,
      productionBinding: false,
    })
    expect(VNEXT_LAYOUT_UNITS_PER_POINT).toBe(1_000_000)
    expect(first.fingerprint).toMatch(/^sha256:[a-f0-9]{64}$/)
    expect(second.fingerprint).toBe(first.fingerprint)
    expect(JSON.parse(JSON.stringify(first))).toEqual(first)
  })

  it("converts positive and negative points with symmetric half-away-from-zero rounding", () => {
    expect(convertVNextPointToLayoutUnitV1(12.345678)).toMatchObject({
      status: "accepted",
      layoutUnit: 12_345_678,
    })
    expect(convertVNextPointToLayoutUnitV1(0.0000005)).toMatchObject({
      status: "accepted",
      layoutUnit: 1,
    })
    expect(convertVNextPointToLayoutUnitV1(-0.0000005)).toMatchObject({
      status: "accepted",
      layoutUnit: -1,
    })
    const zero = convertVNextPointToLayoutUnitV1(-0)
    expect(zero).toMatchObject({ status: "accepted", layoutUnit: 0 })
    if (zero.status !== "accepted") throw new Error("negative zero must normalize")
    expect(Object.is(zero.layoutUnit, -0)).toBe(false)
  })

  it("converts validated layout units back to point values only at a consumer boundary", () => {
    expect(convertVNextLayoutUnitToPointV1(12_345_678)).toEqual({
      source: "vnext-layout-unit-policy-v1",
      contractVersion: 1,
      status: "accepted",
      point: 12.345678,
      issues: [],
    })
    expect(convertVNextLayoutUnitToPointV1(-1)).toMatchObject({ status: "accepted", point: -0.000001 })
    expect(convertVNextLayoutUnitToPointV1(1.25)).toMatchObject({
      status: "blocked",
      point: null,
      issues: [expect.objectContaining({ code: "invalid-layout-unit" })],
    })
  })

  it("scales signed font metrics without floating point geometry", () => {
    expect(scaleVNextFontMetricToLayoutUnitV1({
      fontMetric: 600,
      fontSizeLayoutUnit: 12_000_000,
      unitsPerEm: 1_000,
    })).toMatchObject({ status: "accepted", layoutUnit: 7_200_000 })
    expect(scaleVNextFontMetricToLayoutUnitV1({
      fontMetric: 1,
      fontSizeLayoutUnit: 1,
      unitsPerEm: 2,
    })).toMatchObject({ status: "accepted", layoutUnit: 1 })
    expect(scaleVNextFontMetricToLayoutUnitV1({
      fontMetric: -1,
      fontSizeLayoutUnit: 1,
      unitsPerEm: 2,
    })).toMatchObject({ status: "accepted", layoutUnit: -1 })
  })

  it("fails closed on non-finite, unsafe, and invalid font inputs", () => {
    expect(convertVNextPointToLayoutUnitV1(Number.NaN)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "invalid-point-value" })],
    })
    expect(convertVNextPointToLayoutUnitV1(Number.POSITIVE_INFINITY)).toMatchObject({ status: "blocked" })
    expect(convertVNextPointToLayoutUnitV1(Number.MAX_VALUE)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "unsafe-layout-unit" })],
    })
    expect(VNextLayoutUnitV1Schema.safeParse(Number.MAX_SAFE_INTEGER + 1).success).toBe(false)
    expect(scaleVNextFontMetricToLayoutUnitV1({
      fontMetric: Number.MAX_SAFE_INTEGER,
      fontSizeLayoutUnit: 2,
      unitsPerEm: 1,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "unsafe-integer-product" })],
    })
    expect(scaleVNextFontMetricToLayoutUnitV1({
      fontMetric: 600.5,
      fontSizeLayoutUnit: 0,
      unitsPerEm: 0,
    })).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "invalid-font-metric" }),
        expect.objectContaining({ code: "invalid-font-size" }),
        expect.objectContaining({ code: "invalid-units-per-em" }),
      ]),
    })
  })

  it("keeps the policy independent from renderer, engine, storage, and document mutation runtimes", () => {
    const source = readFileSync(resolve(process.cwd(), "src/layout/layoutUnitPolicyV1.ts"), "utf8")

    expect(source).toContain("createVNextLayoutUnitPolicyV1")
    expect(source).toContain("createVNextCompactFingerprint")
    expect(source).not.toMatch(/node:fs|node:http|node:https|fetch\(/)
    expect(source).not.toMatch(/canvas|pdfkit|jspdf|pdf-lib|fontkit/)
    expect(source).not.toMatch(/rustybuzz|harfbuzz|icu4x|wasm-bindgen/)
    expect(source).not.toMatch(/DocumentNode|TextBlockNode|measureVNextText/)
    expect(source).not.toMatch(/writeFile|readFile|localStorage|indexedDB/)
  })

  it("documents the MR1 boundary without claiming external shaping or production activation", () => {
    const doc = readFileSync(resolve(process.cwd(), "docs/LIVE_DRAFT_MR1_LAYOUT_UNIT_POLICY.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const handoff = readFileSync(
      resolve(process.cwd(), "docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md"),
      "utf8",
    )

    expect(doc).toContain("1 point = 1,000,000 layout units")
    expect(doc).toContain("does not")
    expect(doc).toContain("change `measureVNextText(...)`")
    expect(readme).toContain("Live Draft MR1 begins")
    expect(handoff).toContain("LIVE-DRAFT-MR1 Fixed-Point Foundation")
    expect(handoff).toContain("Core-only multi-run layout acceptance contract")
    expect(handoff).toMatch(/external\s+shaping and runtime paint integration remain blocked/u)
  })
})
