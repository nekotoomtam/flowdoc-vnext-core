import { describe, expect, it } from "vitest"
import type { AuthoredNode, ZoneNode } from "../src/schema/document.js"
import type { VNextPaginationSourceItem } from "../src/pagination/paginationPlan.js"
import {
  createVNextMeasuredFragmentBuilder,
  createVNextMeasuredPage,
  vNextPaginationSourceKey,
} from "../src/pagination/measuredFragments.js"
import type { VNextMeasuredPaginationWarning } from "../src/pagination/measuredTypes.js"

const pageBox = {
  size: "A4" as const,
  orientation: "portrait" as const,
  widthPt: 595.28,
  heightPt: 841.89,
  marginPt: { top: 72, right: 72, bottom: 72, left: 72 },
  headerReservedPt: 0,
  footerReservedPt: 0,
  headerFooterHorizontalMode: "body" as const,
  contentXPt: 72,
  contentYPt: 72,
  contentWidthPt: 451.28,
  contentHeightPt: 697.89,
}

const zone: ZoneNode = {
  id: "body-zone",
  type: "zone",
  role: "body",
  childIds: ["text"],
}

const textNode: AuthoredNode = {
  id: "text",
  type: "text-block",
  role: { role: "paragraph" },
  props: {},
  children: [{ id: "text-run", type: "text", text: "Hello" }],
}

const sourceItem: VNextPaginationSourceItem = {
  id: "section-main:text",
  sectionId: "section-main",
  zoneId: "body-zone",
  nodeId: "text",
  nodeType: "text-block",
  parentNodeId: "body-zone",
  order: 7,
  depth: 1,
  operationSurface: "block",
  splitPolicy: "line",
  nearest: {
    blockId: "text",
    textBlockId: "text",
    columnsId: null,
    columnId: null,
    tableId: null,
    tableRowId: null,
    tableCellId: null,
  },
}

describe("vNext measured fragment builder", () => {
  it("creates measured pages with stable empty fragment buckets", () => {
    const page = createVNextMeasuredPage({
      pageIndex: 2,
      sectionId: "section-main",
      sectionPageIndex: 1,
      pageNumber: 9,
      pageBox,
    })

    expect(page).toMatchObject({
      pageIndex: 2,
      sectionId: "section-main",
      sectionPageIndex: 1,
      pageNumber: 9,
      pageBox,
      fragments: [],
      bodyFragmentIds: [],
      headerFooterFragmentIds: [],
    })
  })

  it("appends fragments using pagination source metadata", () => {
    const warnings: VNextMeasuredPaginationWarning[] = []
    const page = createVNextMeasuredPage({
      pageIndex: 0,
      sectionId: "section-main",
      sectionPageIndex: 0,
      pageNumber: 1,
      pageBox,
    })
    const builder = createVNextMeasuredFragmentBuilder({
      sourceItems: [sourceItem],
      addWarning: (warning) => warnings.push(warning),
    })

    const fragment = builder.addFragment(
      page,
      zone,
      textNode,
      "text",
      { xPt: 72.1234, yPt: 80.5678, widthPt: 100.456, heightPt: 20.789 },
      { text: "Hello", lineStart: 0, lineEnd: 1 },
    )

    expect(fragment).toMatchObject({
      id: "section-main:text:fragment-0",
      sourceItemId: "section-main:text",
      sourceOrder: 7,
      splitPolicy: "line",
      xPt: 72.12,
      yPt: 80.57,
      widthPt: 100.46,
      heightPt: 20.79,
      text: "Hello",
      lineStart: 0,
      lineEnd: 1,
    })
    expect(page.bodyFragmentIds).toEqual(["section-main:text:fragment-0"])
    expect(page.headerFooterFragmentIds).toEqual([])
    expect(warnings).toEqual([])
  })

  it("records missing source item warnings without dropping the fragment", () => {
    const warnings: VNextMeasuredPaginationWarning[] = []
    const page = createVNextMeasuredPage({
      pageIndex: 0,
      sectionId: "section-main",
      sectionPageIndex: 0,
      pageNumber: 1,
      pageBox,
    })
    const builder = createVNextMeasuredFragmentBuilder({
      sourceItems: [],
      addWarning: (warning) => warnings.push(warning),
    })

    const fragment = builder.addFragment(page, zone, textNode, "text", {
      xPt: 72,
      yPt: 80,
      widthPt: 100,
      heightPt: 20,
    })

    expect(fragment).toMatchObject({
      sourceItemId: vNextPaginationSourceKey("section-main", "text"),
      sourceOrder: Number.MAX_SAFE_INTEGER,
      splitPolicy: "atomic",
    })
    expect(warnings).toEqual([expect.objectContaining({
      code: "missing-source-item",
      sectionId: "section-main",
      nodeId: "text",
      pageIndex: 0,
    })])
  })
})
