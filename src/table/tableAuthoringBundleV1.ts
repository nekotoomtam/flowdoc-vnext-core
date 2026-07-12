import {
  evaluateVNextEffectiveNodeCapabilityV1,
  resolveVNextStructurePolicyV1,
  type VNextStructurePolicyNodeAction,
} from "../lifecycle/structurePolicy.js"
import { validateVNextDocumentV4Structure } from "../schema/documentV4Structure.js"
import {
  VNEXT_TABLE_AUTHORING_SOURCE,
  VNEXT_TABLE_AUTHORING_VERSION,
  VNextTableAuthoringBundleV1Schema,
  type VNextTableAuthoringBundleAssessmentV1,
  type VNextTableAuthoringCapabilityV1,
  type VNextTableAuthoringIssueV1,
  type VNextTableAuthoringUnsupportedCapabilityV1,
} from "./tableAuthoringContractV1.js"

const TABLE_ACTIONS = [
  "table.row.insert",
  "table.row.delete",
  "table.row.reorder",
  "table.column.insert",
  "table.column.delete",
  "table.column.resize",
  "table.cell.vertical-align.patch",
] as const satisfies readonly VNextStructurePolicyNodeAction[]

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function path(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, part) => typeof part === "number"
    ? `${current}[${part}]`
    : current === "" ? String(part) : `${current}.${String(part)}`, "")
}

function issue(code: string, pathValue: string, message: string, facts: Partial<VNextTableAuthoringIssueV1> = {}): VNextTableAuthoringIssueV1 {
  return { code, path: pathValue, message, severity: "error", ...facts }
}

function blocked(issues: VNextTableAuthoringIssueV1[]): VNextTableAuthoringBundleAssessmentV1 {
  return {
    source: VNEXT_TABLE_AUTHORING_SOURCE,
    contractVersion: VNEXT_TABLE_AUTHORING_VERSION,
    status: "blocked",
    bundle: null,
    issues,
  }
}

function sameDraft(
  left: { structureId: string; draftId: string; revision: number },
  right: { structureId: string; draftId: string; revision: number },
): boolean {
  return left.structureId === right.structureId
    && left.draftId === right.draftId
    && left.revision === right.revision
}

const unsupportedCapabilities: VNextTableAuthoringUnsupportedCapabilityV1[] = [
  { capability: "collection-source.insert", allowed: false, reason: "field-binding-contract-edit-required" },
  { capability: "collection-source.delete", allowed: false, reason: "field-binding-contract-edit-required" },
  { capability: "table.cells.merge", allowed: false, reason: "canonical-colspan-integration-required" },
  { capability: "table.cell.split", allowed: false, reason: "canonical-colspan-integration-required" },
  { capability: "table.row-span", allowed: false, reason: "row-group-synchronization-v2-required" },
  { capability: "table.cross-owner-move", allowed: false, reason: "ownership-provenance-contract-required" },
]

export function assessVNextTableAuthoringBundleV1(value: unknown): VNextTableAuthoringBundleAssessmentV1 {
  const parsed = VNextTableAuthoringBundleV1Schema.safeParse(value)
  if (!parsed.success) return blocked(parsed.error.issues.map((item) => issue(
    item.code, path(item.path), item.message,
  )))
  const input = parsed.data
  const issues: VNextTableAuthoringIssueV1[] = []
  const structure = validateVNextDocumentV4Structure(input.document)
  issues.push(...structure.issues.map((item) => issue(
    item.code, `document.${item.path}`, item.message, {
      ...(item.nodeId == null ? {} : { rowId: item.nodeId }),
    },
  )))
  if (input.definition.owner.kind !== "structure-draft" || !sameDraft(input.definition.owner.ref, input.artifact)) {
    issues.push(issue(
      "definition-owner-mismatch", "definition.owner",
      "Table Definition must belong to the exact Structure Definition Draft revision",
      { tableId: input.definition.tableId },
    ))
  }
  if (input.policySet.owner.kind !== "structure-definition-draft" || !sameDraft(input.policySet.owner.ref, input.artifact)) {
    issues.push(issue(
      "policy-owner-mismatch", "policySet.owner",
      "Table authoring policy must belong to the exact Structure Definition Draft revision",
      { tableId: input.definition.tableId },
    ))
  }

  const matches = input.document.document.sections.flatMap((section) => {
    const node = section.nodes[input.definition.tableId]
    return node?.type === "table" ? [{ section, table: node }] : []
  })
  if (matches.length !== 1) issues.push(issue(
    "table-owner-not-unique", "definition.tableId",
    "Table Definition tableId must resolve to exactly one authored Table",
    { tableId: input.definition.tableId },
  ))
  if (issues.length > 0 || matches.length !== 1) return blocked(issues)
  const { section, table } = matches[0]
  if (table.columns.length !== input.definition.columns.length) issues.push(issue(
    "column-count-mismatch", "definition.columns",
    `semantic column count ${input.definition.columns.length} does not match authored count ${table.columns.length}`,
    { tableId: table.id },
  ))

  let cellVisitCount = 0
  const referencedTemplates = input.definition.rowSources.map((source) => source.rowTemplateId)
  if (new Set(referencedTemplates).size !== referencedTemplates.length
    || referencedTemplates.length !== Object.keys(input.definition.rowTemplates).length) issues.push(issue(
    "row-template-profile-unsupported", "definition.rowSources",
    "authoring v1 requires each row source to own one unique row template and every template to be a row source",
    { tableId: table.id },
  ))
  const expectedRowIds: string[] = []
  input.definition.rowSources.forEach((source, sourceIndex) => {
    const template = input.definition.rowTemplates[source.rowTemplateId]
    if (template == null) return
    expectedRowIds.push(template.sourceRowId)
    const row = section.nodes[template.sourceRowId]
    if (row?.type !== "table-row" || !table.rowIds.includes(template.sourceRowId)) {
      issues.push(issue(
        "source-row-owner-mismatch", `definition.rowSources[${sourceIndex}]`,
        `row template source "${template.sourceRowId}" must be an authored row of Table "${table.id}"`,
        { tableId: table.id, rowId: template.sourceRowId },
      ))
      return
    }
    if (template.cells.length !== input.definition.columns.length
      || template.cells.some((cell, index) => cell.columnStart !== index || cell.colSpan !== 1 || cell.rowSpan !== 1)) {
      issues.push(issue(
        "span-profile-unsupported", `definition.rowTemplates.${template.rowTemplateId}.cells`,
        "authoring v1 requires one span-one cell per semantic column",
        { tableId: table.id, rowId: row.id },
      ))
    }
    const expectedCells = template.cells.map((cell) => cell.cellId)
    if (JSON.stringify(row.cellIds) !== JSON.stringify(expectedCells)) issues.push(issue(
      "source-row-cell-map-mismatch", `definition.rowTemplates.${template.rowTemplateId}.cells`,
      "authored row cell order must equal semantic template cell order",
      { tableId: table.id, rowId: row.id },
    ))
    expectedCells.forEach((cellId) => {
      cellVisitCount += 1
      if (section.nodes[cellId]?.type !== "table-cell") issues.push(issue(
        "source-cell-missing", `document.document.sections.${section.id}.nodes.${cellId}`,
        `semantic cell "${cellId}" must resolve to an authored Table cell`,
        { tableId: table.id, rowId: row.id, cellId },
      ))
    })
  })
  if (JSON.stringify(table.rowIds) !== JSON.stringify(expectedRowIds)) issues.push(issue(
    "row-order-mismatch", "definition.rowSources",
    "authored Table row order must equal semantic row-source template order",
    { tableId: table.id },
  ))
  const leadingHeaderCount = input.definition.rowSources.findIndex(
    (source) => source.kind !== "static-row" || source.role !== "header",
  )
  const expectedHeaderCount = leadingHeaderCount < 0 ? input.definition.rowSources.length : leadingHeaderCount
  if ((table.props.headerRowCount ?? 0) !== expectedHeaderCount
    || (table.props.repeatHeaderRows ?? false) !== (input.definition.headerPolicy === "repeat-leading-headers")) issues.push(issue(
    "header-policy-drift", "document.table.props",
    "authored header count/repeat flags must equal semantic leading headers and header policy",
    { tableId: table.id },
  ))

  const resolvedPolicy = resolveVNextStructurePolicyV1(input.policySet, table.id)
  const capabilities: VNextTableAuthoringCapabilityV1[] = TABLE_ACTIONS.map((action) => {
    const evaluated = evaluateVNextEffectiveNodeCapabilityV1({
      action,
      coreAllowed: true,
      policy: resolvedPolicy.policy,
      sessionAllowed: input.sessionAllowedActions.includes(action),
    })
    return {
      action, allowed: evaluated.allowed, policyKey: evaluated.policyKey,
      denials: evaluated.denials,
    }
  })
  if (issues.length > 0) return blocked(issues)
  const accepted = {
    artifact: clone(input.artifact),
    document: clone(input.document),
    definition: clone(input.definition),
    policySet: clone(input.policySet),
    sessionAllowedActions: clone(input.sessionAllowedActions),
    sectionId: section.id,
    tableId: table.id,
    tablePolicyKey: resolvedPolicy.policyKey,
    capabilities,
    unsupportedCapabilities: clone(unsupportedCapabilities),
    fingerprint: JSON.stringify([
      input.artifact, input.document, input.definition, input.policySet, input.sessionAllowedActions,
    ]),
  }
  return {
    source: VNEXT_TABLE_AUTHORING_SOURCE,
    contractVersion: VNEXT_TABLE_AUTHORING_VERSION,
    status: "ready",
    bundle: accepted,
    work: {
      sectionVisitCount: input.document.document.sections.length,
      rowTemplateVisitCount: Object.keys(input.definition.rowTemplates).length,
      cellVisitCount,
      capabilityCheckCount: capabilities.length,
    },
    issues: [],
  }
}
