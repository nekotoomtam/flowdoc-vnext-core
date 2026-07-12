import { describe, expect, it } from "vitest"
import {
  collectVNextTocV4Semantics,
  compareVNextTocV4Semantics,
  type DocumentNodeV4Target,
} from "../src/index.js"

const HEADING_COUNT = 1_000

function scaleDocument(): DocumentNodeV4Target {
  const childIds = ["toc", ...Array.from({ length: HEADING_COUNT }, (_, index) => `heading-${index}`)]
  const nodes: Record<string, any> = {
    body: { id: "body", type: "zone", role: "body", childIds },
    toc: { id: "toc", type: "toc", props: { maxLevel: 6 } },
  }
  for (let index = 0; index < HEADING_COUNT; index += 1) {
    nodes[`heading-${index}`] = {
      id: `heading-${index}`,
      type: "text-block",
      role: { role: "heading", level: (index % 6) + 1 },
      props: {},
      children: [{ id: `heading-${index}-text`, type: "text", text: `Heading ${index}` }],
    }
  }
  const margin = { value: 40, unit: "pt" as const }
  return {
    version: 4,
    document: {
      id: "toc-scale",
      sections: [{
        id: "main", type: "section",
        page: { size: "A4", orientation: "portrait", margin: { top: margin, right: margin, bottom: margin, left: margin } },
        zoneIds: ["body"], nodes,
      }],
    },
  }
}

describe("TOC v4 semantic scale", () => {
  it("collects 1,000 headings with exact bounded work and byte-stable output", () => {
    const document = scaleDocument()
    const before = JSON.stringify(document)
    const first = collectVNextTocV4Semantics(document)
    const second = collectVNextTocV4Semantics(document)

    expect(first.status).toBe("ready")
    expect(JSON.stringify(second)).toBe(JSON.stringify(first))
    if (first.status === "blocked") throw new Error(first.issues.map((item) => item.message).join("\n"))
    expect(first.summary).toEqual({
      tocCount: 1,
      headingSourceCount: HEADING_COUNT,
      entryCount: HEADING_COUNT,
      fieldDependencyCount: 0,
      warningCount: 0,
    })
    expect(first.work).toEqual({
      sectionVisitCount: 1,
      nodeVisitCount: HEADING_COUNT + 2,
      entryBuildCount: HEADING_COUNT,
    })
    expect(first.tocs[0].entries[999]).toMatchObject({
      identity: { tocNodeId: "toc", headingNodeId: "heading-999" },
      sourceOrdinal: 999, tocOrdinal: 999,
      label: { text: "Heading 999" },
    })
    expect(JSON.stringify(document)).toBe(before)
  }, 15_000)

  it("limits one label edit impact to its TOC and heading identity", () => {
    const beforeDocument = scaleDocument()
    const afterDocument = JSON.parse(JSON.stringify(beforeDocument)) as DocumentNodeV4Target
    const heading = afterDocument.document.sections[0].nodes["heading-500"]
    if (heading.type !== "text-block" || heading.children[0].type !== "text") throw new Error("scale fixture missing")
    heading.children[0].text = "Changed Heading 500"
    const impact = compareVNextTocV4Semantics({
      before: collectVNextTocV4Semantics(beforeDocument),
      after: collectVNextTocV4Semantics(afterDocument),
    })
    expect(impact).toMatchObject({
      status: "changed",
      affectedTocNodeIds: ["toc"],
      affectedHeadingNodeIds: ["heading-500"],
      summary: {
        addedEntryCount: 0, removedEntryCount: 0, movedEntryCount: 0,
        levelChangedEntryCount: 0, labelChangedEntryCount: 1,
        fieldDependencyChangedEntryCount: 0,
      },
    })
  }, 15_000)
})
