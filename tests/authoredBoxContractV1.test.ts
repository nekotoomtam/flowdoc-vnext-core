import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextAuthoredBoxPlanV1,
  projectVNextAuthoredBoxFragmentsV1,
  type AuthoredNodeV4Target,
  type VNextAuthoredBoxPlacementV1,
} from "../src/index.js"

function textNode(box?: Extract<AuthoredNodeV4Target, { type: "text-block" }>["props"]["box"]): Extract<
  AuthoredNodeV4Target,
  { type: "text-block" }
> {
  return {
    id: "box-owner",
    type: "text-block",
    role: { role: "paragraph" },
    props: { textStyleId: "body", ...(box == null ? {} : { box }) },
    children: [{ id: "box-text", type: "text", text: "Measured content" }],
  }
}

function authoredStyle(): NonNullable<ReturnType<typeof textNode>["props"]["box"]> {
  return {
    fill: "eaf1ff",
    padding: {
      top: { value: 4, unit: "pt" },
      right: { value: 10, unit: "pt" },
      bottom: { value: 6, unit: "pt" },
      left: { value: 8, unit: "pt" },
    },
    border: {
      top: { style: "solid", width: { value: 1, unit: "pt" }, color: "112233" },
      right: { style: "dashed", width: { value: 2, unit: "pt" }, color: "223344" },
      bottom: { style: "dotted", width: { value: 1, unit: "pt" }, color: "334455" },
      left: { style: "solid", width: { value: 1, unit: "pt" }, color: "445566" },
    },
  }
}

function placements(): VNextAuthoredBoxPlacementV1[] {
  const containerBounds = { xPt: 50, yPt: 40, widthPt: 200, heightPt: 300 }
  return [
    {
      placementId: "placement-1",
      pageIndex: 0,
      pageNumber: 1,
      containerBounds,
      blockOffsetPt: 10,
      blockExtentPt: 280,
      startsBox: true,
      endsBox: false,
    },
    {
      placementId: "placement-2",
      pageIndex: 1,
      pageNumber: 2,
      containerBounds,
      blockOffsetPt: 5,
      blockExtentPt: 290,
      startsBox: false,
      endsBox: false,
    },
    {
      placementId: "placement-3",
      pageIndex: 2,
      pageNumber: 3,
      containerBounds,
      blockOffsetPt: 5,
      blockExtentPt: 280,
      startsBox: false,
      endsBox: true,
    },
  ]
}

describe("authored box contract v1", () => {
  it("preserves full measurement width when no box is authored", () => {
    const result = createVNextAuthoredBoxPlanV1({ ownerNode: textNode(), availableWidthPt: 200 })
    expect(result.status).toBe("ready")
    if (result.status !== "ready") return
    expect(result.plan).toMatchObject({
      source: "vnext-authored-box-contract",
      contractVersion: 1,
      kind: "authored-box-plan",
      ownerNodeId: "box-owner",
      ownerNodeType: "text-block",
      hasAuthoredBox: false,
      fillColor: null,
      paddingPt: { top: 0, right: 0, bottom: 0, left: 0 },
      outerWidthPt: 200,
      contentInsetPt: { top: 0, right: 0, bottom: 0, left: 0 },
      contentWidthPt: 200,
      pageSplitPolicy: "open-continuation-edges",
    })
    expect(result.plan.border).toEqual({
      top: { style: "none", widthPt: 0, color: "000000" },
      right: { style: "none", widthPt: 0, color: "000000" },
      bottom: { style: "none", widthPt: 0, color: "000000" },
      left: { style: "none", widthPt: 0, color: "000000" },
    })
    expect(createVNextAuthoredBoxPlanV1({ ownerNode: textNode(), availableWidthPt: 200 })).toEqual(result)
  })

  it("normalizes authored fill, padding, borders, and content width", () => {
    const result = createVNextAuthoredBoxPlanV1({
      ownerNode: textNode(authoredStyle()),
      availableWidthPt: 200,
    })
    expect(result.status).toBe("ready")
    if (result.status !== "ready") return
    expect(result.plan).toMatchObject({
      hasAuthoredBox: true,
      fillColor: "EAF1FF",
      paddingPt: { top: 4, right: 10, bottom: 6, left: 8 },
      border: {
        top: { style: "solid", widthPt: 1, color: "112233" },
        right: { style: "dashed", widthPt: 2, color: "223344" },
        bottom: { style: "dotted", widthPt: 1, color: "334455" },
        left: { style: "solid", widthPt: 1, color: "445566" },
      },
      contentInsetPt: { top: 5, right: 12, bottom: 7, left: 9 },
      outerWidthPt: 200,
      contentWidthPt: 179,
    })

    const explicitNone = createVNextAuthoredBoxPlanV1({
      ownerNode: textNode({
        border: {
          top: { style: "none", width: { value: 0, unit: "pt" }, color: "ABCDEF" },
        },
      }),
      availableWidthPt: 200,
    })
    expect(explicitNone.status).toBe("ready")
    if (explicitNone.status === "ready") {
      expect(explicitNone.plan.border.top).toEqual({ style: "none", widthPt: 0, color: "000000" })
    }
  })

  it("normalizes millimetre padding into deterministic point geometry", () => {
    const result = createVNextAuthoredBoxPlanV1({
      ownerNode: textNode({
        padding: {
          top: { value: 12.7, unit: "mm" },
          right: { value: 25.4, unit: "mm" },
          bottom: { value: 6.35, unit: "mm" },
          left: { value: 2.54, unit: "mm" },
        },
      }),
      availableWidthPt: 200,
    })
    expect(result.status).toBe("ready")
    if (result.status !== "ready") return
    expect(result.plan).toMatchObject({
      paddingPt: { top: 36, right: 72, bottom: 18, left: 7.2 },
      contentInsetPt: { top: 36, right: 72, bottom: 18, left: 7.2 },
      contentWidthPt: 120.8,
    })
  })

  it("projects fill and open continuation borders across three pages", () => {
    const planResult = createVNextAuthoredBoxPlanV1({
      ownerNode: textNode(authoredStyle()),
      availableWidthPt: 200,
    })
    expect(planResult.status).toBe("ready")
    if (planResult.status !== "ready") return
    const reorderedBounds = placements()
    reorderedBounds[1].containerBounds = {
      widthPt: 200,
      heightPt: 300,
      yPt: 40,
      xPt: 50,
    }
    const result = projectVNextAuthoredBoxFragmentsV1({
      boxId: "box-group",
      plan: planResult.plan,
      placements: reorderedBounds,
    })
    expect(result.status).toBe("consumable")
    if (result.status !== "consumable") return
    expect(result.summary).toEqual({
      placementCount: 3,
      pageCount: 3,
      fragmentCount: 3,
      fillIntentCount: 3,
      borderIntentCount: 8,
    })
    expect(result.fragments.map((fragment) => ({
      pageNumber: fragment.pageNumber,
      fromPrevious: fragment.continuesFromPreviousPage,
      toNext: fragment.continuesOnNextPage,
      bounds: fragment.bounds,
      contentXPt: fragment.contentXPt,
      contentWidthPt: fragment.contentWidthPt,
      intents: fragment.paintIntents.map((intent) => (
        intent.kind === "fill-rect" ? intent.kind : `${intent.kind}:${intent.edge}`
      )),
    }))).toEqual([
      {
        pageNumber: 1,
        fromPrevious: false,
        toNext: true,
        bounds: { xPt: 50, yPt: 45, widthPt: 200, heightPt: 295 },
        contentXPt: 59,
        contentWidthPt: 179,
        intents: ["fill-rect", "stroke-line:top", "stroke-line:right", "stroke-line:left"],
      },
      {
        pageNumber: 2,
        fromPrevious: true,
        toNext: true,
        bounds: { xPt: 50, yPt: 40, widthPt: 200, heightPt: 300 },
        contentXPt: 59,
        contentWidthPt: 179,
        intents: ["fill-rect", "stroke-line:right", "stroke-line:left"],
      },
      {
        pageNumber: 3,
        fromPrevious: true,
        toNext: false,
        bounds: { xPt: 50, yPt: 40, widthPt: 200, heightPt: 292 },
        contentXPt: 59,
        contentWidthPt: 179,
        intents: ["fill-rect", "stroke-line:right", "stroke-line:bottom", "stroke-line:left"],
      },
    ])
    expect(result.fragments[0].paintIntents[1]).toMatchObject({
      kind: "stroke-line",
      edge: "top",
      bounds: { xPt: 50.5, yPt: 45.5, widthPt: 198.5, heightPt: 0 },
    })
  })

  it("blocks invalid owners, widths, and border semantics", () => {
    const unsupported: AuthoredNodeV4Target = {
      id: "spacer",
      type: "spacer",
      props: { height: 10 },
    }
    const unsupportedResult = createVNextAuthoredBoxPlanV1({ ownerNode: unsupported, availableWidthPt: 100 })
    expect(unsupportedResult.status).toBe("blocked")
    if (unsupportedResult.status === "blocked") {
      expect(unsupportedResult.issues.map((item) => item.code)).toContain("authored-box-owner-unsupported")
    }

    const consumesWidth = authoredStyle()
    consumesWidth.padding = {
      top: { value: 0, unit: "pt" },
      right: { value: 50, unit: "pt" },
      bottom: { value: 0, unit: "pt" },
      left: { value: 50, unit: "pt" },
    }
    const widthResult = createVNextAuthoredBoxPlanV1({
      ownerNode: textNode(consumesWidth),
      availableWidthPt: 100,
    })
    expect(widthResult.status).toBe("blocked")
    if (widthResult.status === "blocked") {
      expect(widthResult.issues.map((item) => item.code)).toContain("authored-box-content-width-nonpositive")
    }

    const invalidBorders = authoredStyle()
    invalidBorders.border = {
      ...invalidBorders.border,
      top: { style: "solid", width: { value: 0, unit: "pt" }, color: "000000" },
      bottom: { style: "none", width: { value: 1, unit: "pt" }, color: "000000" },
    }
    const borderResult = createVNextAuthoredBoxPlanV1({
      ownerNode: textNode(invalidBorders),
      availableWidthPt: 200,
    })
    expect(borderResult.status).toBe("blocked")
    if (borderResult.status === "blocked") expect(borderResult.issues.map((item) => item.code)).toEqual(
      expect.arrayContaining([
        "authored-box-visible-border-width-nonpositive",
        "authored-box-none-border-width-nonzero",
      ]),
    )
  })

  it("blocks missing ownership, page gaps, width drift, and unreserved padding", () => {
    const neutral = createVNextAuthoredBoxPlanV1({ ownerNode: textNode(), availableWidthPt: 200 })
    expect(neutral.status).toBe("ready")
    if (neutral.status !== "ready") return
    const missingStyle = projectVNextAuthoredBoxFragmentsV1({
      boxId: "box-group",
      plan: neutral.plan,
      placements: placements(),
    })
    expect(missingStyle.status).toBe("blocked")
    if (missingStyle.status === "blocked") {
      expect(missingStyle.issues.map((item) => item.code)).toContain("authored-box-style-missing")
    }

    const plan = createVNextAuthoredBoxPlanV1({ ownerNode: textNode(authoredStyle()), availableWidthPt: 200 })
    expect(plan.status).toBe("ready")
    if (plan.status !== "ready") return
    const widthDrift = placements()
    widthDrift[1] = {
      ...widthDrift[1],
      containerBounds: { ...widthDrift[1].containerBounds, widthPt: 199 },
    }
    const widthResult = projectVNextAuthoredBoxFragmentsV1({
      boxId: "box-group",
      plan: plan.plan,
      placements: widthDrift,
    })
    expect(widthResult.status).toBe("blocked")
    if (widthResult.status === "blocked") {
      expect(widthResult.issues.map((item) => item.code)).toContain("authored-box-container-width-mismatch")
    }

    const invalidBoundary = placements()
    invalidBoundary[1] = { ...invalidBoundary[1], pageIndex: 2, pageNumber: 3 }
    invalidBoundary[2] = { ...invalidBoundary[2], pageIndex: 3, pageNumber: 4, endsBox: false }
    const boundaryResult = projectVNextAuthoredBoxFragmentsV1({
      boxId: "box-group",
      plan: plan.plan,
      placements: invalidBoundary,
    })
    expect(boundaryResult.status).toBe("blocked")
    if (boundaryResult.status === "blocked") expect(boundaryResult.issues.map((item) => item.code)).toEqual(
      expect.arrayContaining(["authored-box-end-boundary-invalid", "authored-box-page-gap"]),
    )

    const pageNumberDrift = [
      { ...placements()[0], blockExtentPt: 40 },
      {
        ...placements()[0],
        placementId: "placement-2",
        pageNumber: 2,
        blockOffsetPt: 60,
        blockExtentPt: 40,
        startsBox: false,
        endsBox: true,
      },
    ]
    const pageNumberResult = projectVNextAuthoredBoxFragmentsV1({
      boxId: "box-group",
      plan: plan.plan,
      placements: pageNumberDrift,
    })
    expect(pageNumberResult.status).toBe("blocked")
    if (pageNumberResult.status === "blocked") {
      expect(pageNumberResult.issues.map((item) => item.code)).toContain("authored-box-page-number-mismatch")
    }

    const unreserved = placements().slice(0, 1).map((placement) => ({
      ...placement,
      blockOffsetPt: 2,
      blockExtentPt: 295,
      endsBox: true,
    }))
    const reserveResult = projectVNextAuthoredBoxFragmentsV1({
      boxId: "box-group",
      plan: plan.plan,
      placements: unreserved,
    })
    expect(reserveResult.status).toBe("blocked")
    if (reserveResult.status === "blocked") expect(reserveResult.issues.map((item) => item.code)).toEqual(
      expect.arrayContaining([
        "authored-box-leading-reserve-insufficient",
        "authored-box-trailing-reserve-insufficient",
      ]),
    )
  })

  it("keeps semantic grouping policy outside the reusable Core contract", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/renderer/authoredBoxContractV1.ts"),
      "utf8",
    )
    expect(source).not.toMatch(/callout|reader-label|reader-summary/u)
    expect(source).toContain('pageSplitPolicy: "open-continuation-edges"')
    expect(source).toContain("projectVNextAuthoredBoxFragmentsV1")
  })
})
