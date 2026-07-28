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

  for (const [trapName, hostileReflectionTrap] of [
    ["getPrototypeOf", {
      getPrototypeOf() {
        throw new Error("hostile getPrototypeOf trap")
      },
    }],
    ["ownKeys", {
      ownKeys() {
        throw new Error("hostile ownKeys trap")
      },
    }],
    ["getOwnPropertyDescriptor", {
      getOwnPropertyDescriptor() {
        throw new Error("hostile getOwnPropertyDescriptor trap")
      },
    }],
  ] satisfies readonly (readonly [string, ProxyHandler<object>])[]) {
    it(`blocks a Proxy whose ${trapName} reflection trap throws without invoking value access`, () => {
      let getterCount = 0
      const target = Object.create(null)
      Object.defineProperty(target, "value", {
        enumerable: true,
        get() {
          getterCount += 1
          return 10
        },
      })
      Object.defineProperty(target, "unit", {
        enumerable: true,
        value: "pt",
      })
      const value = new Proxy(target, {
        ...hostileReflectionTrap,
        get() {
          throw new Error("direct value access")
        },
      })

      expect(convertVNextPositiveUnitValueToLayoutUnitV1(value, "frame.width"))
        .toMatchObject({
          status: "blocked",
          layoutUnit: null,
          issues: [{
            code: "invalid-positive-unit-value",
            path: "frame.width",
          }],
        })
      expect(getterCount).toBe(0)
    })
  }
})
