import type { DocumentNodeV4Target } from "../schema/documentV4Target.js"
import { validateVNextDocumentV4Structure } from "../schema/documentV4Structure.js"
import {
  createVNextColumnsV4Geometry,
  type VNextColumnsV4Issue,
  type VNextColumnsV4PlannerCapabilities,
} from "./columnsV4Contract.js"
import {
  createVNextColumnsV4TextFragmentSource,
  type VNextColumnsV4KeepPolicy,
} from "./columnsV4Fragments.js"
import type {
  VNextColumnsV4FlowItem,
  VNextColumnsV4NestedInput,
} from "./columnsV4NestedPagination.js"
import type { VNextTextBlockV4MeasuredLinesResult } from "./textBlockV4Measurement.js"

export const VNEXT_COLUMNS_V4_INPUT_BUILDER_SOURCE = "vnext-columns-v4-input-builder"
export const VNEXT_COLUMNS_V4_INPUT_BUILDER_VERSION = 1 as const

export type VNextColumnsV4InputBuildResult =
  | {
      source: typeof VNEXT_COLUMNS_V4_INPUT_BUILDER_SOURCE
      version: typeof VNEXT_COLUMNS_V4_INPUT_BUILDER_VERSION
      status: "ready"
      columns: VNextColumnsV4NestedInput
      issues: []
    }
  | {
      source: typeof VNEXT_COLUMNS_V4_INPUT_BUILDER_SOURCE
      version: typeof VNEXT_COLUMNS_V4_INPUT_BUILDER_VERSION
      status: "blocked"
      columns: null
      issues: VNextColumnsV4Issue[]
    }

function issue(
  code: string,
  path: string,
  message: string,
  columnsId?: string,
  columnId?: string,
): VNextColumnsV4Issue {
  return {
    code,
    path,
    message,
    severity: "error",
    ...(columnsId == null ? {} : { columnsId }),
    ...(columnId == null ? {} : { columnId }),
  }
}

function blocked(issues: VNextColumnsV4Issue[]): VNextColumnsV4InputBuildResult {
  return {
    source: VNEXT_COLUMNS_V4_INPUT_BUILDER_SOURCE,
    version: VNEXT_COLUMNS_V4_INPUT_BUILDER_VERSION,
    status: "blocked",
    columns: null,
    issues,
  }
}

export function createVNextColumnsV4NestedInput(input: {
  document: DocumentNodeV4Target
  sectionId: string
  columnsId: string
  availableWidthPt: number
  capabilities: VNextColumnsV4PlannerCapabilities
  measuredTextByNodeId: Readonly<Record<string, VNextTextBlockV4MeasuredLinesResult>>
  keepPolicyByNodeId?: Readonly<Record<string, VNextColumnsV4KeepPolicy>>
}): VNextColumnsV4InputBuildResult {
  const structure = validateVNextDocumentV4Structure(input.document)
  if (structure.status === "blocked") return blocked(structure.issues.map((item) => issue(
    item.code,
    item.path,
    item.message,
    item.nodeId === input.columnsId ? input.columnsId : undefined,
  )))
  const section = input.document.document.sections.find((candidate) => candidate.id === input.sectionId)
  if (!section) return blocked([issue("section-not-found", "sectionId", `section "${input.sectionId}" was not found`)])

  const build = (columnsId: string, availableWidthPt: number): VNextColumnsV4InputBuildResult => {
    const geometry = createVNextColumnsV4Geometry(input.document, {
      sectionId: input.sectionId,
      columnsId,
      availableWidthPt,
      capabilities: input.capabilities,
    })
    if (geometry.status === "blocked") return blocked(geometry.issues)
    const columnsNode = section.nodes[columnsId]
    if (columnsNode?.type !== "columns") return blocked([issue(
      "columns-not-found", "columnsId", `columns "${columnsId}" was not found`, columnsId,
    )])
    const issues: VNextColumnsV4Issue[] = []
    const lanes = geometry.geometry.tracks.map((track) => {
      const column = section.nodes[track.columnId]
      if (column?.type !== "column") {
        issues.push(issue(
          "invalid-column-reference",
          `columns.${columnsId}.columnIds[${track.columnIndex}]`,
          `column "${track.columnId}" was not found`,
          columnsId,
          track.columnId,
        ))
        return { columnId: track.columnId, items: [] }
      }
      const items: VNextColumnsV4FlowItem[] = []
      column.childIds.forEach((childId, childIndex) => {
        const child = section.nodes[childId]
        if (child?.type === "text-block") {
          const measured = input.measuredTextByNodeId[child.id]
          if (!measured || measured.textBlockId !== child.id) {
            issues.push(issue(
              "missing-text-fragment-source",
              `columns.${columnsId}.columns.${column.id}.childIds[${childIndex}]`,
              `text-block "${child.id}" requires accepted measured lines`,
              columnsId,
              column.id,
            ))
            return
          }
          const fragments = createVNextColumnsV4TextFragmentSource(measured, {
            keepPolicy: input.keepPolicyByNodeId?.[child.id],
          })
          if (fragments.status === "blocked") {
            issues.push(...fragments.issues.map((item) => ({
              ...item,
              columnsId,
              columnId: column.id,
            })))
            return
          }
          items.push({ kind: "fragments", nodeId: child.id, source: fragments.fragmentSource })
          return
        }
        if (child?.type === "columns") {
          const nested = build(child.id, track.widthPt)
          if (nested.status === "blocked") {
            issues.push(...nested.issues)
            return
          }
          items.push({ kind: "columns", nodeId: child.id, columns: nested.columns })
          return
        }
        issues.push(issue(
          "unsupported-columns-child-fragment",
          `columns.${columnsId}.columns.${column.id}.childIds[${childIndex}]`,
          child == null
            ? `column child "${childId}" was not found`
            : `${child.type} "${child.id}" has no accepted v4 Columns fragment contract`,
          columnsId,
          column.id,
        ))
      })
      return { columnId: column.id, items }
    })
    if (issues.length > 0) return blocked(issues)
    return {
      source: VNEXT_COLUMNS_V4_INPUT_BUILDER_SOURCE,
      version: VNEXT_COLUMNS_V4_INPUT_BUILDER_VERSION,
      status: "ready",
      columns: {
        geometry: geometry.geometry,
        lanes,
        ...(columnsNode.props.minHeight == null ? {} : { minimumHeightPt: columnsNode.props.minHeight }),
      },
      issues: [],
    }
  }

  return build(input.columnsId, input.availableWidthPt)
}
