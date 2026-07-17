import { z } from "zod"
import {
  VNextPublishedStructureVersionRefV1Schema,
  sameVNextPublishedStructureVersionRefV1,
} from "../lifecycle/structureIdentity.js"
import { VNextPublishedCollectionItemContractV1Schema } from "../table/collectionItemContractV1.js"
import { VNextPublishedFieldContractV1Schema } from "./resolutionInputPins.js"

export const VNEXT_DISPLAY_FORMATTING_SOURCE = "vnext-display-formatting"
export const VNEXT_DISPLAY_FORMATTING_CONTRACT_VERSION = 1 as const

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})
const ScalarValueTypeSchema = z.enum(["text", "number", "date", "boolean", "enum"])
const ScalarValueSchema = z.union([z.string(), z.number().finite(), z.boolean(), z.null()])
const MonthNamesSchema = z.tuple([
  NonBlankIdSchema, NonBlankIdSchema, NonBlankIdSchema, NonBlankIdSchema,
  NonBlankIdSchema, NonBlankIdSchema, NonBlankIdSchema, NonBlankIdSchema,
  NonBlankIdSchema, NonBlankIdSchema, NonBlankIdSchema, NonBlankIdSchema,
])

export const VNextPlainDisplayFormatV1Schema = z.object({
  kind: z.literal("plain-text"),
  nullText: z.string(),
}).strict()

export const VNextNumberDisplayFormatV1Schema = z.object({
  kind: z.literal("number"),
  scale: z.number().finite().positive(),
  fractionDigits: z.number().int().min(0).max(6),
  grouping: z.enum(["none", "thousands-comma"]),
  prefix: z.string(),
  suffix: z.string(),
  nullText: z.string(),
}).strict()

export const VNextBooleanDisplayFormatV1Schema = z.object({
  kind: z.literal("boolean-label"),
  trueText: NonBlankIdSchema,
  falseText: NonBlankIdSchema,
  nullText: z.string(),
}).strict()

export const VNextEnumDisplayFormatV1Schema = z.object({
  kind: z.literal("enum-label"),
  labels: z.record(NonBlankIdSchema, NonBlankIdSchema),
  unknownValue: z.literal("block"),
  nullText: z.string(),
}).strict()

export const VNextDateDisplayFormatV1Schema = z.object({
  kind: z.literal("date"),
  input: z.literal("iso-date"),
  presentation: z.literal("day-month-name-year"),
  monthNames: MonthNamesSchema,
  separator: z.string().min(1),
  nullText: z.string(),
}).strict()

export const VNextDateTimeDisplayFormatV1Schema = z.object({
  kind: z.literal("date-time"),
  input: z.literal("iso-instant-utc"),
  presentation: z.literal("iso-utc-seconds"),
  dateTimeSeparator: z.string().min(1),
  utcSuffix: NonBlankIdSchema,
  nullText: z.string(),
}).strict()

export const VNextDisplayFormatSpecV1Schema = z.union([
  VNextPlainDisplayFormatV1Schema,
  VNextNumberDisplayFormatV1Schema,
  VNextBooleanDisplayFormatV1Schema,
  VNextEnumDisplayFormatV1Schema,
  VNextDateDisplayFormatV1Schema,
  VNextDateTimeDisplayFormatV1Schema,
])

export const VNextDisplayFormatDefinitionV1Schema = z.object({
  key: NonBlankIdSchema,
  spec: VNextDisplayFormatSpecV1Schema,
}).strict()

export const VNextCollectionItemDisplayFormatsV1Schema = z.object({
  collectionFieldKey: NonBlankIdSchema,
  fields: z.record(NonBlankIdSchema, NonBlankIdSchema),
}).strict()

export const VNextPublishedDisplayFormatContractV1Schema = z.object({
  contractVersion: z.literal(VNEXT_DISPLAY_FORMATTING_CONTRACT_VERSION),
  kind: z.literal("published-display-format-contract"),
  displayFormatContractId: NonBlankIdSchema,
  owner: VNextPublishedStructureVersionRefV1Schema,
  publishedFieldContractId: NonBlankIdSchema,
  publishedCollectionItemContractId: NonBlankIdSchema,
  locale: z.object({
    localeId: NonBlankIdSchema,
    numberSystem: z.literal("latn"),
    decimalSeparator: z.literal("."),
    groupingSeparator: z.literal(","),
    calendar: z.literal("gregorian"),
  }).strict(),
  determinism: z.object({
    runtimeIntl: z.literal(false),
    numberAlgorithm: z.literal("ecmascript-to-fixed-v1"),
    timeZone: z.literal("UTC"),
  }).strict(),
  formats: z.record(NonBlankIdSchema, VNextDisplayFormatDefinitionV1Schema),
  fieldFormats: z.record(NonBlankIdSchema, NonBlankIdSchema),
  collectionItemFormats: z.record(NonBlankIdSchema, VNextCollectionItemDisplayFormatsV1Schema),
}).strict().superRefine((contract, ctx) => {
  Object.entries(contract.formats).forEach(([key, format]) => {
    if (format.key !== key) ctx.addIssue({
      code: "custom",
      path: ["formats", key, "key"],
      message: "format record key must equal format.key",
    })
  })
  Object.entries(contract.collectionItemFormats).forEach(([key, entry]) => {
    if (entry.collectionFieldKey !== key) ctx.addIssue({
      code: "custom",
      path: ["collectionItemFormats", key, "collectionFieldKey"],
      message: "collection format record key must equal collectionFieldKey",
    })
  })
})

export const VNextDisplayValueRequestV1Schema = z.object({
  contractVersion: z.literal(VNEXT_DISPLAY_FORMATTING_CONTRACT_VERSION),
  kind: z.literal("display-value-request"),
  valueType: ScalarValueTypeSchema,
  value: ScalarValueSchema,
  format: VNextDisplayFormatDefinitionV1Schema,
}).strict()

export type VNextDisplayFormatSpecV1 = z.infer<typeof VNextDisplayFormatSpecV1Schema>
export type VNextDisplayFormatDefinitionV1 = z.infer<typeof VNextDisplayFormatDefinitionV1Schema>
export type VNextPublishedDisplayFormatContractV1 = z.infer<
  typeof VNextPublishedDisplayFormatContractV1Schema
>
export type VNextDisplayValueRequestV1 = z.infer<typeof VNextDisplayValueRequestV1Schema>

export interface VNextDisplayFormattingIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
}

export type VNextDisplayValueResultV1 =
  | {
      source: typeof VNEXT_DISPLAY_FORMATTING_SOURCE
      contractVersion: typeof VNEXT_DISPLAY_FORMATTING_CONTRACT_VERSION
      status: "formatted"
      formatKey: string
      formatKind: VNextDisplayFormatSpecV1["kind"]
      rawValue: string | number | boolean | null
      rawCanonicalText: string
      displayText: string
      execution: { runtimeIntl: false; timeZone: "UTC" }
      issues: []
    }
  | {
      source: typeof VNEXT_DISPLAY_FORMATTING_SOURCE
      contractVersion: typeof VNEXT_DISPLAY_FORMATTING_CONTRACT_VERSION
      status: "blocked"
      displayText: null
      issues: VNextDisplayFormattingIssueV1[]
    }

export type VNextDisplayFormatContractValidationV1 =
  | {
      status: "valid"
      issues: []
      summary: {
        formatCount: number
        fieldAssignmentCount: number
        collectionCount: number
        collectionItemAssignmentCount: number
      }
    }
  | { status: "blocked"; issues: VNextDisplayFormattingIssueV1[]; summary: null }

function issue(code: string, path: string, message: string): VNextDisplayFormattingIssueV1 {
  return { code, path, message, severity: "error" }
}

function pathFromZod(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, part) => {
    if (typeof part === "number") return `${current}[${part}]`
    return current.length === 0 ? String(part) : `${current}.${String(part)}`
  }, "")
}

function sameStringSet(left: readonly string[], right: readonly string[]): boolean {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort())
}

function compatibleFormatKind(valueType: string, spec: VNextDisplayFormatSpecV1): boolean {
  if (valueType === "text") return spec.kind === "plain-text"
  if (valueType === "number") return spec.kind === "number"
  if (valueType === "boolean") return spec.kind === "boolean-label"
  if (valueType === "enum") return spec.kind === "enum-label"
  if (valueType === "date") return spec.kind === "date" || spec.kind === "date-time"
  return false
}

export function validateVNextPublishedDisplayFormatContractV1(input: {
  contract: unknown
  fieldContract: unknown
  collectionItemContract: unknown
}): VNextDisplayFormatContractValidationV1 {
  const parsedContract = VNextPublishedDisplayFormatContractV1Schema.safeParse(input.contract)
  const parsedFields = VNextPublishedFieldContractV1Schema.safeParse(input.fieldContract)
  const parsedItems = VNextPublishedCollectionItemContractV1Schema.safeParse(input.collectionItemContract)
  const issues: VNextDisplayFormattingIssueV1[] = []
  if (!parsedContract.success) parsedContract.error.issues.forEach((item) => issues.push(issue(
    "invalid-display-format-contract", pathFromZod(item.path), item.message,
  )))
  if (!parsedFields.success) issues.push(issue(
    "invalid-field-contract", "fieldContract", "display formatting requires an accepted Published Field Contract",
  ))
  if (!parsedItems.success) issues.push(issue(
    "invalid-collection-item-contract", "collectionItemContract", "display formatting requires an accepted Collection Item Contract",
  ))
  if (!parsedContract.success || !parsedFields.success || !parsedItems.success) {
    return { status: "blocked", issues, summary: null }
  }

  const contract = parsedContract.data
  const fields = parsedFields.data
  const items = parsedItems.data
  if (!sameVNextPublishedStructureVersionRefV1(contract.owner, fields.owner)
    || !sameVNextPublishedStructureVersionRefV1(contract.owner, items.owner)) issues.push(issue(
    "owner-mismatch", "contract.owner", "display, field, and collection item contracts must share one published owner",
  ))
  if (contract.publishedFieldContractId !== fields.fieldContractId) issues.push(issue(
    "field-contract-id-mismatch", "contract.publishedFieldContractId", "display contract must pin the supplied field contract",
  ))
  if (contract.publishedCollectionItemContractId !== items.collectionItemContractId) issues.push(issue(
    "collection-contract-id-mismatch", "contract.publishedCollectionItemContractId", "display contract must pin the supplied collection item contract",
  ))

  const scalarFields = Object.values(fields.registry.fields).filter((field) => (
    field.type !== "image" && field.type !== "collection"
  ))
  if (!sameStringSet(Object.keys(contract.fieldFormats), scalarFields.map((field) => field.key))) issues.push(issue(
    "field-format-coverage", "contract.fieldFormats", "every scalar field must have exactly one display format assignment",
  ))
  scalarFields.forEach((field) => {
    const formatKey = contract.fieldFormats[field.key]
    const format = formatKey == null ? null : contract.formats[formatKey]
    if (formatKey != null && format == null) issues.push(issue(
      "missing-format", `contract.fieldFormats.${field.key}`, `display format "${formatKey}" does not exist`,
    ))
    else if (format != null && !compatibleFormatKind(field.type, format.spec)) issues.push(issue(
      "format-type-mismatch", `contract.fieldFormats.${field.key}`, `format ${formatKey} is incompatible with ${field.type}`,
    ))
  })

  if (!sameStringSet(Object.keys(contract.collectionItemFormats), Object.keys(items.collections))) issues.push(issue(
    "collection-format-coverage", "contract.collectionItemFormats", "every collection item shape must have a display format map",
  ))
  Object.entries(items.collections).forEach(([collectionFieldKey, shape]) => {
    const assignment = contract.collectionItemFormats[collectionFieldKey]
    if (assignment == null) return
    const scalarItemFields = Object.values(shape.fields).filter((field) => field.type !== "image")
    if (!sameStringSet(Object.keys(assignment.fields), scalarItemFields.map((field) => field.key))) issues.push(issue(
      "collection-item-format-coverage",
      `contract.collectionItemFormats.${collectionFieldKey}.fields`,
      `every scalar item field in "${collectionFieldKey}" must have exactly one display format assignment`,
    ))
    scalarItemFields.forEach((field) => {
      const formatKey = assignment.fields[field.key]
      const format = formatKey == null ? null : contract.formats[formatKey]
      if (formatKey != null && format == null) issues.push(issue(
        "missing-format",
        `contract.collectionItemFormats.${collectionFieldKey}.fields.${field.key}`,
        `display format "${formatKey}" does not exist`,
      ))
      else if (format != null && !compatibleFormatKind(field.type, format.spec)) issues.push(issue(
        "format-type-mismatch",
        `contract.collectionItemFormats.${collectionFieldKey}.fields.${field.key}`,
        `format ${formatKey} is incompatible with ${field.type}`,
      ))
    })
  })

  return issues.length > 0
    ? { status: "blocked", issues, summary: null }
    : {
        status: "valid",
        issues: [],
        summary: {
          formatCount: Object.keys(contract.formats).length,
          fieldAssignmentCount: Object.keys(contract.fieldFormats).length,
          collectionCount: Object.keys(contract.collectionItemFormats).length,
          collectionItemAssignmentCount: Object.values(contract.collectionItemFormats).reduce(
            (total, entry) => total + Object.keys(entry.fields).length,
            0,
          ),
        },
      }
}

function rawCanonicalText(value: string | number | boolean | null): string {
  return value == null ? "" : String(value)
}

function groupedNumber(value: string): string {
  const negative = value.startsWith("-") ? "-" : ""
  const unsigned = negative.length === 0 ? value : value.slice(1)
  const [integer, fraction] = unsigned.split(".")
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/gu, ",")
  return `${negative}${grouped}${fraction == null ? "" : `.${fraction}`}`
}

function validDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || year < 1 || month < 1 || month > 12 || day < 1) return false
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return day <= (days[month - 1] ?? 0)
}

function formatNonNullValue(
  valueType: z.infer<typeof ScalarValueTypeSchema>,
  value: string | number | boolean,
  spec: VNextDisplayFormatSpecV1,
): { text: string } | { error: string } {
  if (!compatibleFormatKind(valueType, spec)) return { error: `format ${spec.kind} is incompatible with ${valueType}` }
  if (spec.kind === "plain-text") return typeof value === "string"
    ? { text: value }
    : { error: "plain text formatting requires a string" }
  if (spec.kind === "number") {
    if (typeof value !== "number" || !Number.isFinite(value)) return { error: "number formatting requires a finite number" }
    const scaled = value * spec.scale
    if (!Number.isFinite(scaled)) return { error: "scaled display number is not finite" }
    let fixed = scaled.toFixed(spec.fractionDigits)
    if (fixed.startsWith("-") && Number(fixed) === 0) fixed = fixed.slice(1)
    if (spec.grouping === "thousands-comma") fixed = groupedNumber(fixed)
    return { text: `${spec.prefix}${fixed}${spec.suffix}` }
  }
  if (spec.kind === "boolean-label") return typeof value === "boolean"
    ? { text: value ? spec.trueText : spec.falseText }
    : { error: "boolean label formatting requires a boolean" }
  if (spec.kind === "enum-label") {
    if (typeof value !== "string") return { error: "enum label formatting requires a string" }
    const label = spec.labels[value]
    return label == null ? { error: `enum value "${value}" has no published label` } : { text: label }
  }
  if (typeof value !== "string") return { error: `${spec.kind} formatting requires a string` }
  if (spec.kind === "date") {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value)
    if (match == null) return { error: "date formatting requires YYYY-MM-DD input" }
    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])
    if (!validDate(year, month, day)) return { error: "date input is not a valid Gregorian calendar date" }
    return { text: [String(day), spec.monthNames[month - 1], String(year)].join(spec.separator) }
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?Z$/u.exec(value)
  if (match == null) return { error: "date-time formatting requires an ISO UTC instant" }
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  const second = Number(match[6])
  if (!validDate(year, month, day) || hour > 23 || minute > 59 || second > 59) {
    return { error: "date-time input is not a valid UTC calendar instant" }
  }
  return { text: `${match[1]}-${match[2]}-${match[3]}${spec.dateTimeSeparator}${match[4]}:${match[5]}:${match[6]}${spec.utcSuffix}` }
}

export function formatVNextDisplayValueV1(value: unknown): VNextDisplayValueResultV1 {
  const parsed = VNextDisplayValueRequestV1Schema.safeParse(value)
  if (!parsed.success) return {
    source: VNEXT_DISPLAY_FORMATTING_SOURCE,
    contractVersion: VNEXT_DISPLAY_FORMATTING_CONTRACT_VERSION,
    status: "blocked",
    displayText: null,
    issues: parsed.error.issues.map((item) => issue(
      "invalid-display-value-request", pathFromZod(item.path), item.message,
    )),
  }
  const request = parsed.data
  if (!compatibleFormatKind(request.valueType, request.format.spec)) return {
    source: VNEXT_DISPLAY_FORMATTING_SOURCE,
    contractVersion: VNEXT_DISPLAY_FORMATTING_CONTRACT_VERSION,
    status: "blocked",
    displayText: null,
    issues: [issue(
      "display-format-type-mismatch",
      "format.spec.kind",
      `format ${request.format.spec.kind} is incompatible with ${request.valueType}`,
    )],
  }
  const output = request.value == null
    ? { text: request.format.spec.nullText }
    : formatNonNullValue(request.valueType, request.value, request.format.spec)
  if ("error" in output) return {
    source: VNEXT_DISPLAY_FORMATTING_SOURCE,
    contractVersion: VNEXT_DISPLAY_FORMATTING_CONTRACT_VERSION,
    status: "blocked",
    displayText: null,
    issues: [issue("display-value-formatting", "value", output.error)],
  }
  return {
    source: VNEXT_DISPLAY_FORMATTING_SOURCE,
    contractVersion: VNEXT_DISPLAY_FORMATTING_CONTRACT_VERSION,
    status: "formatted",
    formatKey: request.format.key,
    formatKind: request.format.spec.kind,
    rawValue: request.value,
    rawCanonicalText: rawCanonicalText(request.value),
    displayText: output.text,
    execution: { runtimeIntl: false, timeZone: "UTC" },
    issues: [],
  }
}
