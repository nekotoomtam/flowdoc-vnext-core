import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import * as Core from "../src/index.js"
import { acceptedAuthoredBoxGeometryFixture } from "./helpers/textBlockAuthoredBoxGeometryV2.js"

const bytes = readFileSync(new URL("./fixtures/text-block-v1-layout-compatibility.v1.json", import.meta.url))
const historical = JSON.parse(bytes.toString("utf8"))
function geometryFacts(value: unknown): unknown {
 if (Array.isArray(value)) return value.map(geometryFacts)
 if (value !== null && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([key]) => !key.toLowerCase().includes("fingerprint")).map(([key, entry]) => [key, geometryFacts(entry)]))
 return value
}
describe("historical V1 evidence with current V2 geometry", () => {
 it("pins original geometry, fingerprint, and rejection evidence byte-for-byte", () => {
  expect(createHash("sha256").update(bytes).digest("hex")).toBe("a886e21c5eb30ed19171b8c88bf60cf8aff550939e371b9176e2f2a1dc9a1f96")
 })
 it("keeps shared authored-box kernels private", () => {
  for (const name of ["convertVNextTextBlockAuthoredBoxKernelV1", "projectVNextTextBlockAuthoredBoxLinesKernelV1", "deriveVNextTextBlockAuthoredBoxAutoHeightKernelV1"]) expect(name in Core).toBe(false)
 })
 it.each(["noExclusion", "middleExclusion"] as const)("retains historical %s geometry and source ranges on V2", (name) => {
  const fixture = acceptedAuthoredBoxGeometryFixture({entries: name === "noExclusion" ? [] : [{objectId:"middle",geometryOwnerFingerprint:`sha256:${"a".repeat(64)}`,xLayoutUnit:35000000,yLayoutUnit:0,widthLayoutUnit:20000000,heightLayoutUnit:20000000,clearance:{topLayoutUnit:0,rightLayoutUnit:0,bottomLayoutUnit:0,leftLayoutUnit:0},wrapPolicy:"rectangular-exclusion"}]})
  const result = Core.layoutVNextTextBlockAuthoredBoxGeometryV2({initialFlow:fixture.initialFlow,evidence:fixture.evidence,persistentFlowTree:fixture.tree,spatialIndex:fixture.spatialIndex})
  expect(result.status).toBe("accepted")
  if(result.status !== "accepted") throw new Error("current geometry blocked")
  expect(result.geometry).toEqual(historical[name].geometry)
  expect(geometryFacts(result.lines)).toMatchObject(geometryFacts(historical[name].lines) as object)
 })
})
