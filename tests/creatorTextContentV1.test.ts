import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import * as core from "../src/index.js"

export function creatorDraft(): any {
  return JSON.parse(readFileSync(new URL("./fixtures/creator-preview/draft.json", import.meta.url), "utf8"))
}
export function creatorSimulation(value: unknown = "คุณตูม"): any {
  return { source: "flowdoc-creator-preview-values", contractVersion: 1, sessionId: "session:1", simulationRevision: 1,
    entries: [{ slotId: "slot:customer", entryId: "entry:1", values: [{ fieldId: "field:customer-name", value }] }] }
}
const validate = (draft: unknown, simulation: unknown) => (core as any).validateVNextCreatorTextContentV1(draft, simulation)

describe("creator text content admission", () => {
  it("exports strict admission for the complete authored draft and resolves stable field identity", () => {
    expect((core as any).validateVNextCreatorTextContentV1).toBeTypeOf("function")
    const draft = creatorDraft(), simulation = creatorSimulation()
    const before = JSON.stringify({ draft, simulation })
    const result = validate(draft, simulation)
    expect(result.status).toBe("accepted")
    expect(result.resolved.text).toBe("Dear คุณตูม, welcome.")
    expect(result.resolved.valueAddress).toEqual({ slotId: "slot:customer", entryId: "entry:1", fieldId: "field:customer-name" })
    expect(JSON.stringify({ draft, simulation })).toBe(before)
  })
  it("preserves missing, empty and whitespace values and reports required empty without blocking editing", () => {
    const draft = creatorDraft(), simulation = creatorSimulation()
    simulation.entries[0].values = []
    draft.componentDefinitions[0].draft.fields[0].required = true
    draft.fieldBindingExpectations[0].required = true
    const result = validate(draft, simulation)
    expect(result.status).toBe("accepted")
    expect(result.resolved.value).toBe("")
    expect(result.validationIssues[0].code).toBe("required-empty")
    expect(validate(creatorDraft(), creatorSimulation("   ")).resolved.value).toBe("   ")
  })
  it.each([
    (d: any) => d.content.patterns[0].blocks[0].inlines[1].fieldId = "missing",
    (d: any) => d.content.sections[0].items[0].slotId = "missing",
    (d: any) => d.componentInstances[0].componentDefinitionId = "missing",
    (d: any) => d.content.patterns[0].patternDraftId = "wrong",
    (d: any) => d.fieldBindingExpectations[0].required = true,
    (d: any) => d.sections[0].styleDefaults = { text: "hidden" },
    (d: any) => d.sections[0].pageWidth = 200,
    (d: any) => d.sections.push(d.sections[0]),
    (d: any) => d.content.patterns[0].blocks[0].inlines[2].id = "inline:prefix",
    (d: any) => d.content.extra = "hidden",
    (d: any) => d.schemaVersion = 3,
    (d: any) => d.componentDefinitions[0].draft.fields.push(d.componentDefinitions[0].draft.fields[0]),
    (d: any) => d.content.patterns[0].blocks[0].inlines[0].text = "x".repeat(16385),
  ])("rejects unsupported schema/reference/profile/limit changes as a whole", (mutate) => {
    const draft = creatorDraft(); mutate(draft)
    expect(validate(draft, creatorSimulation())).toMatchObject({ status: "blocked", resolved: null })
  })
  it.each([null, 1, "a\nb", "a\tb", "\ud800", "\u202eabc", "x".repeat(8193)])("rejects invalid values", (value) => {
    expect(validate(creatorDraft(), creatorSimulation(value)).status).toBe("blocked")
  })
  it.each([
    (s: any) => s.entries.push(s.entries[0]),
    (s: any) => s.entries[0].values.push(s.entries[0].values[0]),
    (s: any) => s.entries[0].values[0].fieldId = "unknown",
    (s: any) => s.entries[0].slotId = "unknown",
    (s: any) => s.contractVersion = 2,
    (s: any) => s.entries[0].values[0].rect = { x: 1 },
  ])("rejects ambiguous or unsupported simulation addresses", (mutate) => {
    const simulation = creatorSimulation(); mutate(simulation)
    expect(validate(creatorDraft(), simulation)).toMatchObject({ status: "blocked", resolved: null })
  })
  it("preserves exact Unicode and the complete canonical source fingerprint across property order", () => {
    const source = creatorDraft(), simulation = creatorSimulation("é e\u0301 ภาษาไทย")
    const original = validate(source, simulation)
    const reordered = Object.fromEntries(Object.entries(source).reverse())
    expect(validate(reordered, simulation).resolved.sourceFingerprint).toBe(original.resolved.sourceFingerprint)
    expect(original.resolved.value).toBe("é e\u0301 ภาษาไทย")
    source.fieldBindingExpectations[0].bindingPath = "other.mapping"
    expect(validate(source, simulation).resolved.sourceFingerprint).not.toBe(original.resolved.sourceFingerprint)
  })
})
