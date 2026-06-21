import type { AuthoredNode, ZoneNode } from "../schema/document.js"
import type { NodeId, SectionId } from "../graph/relationshipGraph.js"
import type {
  VNextPageBox,
  VNextPaginationSourceItem,
} from "./paginationPlan.js"
import type {
  VNextMeasuredFragment,
  VNextMeasuredFragmentExtra,
  VNextMeasuredFragmentGeometry,
  VNextMeasuredFragmentKind,
  VNextMeasuredPage,
  VNextMeasuredPaginationWarning,
} from "./measuredTypes.js"

export interface VNextMeasuredPageInput {
  pageIndex: number
  sectionId: SectionId
  sectionPageIndex: number
  pageNumber: number
  pageBox: VNextPageBox
}

export interface VNextMeasuredFragmentBuilderOptions {
  sourceItems: readonly VNextPaginationSourceItem[]
  addWarning: (warning: VNextMeasuredPaginationWarning) => void
}

export interface VNextMeasuredFragmentBuilder {
  addFragment(
    page: VNextMeasuredPage,
    zone: ZoneNode,
    node: AuthoredNode,
    kind: VNextMeasuredFragmentKind,
    geometry: VNextMeasuredFragmentGeometry,
    extra?: VNextMeasuredFragmentExtra,
  ): VNextMeasuredFragment
}

export function vNextPaginationSourceKey(sectionId: SectionId, nodeId: NodeId): string {
  return `${sectionId}:${nodeId}`
}

function sourceItemsByKey(
  sourceItems: readonly VNextPaginationSourceItem[],
): Map<string, VNextPaginationSourceItem> {
  const result = new Map<string, VNextPaginationSourceItem>()

  sourceItems.forEach((sourceItem) => {
    result.set(vNextPaginationSourceKey(sourceItem.sectionId, sourceItem.nodeId), sourceItem)
  })

  return result
}

export function createVNextMeasuredPage(input: VNextMeasuredPageInput): VNextMeasuredPage {
  return {
    pageIndex: input.pageIndex,
    sectionId: input.sectionId,
    sectionPageIndex: input.sectionPageIndex,
    pageNumber: input.pageNumber,
    pageBox: input.pageBox,
    fragments: [],
    bodyFragmentIds: [],
    headerFooterFragmentIds: [],
  }
}

export function createVNextMeasuredFragmentBuilder(
  options: VNextMeasuredFragmentBuilderOptions,
): VNextMeasuredFragmentBuilder {
  const sourceItemLookup = sourceItemsByKey(options.sourceItems)
  let fragmentSequence = 0

  return {
    addFragment(page, zone, node, kind, geometry, extra = {}) {
      const sourceKey = vNextPaginationSourceKey(page.sectionId, node.id)
      const sourceItem = sourceItemLookup.get(sourceKey)

      if (sourceItem == null) {
        options.addWarning({
          code: "missing-source-item",
          sectionId: page.sectionId,
          nodeId: node.id,
          pageIndex: page.pageIndex,
          message: `No pagination source item found for node "${node.id}".`,
        })
      }

      const fragment: VNextMeasuredFragment = {
        id: `${page.sectionId}:${node.id}:fragment-${fragmentSequence}`,
        sourceItemId: sourceItem?.id ?? sourceKey,
        sectionId: page.sectionId,
        zoneId: zone.id,
        zoneRole: zone.role,
        nodeId: node.id,
        nodeType: node.type,
        kind,
        pageIndex: page.pageIndex,
        pageNumber: page.pageNumber,
        xPt: Number(geometry.xPt.toFixed(2)),
        yPt: Number(geometry.yPt.toFixed(2)),
        widthPt: Number(geometry.widthPt.toFixed(2)),
        heightPt: Number(geometry.heightPt.toFixed(2)),
        sourceOrder: sourceItem?.order ?? Number.MAX_SAFE_INTEGER,
        splitPolicy: sourceItem?.splitPolicy ?? "atomic",
        ...extra,
      }
      fragmentSequence += 1
      page.fragments.push(fragment)

      if (zone.role === "body") {
        page.bodyFragmentIds.push(fragment.id)
      } else {
        page.headerFooterFragmentIds.push(fragment.id)
      }

      return fragment
    },
  }
}
