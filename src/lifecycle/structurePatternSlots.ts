import { z } from "zod"
import {
  VNextPublishedStructureVersionRefV1Schema,
  VNextStructureDefinitionDraftRefV1Schema,
} from "./structureIdentity.js"

export const VNEXT_STRUCTURE_PATTERN_SLOT_BOUNDARY_SOURCE = "vnext-structure-pattern-slot-boundary"
export const VNEXT_STRUCTURE_PATTERN_SLOT_BOUNDARY_CONTRACT_VERSION = 1 as const

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "value must not be whitespace",
})

const SlotOwnerSchema = z.union([
  z.object({
    kind: z.literal("structure-definition-draft"),
    ref: VNextStructureDefinitionDraftRefV1Schema,
  }).strict(),
  z.object({
    kind: z.literal("published-structure-version"),
    ref: VNextPublishedStructureVersionRefV1Schema,
  }).strict(),
])

const StructurePatternRefSchema = z.object({
  structurePatternDefinitionId: NonBlankIdSchema,
  structurePatternVersionId: NonBlankIdSchema.optional(),
}).strict()

export const VNextStructurePatternSlotV1Schema = z.object({
  slotId: NonBlankIdSchema,
  slotKey: NonBlankIdSchema,
  label: NonBlankIdSchema,
  sortOrder: z.number().int(),
  structurePattern: StructurePatternRefSchema,
  bindingScope: NonBlankIdSchema,
  repeatMode: z.enum(["single", "repeatable"]),
  minEntries: z.number().int().nonnegative(),
  maxEntries: z.number().int().positive().nullable(),
  required: z.boolean(),
  layoutRegionKey: NonBlankIdSchema.optional(),
  flowMode: z.enum(["inline", "block", "table_rows", "page_flow"]),
  overflowBehavior: z.enum(["continue", "new-page", "clip", "reject"]),
  keepTogether: z.boolean(),
}).strict()

export const VNextStructurePatternSlotBoundaryInputV1Schema = z.object({
  contractVersion: z.literal(VNEXT_STRUCTURE_PATTERN_SLOT_BOUNDARY_CONTRACT_VERSION),
  kind: z.literal("structure-pattern-slot-boundary"),
  owner: SlotOwnerSchema,
  slots: z.array(VNextStructurePatternSlotV1Schema),
}).strict()

export type VNextStructurePatternSlotOwnerV1 = z.infer<typeof SlotOwnerSchema>
export type VNextStructurePatternSlotV1 = z.infer<typeof VNextStructurePatternSlotV1Schema>
export type VNextStructurePatternSlotBoundaryInputV1 = z.infer<
  typeof VNextStructurePatternSlotBoundaryInputV1Schema
>

export type VNextStructurePatternSlotBoundaryIssueCode =
  | "invalid-request"
  | "duplicate-slot-key"
  | "duplicate-slot-id"
  | "published-slot-pattern-version-required"
  | "single-slot-min-must-be-zero-or-one"
  | "single-slot-max-must-be-one"
  | "repeatable-slot-max-less-than-min"
  | "required-slot-minimum-missing"

export interface VNextStructurePatternSlotBoundaryIssueV1 {
  source: "schema" | "slot"
  severity: "error"
  code: VNextStructurePatternSlotBoundaryIssueCode
  path: string
  message: string
}

export interface VNextStructurePatternSlotBoundaryFactsV1 {
  structurePattern: "core-semantic-reference"
  structurePatternSlot: "author-time-or-published-structure"
  structurePatternEntry: "runtime-preview-or-submission-not-modeled"
  backendPersistence: "not-run"
  editorPreview: "not-run"
  submittedValues: "not-accepted"
  packageSchemaChange: false
}

export interface VNextStructurePatternSlotBoundarySummaryV1 {
  slotCount: number
  repeatableSlotCount: number
  requiredSlotCount: number
  runtimeEntryCount: 0
  submittedValueCount: 0
  issueCount: number
}

export interface VNextStructurePatternSlotBoundaryAcceptedV1 {
  source: typeof VNEXT_STRUCTURE_PATTERN_SLOT_BOUNDARY_SOURCE
  contractVersion: typeof VNEXT_STRUCTURE_PATTERN_SLOT_BOUNDARY_CONTRACT_VERSION
  status: "accepted"
  owner: VNextStructurePatternSlotOwnerV1
  slots: VNextStructurePatternSlotV1[]
  boundary: VNextStructurePatternSlotBoundaryFactsV1
  summary: VNextStructurePatternSlotBoundarySummaryV1
  issues: []
}

export interface VNextStructurePatternSlotBoundaryBlockedV1 {
  source: typeof VNEXT_STRUCTURE_PATTERN_SLOT_BOUNDARY_SOURCE
  contractVersion: typeof VNEXT_STRUCTURE_PATTERN_SLOT_BOUNDARY_CONTRACT_VERSION
  status: "blocked"
  owner: VNextStructurePatternSlotOwnerV1 | null
  slots: VNextStructurePatternSlotV1[]
  boundary: VNextStructurePatternSlotBoundaryFactsV1
  summary: VNextStructurePatternSlotBoundarySummaryV1
  issues: VNextStructurePatternSlotBoundaryIssueV1[]
}

export type VNextStructurePatternSlotBoundaryResultV1 =
  | VNextStructurePatternSlotBoundaryAcceptedV1
  | VNextStructurePatternSlotBoundaryBlockedV1

const BOUNDARY_FACTS: VNextStructurePatternSlotBoundaryFactsV1 = {
  structurePattern: "core-semantic-reference",
  structurePatternSlot: "author-time-or-published-structure",
  structurePatternEntry: "runtime-preview-or-submission-not-modeled",
  backendPersistence: "not-run",
  editorPreview: "not-run",
  submittedValues: "not-accepted",
  packageSchemaChange: false,
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function formatIssuePath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => {
    if (typeof segment === "number") return `${current}[${segment}]`
    const key = String(segment)
    return current === "" ? key : `${current}.${key}`
  }, "")
}

function issue(
  code: VNextStructurePatternSlotBoundaryIssueCode,
  path: string,
  message: string,
): VNextStructurePatternSlotBoundaryIssueV1 {
  return { source: "slot", severity: "error", code, path, message }
}

function summary(
  slots: readonly VNextStructurePatternSlotV1[],
  issueCount: number,
): VNextStructurePatternSlotBoundarySummaryV1 {
  return {
    slotCount: slots.length,
    repeatableSlotCount: slots.filter((slot) => slot.repeatMode === "repeatable").length,
    requiredSlotCount: slots.filter((slot) => slot.required).length,
    runtimeEntryCount: 0,
    submittedValueCount: 0,
    issueCount,
  }
}

function sortedSlots(slots: readonly VNextStructurePatternSlotV1[]): VNextStructurePatternSlotV1[] {
  return [...clone(slots)].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder
    return left.slotKey.localeCompare(right.slotKey)
  })
}

function duplicateIndexes(slots: readonly VNextStructurePatternSlotV1[], key: "slotId" | "slotKey"): number[] {
  const seen = new Set<string>()
  const duplicates: number[] = []
  slots.forEach((slot, index) => {
    const value = slot[key]
    if (seen.has(value)) duplicates.push(index)
    seen.add(value)
  })
  return duplicates
}

function validateSlots(input: VNextStructurePatternSlotBoundaryInputV1): VNextStructurePatternSlotBoundaryIssueV1[] {
  const issues: VNextStructurePatternSlotBoundaryIssueV1[] = []
  duplicateIndexes(input.slots, "slotKey").forEach((index) => issues.push(issue(
    "duplicate-slot-key",
    `slots[${index}].slotKey`,
    `slotKey "${input.slots[index].slotKey}" is already used by this boundary owner`,
  )))
  duplicateIndexes(input.slots, "slotId").forEach((index) => issues.push(issue(
    "duplicate-slot-id",
    `slots[${index}].slotId`,
    `slotId "${input.slots[index].slotId}" is already used by this boundary owner`,
  )))

  input.slots.forEach((slot, index) => {
    if (
      input.owner.kind === "published-structure-version"
      && slot.structurePattern.structurePatternVersionId == null
    ) issues.push(issue(
      "published-slot-pattern-version-required",
      `slots[${index}].structurePattern.structurePatternVersionId`,
      "published structure slots must pin the resolved Structure Pattern version",
    ))
    if (slot.repeatMode === "single" && slot.minEntries > 1) issues.push(issue(
      "single-slot-min-must-be-zero-or-one",
      `slots[${index}].minEntries`,
      "single Structure Pattern Slots may require at most one entry",
    ))
    if (slot.repeatMode === "single" && slot.maxEntries !== 1) issues.push(issue(
      "single-slot-max-must-be-one",
      `slots[${index}].maxEntries`,
      "single Structure Pattern Slots must set maxEntries to 1",
    ))
    if (slot.repeatMode === "repeatable" && slot.maxEntries != null && slot.maxEntries < slot.minEntries) {
      issues.push(issue(
        "repeatable-slot-max-less-than-min",
        `slots[${index}].maxEntries`,
        "repeatable Structure Pattern Slot maxEntries must be null or greater than or equal to minEntries",
      ))
    }
    if (slot.required && slot.minEntries < 1) issues.push(issue(
      "required-slot-minimum-missing",
      `slots[${index}].minEntries`,
      "required Structure Pattern Slots must require at least one runtime or Preview entry",
    ))
  })

  return issues
}

export function assessVNextStructurePatternSlotBoundaryV1(
  value: unknown,
): VNextStructurePatternSlotBoundaryResultV1 {
  const parsed = VNextStructurePatternSlotBoundaryInputV1Schema.safeParse(value)
  if (!parsed.success) {
    const issues: VNextStructurePatternSlotBoundaryIssueV1[] = parsed.error.issues.map((item) => ({
      source: "schema",
      severity: "error",
      code: "invalid-request",
      path: formatIssuePath(item.path),
      message: item.message,
    }))
    return {
      source: VNEXT_STRUCTURE_PATTERN_SLOT_BOUNDARY_SOURCE,
      contractVersion: VNEXT_STRUCTURE_PATTERN_SLOT_BOUNDARY_CONTRACT_VERSION,
      status: "blocked",
      owner: null,
      slots: [],
      boundary: clone(BOUNDARY_FACTS),
      summary: summary([], issues.length),
      issues,
    }
  }

  const slots = sortedSlots(parsed.data.slots)
  const issues = validateSlots(parsed.data)
  if (issues.length > 0) {
    return {
      source: VNEXT_STRUCTURE_PATTERN_SLOT_BOUNDARY_SOURCE,
      contractVersion: VNEXT_STRUCTURE_PATTERN_SLOT_BOUNDARY_CONTRACT_VERSION,
      status: "blocked",
      owner: clone(parsed.data.owner),
      slots,
      boundary: clone(BOUNDARY_FACTS),
      summary: summary(slots, issues.length),
      issues,
    }
  }

  return {
    source: VNEXT_STRUCTURE_PATTERN_SLOT_BOUNDARY_SOURCE,
    contractVersion: VNEXT_STRUCTURE_PATTERN_SLOT_BOUNDARY_CONTRACT_VERSION,
    status: "accepted",
    owner: clone(parsed.data.owner),
    slots,
    boundary: clone(BOUNDARY_FACTS),
    summary: summary(slots, 0),
    issues: [],
  }
}
