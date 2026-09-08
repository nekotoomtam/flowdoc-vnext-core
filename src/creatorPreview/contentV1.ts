import { z } from "zod"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"

export const VNEXT_CREATOR_TEXT_PREVIEW_PROFILE_V1 = "creator-text-preview/1" as const
export interface VNextCreatorTextPreviewIssueV1 { code: string; path: string; message: string }
const id = z.string().min(1).max(512)
const order = z.number().int().nonnegative()
const one = <T extends z.ZodType>(schema: T) => z.array(schema).length(1)
const text = z.string().refine(isVNextCreatorPreviewTextV1, "Unsupported single-paragraph Unicode text")
export function isVNextCreatorPreviewTextV1(value: string): boolean {
  // Reject controls, bidi formatting, paragraph separators and malformed UTF-16 without normalization.
  if (/[\u0000-\u001f\u007f-\u009f\u061c\u200e\u200f\u2028-\u202e\u2066-\u2069]/u.test(value)) return false
  for (const scalar of value) { const point = scalar.codePointAt(0)!; if (point >= 0xd800 && point <= 0xdfff) return false }
  return true
}
const fieldText = z.string().refine(isVNextCreatorPreviewFieldTextV1, "Unsupported field Unicode text")
export function isVNextCreatorPreviewFieldTextV1(value: string): boolean {
  if (/[\u0000-\u0009\u000b-\u001f\u007f-\u009f\u061c\u200e\u200f\u2028-\u202e\u2066-\u2069]/u.test(value)) return false
  for (const scalar of value) { const point = scalar.codePointAt(0)!; if (point >= 0xd800 && point <= 0xdfff) return false }
  return true
}
const page = { orientation: z.literal("portrait"), pageWidth: z.literal(210), pageHeight: z.literal(297), pageUnit: z.literal("mm") }
const staticInline = z.object({ id, kind: z.literal("text"), text }).strict()
const fieldInline = z.object({ id, kind: z.literal("field"), fieldId: id }).strict()
export const VNextCreatorTextDraftV1Schema = z.object({
  schemaVersion: z.literal(2),
  definition: z.object({ id, workspaceId: id, title: z.string(), status: z.literal("draft") }).strict(),
  draft: z.object({ id, defaultOrientation: page.orientation, defaultPageWidth: page.pageWidth, defaultPageHeight: page.pageHeight, defaultPageUnit: page.pageUnit }).strict(),
  sections: one(z.object({ id, title: z.string(), sectionKey: id, sectionKindKey: z.literal("flow-section"), parentDraftSectionId: z.null(), sortOrder: order, ...page, styleDefaults: z.object({}).strict() }).strict()),
  componentDefinitions: one(z.object({ id, workspaceId: id, name: z.string(), status: z.literal("draft"), componentKindKey: z.literal("content-block"),
    draft: z.object({ id, fields: one(z.object({ id, fieldKey: id, fieldTypeKey: z.literal("text"), label: z.string(), required: z.boolean(), sortOrder: order }).strict()) }).strict(),
  }).strict()),
  componentInstances: one(z.object({ id, componentDefinitionId: id, draftSectionId: id, instanceKey: id, slotKey: id, bindingScope: id, sortOrder: order,
    flowMode: z.literal("block"), keepTogether: z.literal(false), layoutRegionKey: z.null(), overflowBehavior: z.literal("continue"), repeatMode: z.literal("single"),
    minEntries: z.literal(1), maxEntries: z.literal(1), required: z.literal(true), label: z.string(),
  }).strict()),
  fieldBindingExpectations: one(z.object({ id, draftComponentInstanceId: id, fieldKey: id, bindingPath: id, bindingValueKindKey: z.literal("scalar"), repeatContext: z.null(), required: z.boolean() }).strict()),
  content: z.object({ source: z.literal("flowdoc-creator-text-content"), contractVersion: z.literal(1), layoutProfile: z.literal(VNEXT_CREATOR_TEXT_PREVIEW_PROFILE_V1),
    sections: one(z.object({ sectionId: id, items: one(z.object({ id, kind: z.literal("slot"), slotId: id }).strict()) }).strict()),
    patterns: one(z.object({ patternId: id, patternDraftId: id, blocks: one(z.object({ id, kind: z.literal("paragraph"), inlines: z.tuple([staticInline, fieldInline, staticInline]) }).strict()) }).strict()),
  }).strict(),
}).strict()
export const VNextCreatorPreviewSimulationV1Schema = z.object({ source: z.literal("flowdoc-creator-preview-values"), contractVersion: z.literal(1), sessionId: id, simulationRevision: order,
  entries: one(z.object({ slotId: id, entryId: id, values: z.array(z.object({ fieldId: id, value: fieldText.max(8192) }).strict()).max(1) }).strict()),
}).strict()
export type VNextCreatorTextDraftV1 = z.infer<typeof VNextCreatorTextDraftV1Schema>
export type VNextCreatorPreviewSimulationV1 = z.infer<typeof VNextCreatorPreviewSimulationV1Schema>
export interface VNextCreatorPreviewValueAddressV1 { slotId: string; entryId: string; fieldId: string }
export interface VNextCreatorPreviewOccurrenceTupleV1 {
  sectionId: string; placementId: string; slotId: string; entryId: string; patternId: string; patternDraftId: string; blockId: string; inlineId: string
}
export interface VNextCreatorTextResolvedV1 {
  draft: VNextCreatorTextDraftV1; simulation: VNextCreatorPreviewSimulationV1; sourceFingerprint: string
  prefix: string; value: string; suffix: string; text: string; valueAddress: VNextCreatorPreviewValueAddressV1
  tuple: VNextCreatorPreviewOccurrenceTupleV1; occurrenceId: string; inlineIds: [string, string, string]
}
export type VNextCreatorTextContentResultV1 =
  | { status: "accepted"; resolved: VNextCreatorTextResolvedV1; issues: []; validationIssues: VNextCreatorTextPreviewIssueV1[] }
  | { status: "blocked"; resolved: null; issues: VNextCreatorTextPreviewIssueV1[]; validationIssues: [] }
export function fingerprintVNextCreatorPreviewV1(value: unknown): string { return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value)) }

export function validateVNextCreatorTextContentV1(draftInput: unknown, simulationInput: unknown): VNextCreatorTextContentResultV1 {
  const draftResult = VNextCreatorTextDraftV1Schema.safeParse(draftInput), simulationResult = VNextCreatorPreviewSimulationV1Schema.safeParse(simulationInput)
  const issues: VNextCreatorTextPreviewIssueV1[] = []
  for (const [root, result] of [["draft", draftResult], ["simulation", simulationResult]] as const) {
    if (!result.success) for (const item of result.error.issues) issues.push({ code: "invalid-content", path: [root, ...item.path].join("."), message: item.message })
  }
  const blocked = (): VNextCreatorTextContentResultV1 => ({ status: "blocked", resolved: null, issues, validationIssues: [] })
  if (!draftResult.success || !simulationResult.success) return blocked()
  const draft = draftResult.data, simulation = simulationResult.data
  const section = draft.sections[0], pattern = draft.componentDefinitions[0], slot = draft.componentInstances[0], binding = draft.fieldBindingExpectations[0]
  const field = pattern.draft.fields[0], placement = draft.content.sections[0].items[0], authored = draft.content.patterns[0], block = authored.blocks[0]
  const [prefix, inline, suffix] = block.inlines, entry = simulation.entries[0]
  const match = (condition: boolean, path: string) => { if (!condition) issues.push({ code: "reference-mismatch", path, message: "Reference does not resolve to the admitted source" }) }
  match(pattern.workspaceId === draft.definition.workspaceId, "componentDefinitions.0.workspaceId")
  match(draft.content.sections[0].sectionId === section.id, "content.sections.0.sectionId")
  match(slot.draftSectionId === section.id && placement.slotId === slot.id, "content.sections.0.items.0")
  match(slot.componentDefinitionId === pattern.id && authored.patternId === pattern.id && authored.patternDraftId === pattern.draft.id, "content.patterns.0")
  match(inline.fieldId === field.id && binding.draftComponentInstanceId === slot.id && binding.fieldKey === field.fieldKey && binding.required === field.required, "fieldBindingExpectations.0")
  match(entry.slotId === slot.id && (entry.values.length === 0 || entry.values[0].fieldId === field.id), "simulation.entries.0")
  const contentIds = [placement.id, block.id, prefix.id, inline.id, suffix.id]
  if (new Set(contentIds).size !== contentIds.length) issues.push({ code: "duplicate-content-id", path: "content", message: "Placement, block and inline IDs must be unique" })
  if (prefix.text.length + suffix.text.length > 16384) issues.push({ code: "static-text-limit", path: "content", message: "Static text exceeds 16384 UTF-16 units" })
  if (issues.length) return blocked()
  const value = entry.values[0]?.value ?? ""
  const tuple = { sectionId: section.id, placementId: placement.id, slotId: slot.id, entryId: entry.entryId, patternId: pattern.id, patternDraftId: pattern.draft.id, blockId: block.id, inlineId: inline.id }
  return { status: "accepted", issues: [], validationIssues: field.required && value.length === 0 ? [{ code: "required-empty", path: "simulation.entries.0.values", message: "This field requires a value" }] : [],
    resolved: { draft, simulation, sourceFingerprint: fingerprintVNextCreatorPreviewV1(draft), prefix: prefix.text, value, suffix: suffix.text, text: prefix.text + value + suffix.text,
      valueAddress: { slotId: slot.id, entryId: entry.entryId, fieldId: field.id }, tuple, occurrenceId: stringifyVNextCanonicalJson(tuple), inlineIds: [prefix.id, inline.id, suffix.id] },
  }
}
