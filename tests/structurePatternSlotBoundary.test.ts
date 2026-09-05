import { describe, expect, it } from "vitest"
import {
  assessVNextStructurePatternSlotBoundaryV1,
  type VNextStructurePatternSlotBoundaryInputV1,
} from "../src/index.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function boundaryInput(): VNextStructurePatternSlotBoundaryInputV1 {
  return {
    contractVersion: 1,
    kind: "structure-pattern-slot-boundary",
    owner: {
      kind: "published-structure-version",
      ref: {
        structureId: "inspection-report",
        structureVersionId: "inspection-report@v3",
        versionOrdinal: 3,
      },
    },
    slots: [
      {
        slotId: "slot-findings",
        slotKey: "findings",
        label: "Findings",
        sortOrder: 20,
        structurePattern: {
          structurePatternDefinitionId: "pattern-finding",
          structurePatternVersionId: "pattern-finding@v2",
        },
        bindingScope: "section",
        repeatMode: "repeatable",
        minEntries: 0,
        maxEntries: 12,
        required: false,
        layoutRegionKey: "body",
        flowMode: "block",
        overflowBehavior: "continue",
        keepTogether: false,
      },
      {
        slotId: "slot-summary",
        slotKey: "summary",
        label: "Executive Summary",
        sortOrder: 10,
        structurePattern: {
          structurePatternDefinitionId: "pattern-summary",
          structurePatternVersionId: "pattern-summary@v1",
        },
        bindingScope: "document",
        repeatMode: "single",
        minEntries: 1,
        maxEntries: 1,
        required: true,
        layoutRegionKey: "intro",
        flowMode: "page_flow",
        overflowBehavior: "reject",
        keepTogether: true,
      },
    ],
  }
}

describe("Structure Pattern Slot boundary v1", () => {
  it("accepts author-time or frozen slots while keeping runtime entries out of Core slot facts", () => {
    const input = boundaryInput()
    const before = JSON.stringify(input)

    const result = assessVNextStructurePatternSlotBoundaryV1(input)

    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.owner).toEqual(input.owner)
    expect(result.slots.map((slot) => slot.slotKey)).toEqual(["summary", "findings"])
    expect(result.summary).toEqual({
      slotCount: 2,
      repeatableSlotCount: 1,
      requiredSlotCount: 1,
      runtimeEntryCount: 0,
      submittedValueCount: 0,
      issueCount: 0,
    })
    expect(result.boundary).toEqual({
      structurePattern: "core-semantic-reference",
      structurePatternSlot: "author-time-or-published-structure",
      structurePatternEntry: "runtime-preview-or-submission-not-modeled",
      backendPersistence: "not-run",
      editorPreview: "not-run",
      submittedValues: "not-accepted",
      packageSchemaChange: false,
    })
    expect(JSON.stringify(input)).toBe(before)
    expect(result.slots).not.toBe(input.slots)
  })

  it("blocks runtime entries, duplicate keys, unresolved published pattern versions, and invalid repeat policies", () => {
    const runtimeEntries = {
      ...boundaryInput(),
      entries: [{ slotKey: "findings", entryId: "finding-1" }],
    }
    const duplicateKey = clone(boundaryInput())
    duplicateKey.slots[1].slotKey = "findings"
    const duplicateId = clone(boundaryInput())
    duplicateId.slots[1].slotId = "slot-findings"
    const missingPublishedPatternVersion = clone(boundaryInput())
    delete missingPublishedPatternVersion.slots[0].structurePattern.structurePatternVersionId
    const singleWithRepeatMinimum = clone(boundaryInput())
    singleWithRepeatMinimum.slots[1].minEntries = 2
    const singleWithRepeatCount = clone(boundaryInput())
    singleWithRepeatCount.slots[1].maxEntries = 2
    const repeatableMaxBelowMinimum = clone(boundaryInput())
    repeatableMaxBelowMinimum.slots[0].minEntries = 3
    repeatableMaxBelowMinimum.slots[0].maxEntries = 2
    const requiredWithoutMinimum = clone(boundaryInput())
    requiredWithoutMinimum.slots[1].minEntries = 0

    const cases = [
      [runtimeEntries, "invalid-request"],
      [duplicateKey, "duplicate-slot-key"],
      [duplicateId, "duplicate-slot-id"],
      [missingPublishedPatternVersion, "published-slot-pattern-version-required"],
      [singleWithRepeatMinimum, "single-slot-min-must-be-zero-or-one"],
      [singleWithRepeatCount, "single-slot-max-must-be-one"],
      [repeatableMaxBelowMinimum, "repeatable-slot-max-less-than-min"],
      [requiredWithoutMinimum, "required-slot-minimum-missing"],
    ] as const

    for (const [input, code] of cases) {
      const result = assessVNextStructurePatternSlotBoundaryV1(input)
      expect(result.status).toBe("blocked")
      expect(result.summary.issueCount).toBeGreaterThan(0)
      expect(result.issues.some((item) => item.code === code)).toBe(true)
      expect(result.boundary.structurePatternEntry).toBe("runtime-preview-or-submission-not-modeled")
      expect(result.boundary.submittedValues).toBe("not-accepted")
    }
  })
})
