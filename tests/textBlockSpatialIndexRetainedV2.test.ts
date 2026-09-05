import { describe, expect, it } from "vitest"
import { createVNextTextBlockSpatialIndexV2, inspectVNextTextBlockSpatialIndexV2, type VNextTextBlockSyntheticPositionedObjectInputV1 } from "../src/index.js"
import { queryVNextTextBlockSpatialIndexV2 } from "../src/layout/textBlockSpatialIndexV2.js"
import { acceptedInlineImageFlowTreeFixture } from "./helpers/textBlockInlineImageFlowV2.js"
const entry = (objectId: string, yLayoutUnit = 0): VNextTextBlockSyntheticPositionedObjectInputV1 => ({objectId, geometryOwnerFingerprint: `sha256:${"a".repeat(64)}`, xLayoutUnit:0,yLayoutUnit,widthLayoutUnit:1000000,heightLayoutUnit:500000,clearance:{topLayoutUnit:0,rightLayoutUnit:0,bottomLayoutUnit:0,leftLayoutUnit:0},wrapPolicy:"rectangular-exclusion"})
function buildIndex(entries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]) {
 const fixture = acceptedInlineImageFlowTreeFixture({content:"text-only"})
 const result = createVNextTextBlockSpatialIndexV2({inputAuthority:"core-synthetic-qa-only", initialFlow:fixture.initialFlow,evidence:fixture.evidence,persistentFlowTree:fixture.tree,entries})
 if(result.status !== "accepted") throw new Error("retained index fixture blocked")
 return result.index
}
describe("retained spatial index obligations on V2", () => {
 it("retains entry rejection codes without partial indexes", () => {
 const fixture = {...acceptedInlineImageFlowTreeFixture({content:"text-only"}), entries:[entry("left-exclusion")]}
 const build = (entries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]) => createVNextTextBlockSpatialIndexV2({inputAuthority:"core-synthetic-qa-only",initialFlow:fixture.initialFlow,evidence:fixture.evidence,persistentFlowTree:fixture.tree,entries})
 const replaceFirst = (replacement: Record<string, unknown>): readonly VNextTextBlockSyntheticPositionedObjectInputV1[] => [{...fixture.entries[0],...replacement} as VNextTextBlockSyntheticPositionedObjectInputV1]
 expect(build([entry("same"),entry("same")])).toMatchObject({status:"blocked",index:null,issues:[{code:"duplicate-object-id"}]})
    const invalidCases: Array<{
      name: string
      entries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
      code: string
    }> = [
      {
        name: "blank object id",
        entries: replaceFirst({ objectId: " " }),
        code: "invalid-spatial-entry",
      },
      {
        name: "malformed owner fingerprint",
        entries: replaceFirst({ geometryOwnerFingerprint: "not-a-fingerprint" }),
        code: "invalid-spatial-entry",
      },
      {
        name: "unknown wrap policy",
        entries: replaceFirst({ wrapPolicy: "float-around" }),
        code: "unsupported-wrap-policy",
      },
      {
        name: "non-safe integer",
        entries: replaceFirst({ xLayoutUnit: Number.MAX_SAFE_INTEGER + 1 }),
        code: "invalid-spatial-entry",
      },
      {
        name: "zero width",
        entries: replaceFirst({ widthLayoutUnit: 0 }),
        code: "invalid-spatial-entry",
      },
      {
        name: "zero height",
        entries: replaceFirst({ heightLayoutUnit: 0 }),
        code: "invalid-spatial-entry",
      },
      {
        name: "left clearance overflow",
        entries: replaceFirst({
          xLayoutUnit: 0,
          clearance: {
            ...fixture.entries[0].clearance,
            leftLayoutUnit: 1,
          },
        }),
        code: "spatial-boundary-violation",
      },
      {
        name: "negative clearance-envelope top",
        entries: replaceFirst({
          yLayoutUnit: 0,
          clearance: {
            ...fixture.entries[0].clearance,
            topLayoutUnit: 1,
          },
        }),
        code: "spatial-boundary-violation",
      },
      {
        name: "safe integer addition overflow",
        entries: replaceFirst({
          xLayoutUnit: Number.MAX_SAFE_INTEGER,
          widthLayoutUnit: 1,
        }),
        code: "unsafe-spatial-arithmetic",
      },
      {
        name: "horizontal overflow",
        entries: replaceFirst({
          xLayoutUnit: fixture.evidence.availableWidthLayoutUnit - 1,
          widthLayoutUnit: 2,
        }),
        code: "spatial-boundary-violation",
      },
      {
        name: "extra object field",
        entries: replaceFirst({ unexpected: true }),
        // V2 validates its exact data envelope before entry semantics.
        code: "invalid-input",
      },
    ]

    for (const invalidCase of invalidCases) {
      expect(build(invalidCase.entries), invalidCase.name).toMatchObject({
        status: "blocked",
        index: null,
        issues: [{ code: invalidCase.code }],
      })
    }

 })
 it("prunes a 1024-entry half-open band and preserves boundary exclusion", () => {
 const index = buildIndex(Array.from({length:1024},(_,i)=>entry(`entry-${i.toString().padStart(4,"0")}`,i*1000000)))
 const found = queryVNextTextBlockSpatialIndexV2(index,{topLayoutUnit:700000000,bottomLayoutUnit:700000001})
 expect(found.entries.map(e=>e.objectId)).toEqual(["entry-0700"])
 expect(found.visitedNodeCount).toBeLessThan(index.summary.nodeCount)
 expect(queryVNextTextBlockSpatialIndexV2(index,{topLayoutUnit:700500000,bottomLayoutUnit:701000000}).entries).toEqual([])
 expect(inspectVNextTextBlockSpatialIndexV2(structuredClone(index))).toMatchObject({status:"invalid",code:"spatial-index-provenance-mismatch"})
 })
 it("keeps ordinal same-envelope ordering and deterministic frozen fingerprints", () => {
 const ids=["a-b","ab","é","e\u0301"]
 const first=buildIndex(ids.map(id=>entry(id)))
 const second=buildIndex([...ids].reverse().map(id=>entry(id)))
 expect(first).toEqual(second)
 expect(Object.isFrozen(first.root)).toBe(true)
 expect(queryVNextTextBlockSpatialIndexV2(first,{topLayoutUnit:0,bottomLayoutUnit:1}).entries.map(e=>e.objectId)).toEqual(["a-b","ab","e\u0301","é"])
 })
})
