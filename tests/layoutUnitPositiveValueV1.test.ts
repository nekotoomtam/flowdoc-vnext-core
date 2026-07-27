import { describe, expect, it } from "vitest"
import { convertVNextPositiveUnitValueToLayoutUnitV1 } from "../src/index.js"

describe("positive authored UnitValue conversion", () => {
  it("converts pt and mm with one final layout-unit rounding", () => {
    expect(convertVNextPositiveUnitValueToLayoutUnitV1(
      { value: 12.5, unit: "pt" },
      "frame.width",
    )).toMatchObject({ status: "accepted", layoutUnit: 12_500_000, issues: [] })
    expect(convertVNextPositiveUnitValueToLayoutUnitV1(
      { value: 25.4, unit: "mm" },
      "frame.height",
    )).toMatchObject({ status: "accepted", layoutUnit: 72_000_000, issues: [] })
  })

  it.each([
    [{ value: 0, unit: "pt" }, "invalid-positive-unit-value"],
    [{ value: -1, unit: "mm" }, "invalid-positive-unit-value"],
    [{ value: Number.POSITIVE_INFINITY, unit: "pt" }, "invalid-positive-unit-value"],
    [{ value: 1, unit: "px" }, "invalid-positive-unit-value"],
  ])("blocks invalid image dimensions", (value, code) => {
    expect(convertVNextPositiveUnitValueToLayoutUnitV1(value, "frame.width"))
      .toMatchObject({ status: "blocked", issues: [{ code, path: "frame.width" }] })
  })

  it("rejects accessors without invoking them", () => {
    let getterCount = 0
    const value = Object.create(null)
    Object.defineProperty(value, "value", {
      enumerable: true,
      get() {
        getterCount += 1
        return 10
      },
    })
    Object.defineProperty(value, "unit", {
      enumerable: true,
      value: "pt",
    })
    expect(convertVNextPositiveUnitValueToLayoutUnitV1(value, "frame.width"))
      .toMatchObject({ status: "blocked", issues: [{ code: "invalid-positive-unit-value" }] })
    expect(getterCount).toBe(0)
  })
})
