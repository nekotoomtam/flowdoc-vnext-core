import { describe, expect, it } from "vitest"
import {
  collectVNextTocV4Semantics,
  compareVNextTocV4Semantics,
  type DocumentNodeV4Target,
} from "../src/index.js"

function document(): DocumentNodeV4Target {
  const margin = { value: 40, unit: "pt" as const }
  return {
    version: 4,
    document: {
      id: "impact-doc",
      sections: [{
        id: "main", type: "section",
        page: { size: "A4", orientation: "portrait", margin: { top: margin, right: margin, bottom: margin, left: margin } },
        zoneIds: ["body"],
        nodes: {
          body: { id: "body", type: "zone", role: "body", childIds: ["toc", "one", "two"] },
          toc: { id: "toc", type: "toc", props: { maxLevel: 2 } },
          one: {
            id: "one", type: "text-block", role: { role: "heading", level: 1 }, props: {},
            children: [{ id: "one-text", type: "text", text: "One" }],
          },
          two: {
            id: "two", type: "text-block", role: { role: "heading", level: 2 }, props: {},
            children: [{ id: "two-text", type: "text", text: "Two" }],
          },
        },
      }],
    },
  }
}

describe("TOC v4 semantic impact", () => {
  it("reports exact label and order changes with bounded invalidation", () => {
    const beforeDocument = document()
    const afterDocument = JSON.parse(JSON.stringify(beforeDocument)) as DocumentNodeV4Target
    const body = afterDocument.document.sections[0].nodes.body
    const heading = afterDocument.document.sections[0].nodes.two
    if (body.type !== "zone" || heading.type !== "text-block") throw new Error("impact fixture missing")
    body.childIds = ["toc", "two", "one"]
    const text = heading.children[0]
    if (text.type !== "text") throw new Error("text fixture missing")
    text.text = "Second"

    const impact = compareVNextTocV4Semantics({
      before: collectVNextTocV4Semantics(beforeDocument),
      after: collectVNextTocV4Semantics(afterDocument),
    })
    expect(impact).toMatchObject({
      status: "changed",
      affectedTocNodeIds: ["toc"],
      affectedHeadingNodeIds: ["one", "two"],
      summary: { movedEntryCount: 2, labelChangedEntryCount: 1 },
      tocChanges: [{
        tocNodeId: "toc", kind: "changed",
        movedHeadingNodeIds: ["one", "two"],
        labelChangedHeadingNodeIds: ["two"],
      }],
      invalidation: {
        semanticEntries: true, tocMeasurementNodeIds: ["toc"],
        pagination: true, renderer: true,
        pageReferenceRefresh: "all-entries-in-affected-tocs",
      },
      contracts: { measurement: "not-run", pagination: "not-run", rendering: "not-run" },
    })
  })

  it("returns unchanged deterministically and blocks incompatible inputs", () => {
    const plan = collectVNextTocV4Semantics(document())
    const first = compareVNextTocV4Semantics({ before: plan, after: plan })
    expect(first).toMatchObject({
      status: "unchanged", affectedTocNodeIds: [], affectedHeadingNodeIds: [],
      invalidation: { semanticEntries: false, pagination: false, renderer: false, pageReferenceRefresh: "not-required" },
    })
    expect(JSON.stringify(compareVNextTocV4Semantics({ before: plan, after: plan }))).toBe(JSON.stringify(first))

    const other = document()
    other.document.id = "other"
    expect(compareVNextTocV4Semantics({
      before: plan, after: collectVNextTocV4Semantics(other),
    })).toMatchObject({ status: "blocked", reason: "document-id-mismatch" })
    expect(compareVNextTocV4Semantics({
      before: plan, after: collectVNextTocV4Semantics({}),
    })).toMatchObject({ status: "blocked", reason: "semantic-plan-blocked" })
  })
})
