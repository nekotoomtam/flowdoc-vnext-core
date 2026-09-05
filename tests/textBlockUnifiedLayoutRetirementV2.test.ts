import {describe,expect,it} from "vitest"
import {createVNextTextBlockUnifiedLayoutRootV2,inspectVNextTextBlockUnifiedLayoutRootV2} from "../src/index.js"
import type {VNextTextBlockSyntheticPositionedObjectInputV1} from "../src/layout/textBlockSpatialIndexContractV1.js"
import {acceptedInlineImageEvidenceFixture} from "./helpers/textBlockInlineImageFlowV2.js"
import {acceptedUnifiedLayoutRootFixtureV2} from "./helpers/textBlockUnifiedLayoutRootV2.js"
const geometryOwnerFingerprint = `sha256:${"9".repeat(64)}`

function spatialEntry(input: {
  objectId: string
  leftLayoutUnit: number
  rightLayoutUnit: number
  topLayoutUnit?: number
  bottomLayoutUnit?: number
  wrapPolicy?: "rectangular-exclusion" | "top-bottom-barrier" | "overlay"
}): VNextTextBlockSyntheticPositionedObjectInputV1 {
  const topLayoutUnit = input.topLayoutUnit ?? 0
  const bottomLayoutUnit = input.bottomLayoutUnit ?? 20_000_000
  return {
    objectId: input.objectId,
    geometryOwnerFingerprint,
    xLayoutUnit: input.leftLayoutUnit,
    yLayoutUnit: topLayoutUnit,
    widthLayoutUnit: input.rightLayoutUnit - input.leftLayoutUnit,
    heightLayoutUnit: bottomLayoutUnit - topLayoutUnit,
    clearance: {
      topLayoutUnit: 0,
      rightLayoutUnit: 0,
      bottomLayoutUnit: 0,
      leftLayoutUnit: 0,
    },
    wrapPolicy: input.wrapPolicy ?? "rectangular-exclusion",
  }
}


// Corpus retained from e3b9888b25fe963ef4316fe8066d086bae55db47, RootV1.test.ts:609.
describe("retired RootV1 corpus at the V2 boundary",()=>{
  it.each([
    ["text-only", { content: "text-only" }, []],
    ["image-only", { content: "image-only" }, []],
    ["text-image-text", { content: "text-image-text" }, []],
    ["adjacent-images", { content: "adjacent-images" }, []],
    ["text-image-text-break", { content: "text-image-text-break" }, []],
    ["thai-image-latin", { content: "thai-image-latin" }, []],
    ["field-image-page-break", { content: "field-image-page-break" }, []],
    ["baseline image alignment", { content: "image-only", verticalAlign: "baseline" }, []],
    ["middle image alignment", { content: "image-only", verticalAlign: "middle" }, []],
    ["text-bottom image alignment", { content: "image-only", verticalAlign: "text-bottom" }, []],
    ["mixed text sizes", { content: "thai-image-latin", mixedTextSizes: true }, []],
    ["no exclusions", { content: "text-only" }, []],
    ["left exclusion", { content: "image-only" }, [
      spatialEntry({ objectId: "left", leftLayoutUnit: 0, rightLayoutUnit: 20_000_000 }),
    ]],
    ["right exclusion", { content: "image-only" }, [
      spatialEntry({ objectId: "right", leftLayoutUnit: 70_000_000, rightLayoutUnit: 90_000_000 }),
    ]],
    ["central exclusion", { content: "image-only", width: { value: 40, unit: "pt" } }, [
      spatialEntry({ objectId: "central", leftLayoutUnit: 30_000_000, rightLayoutUnit: 50_000_000 }),
    ]],
    ["multiple exclusions", { content: "image-only" }, [
      spatialEntry({ objectId: "multi-left", leftLayoutUnit: 0, rightLayoutUnit: 20_000_000 }),
      spatialEntry({ objectId: "multi-center", leftLayoutUnit: 40_000_000, rightLayoutUnit: 60_000_000 }),
    ]],
    ["top-bottom barrier", { content: "image-only" }, [
      spatialEntry({ objectId: "barrier", leftLayoutUnit: 0, rightLayoutUnit: 90_000_000, wrapPolicy: "top-bottom-barrier" }),
    ]],
    ["overlay-only", { content: "image-only" }, [
      spatialEntry({ objectId: "overlay", leftLayoutUnit: 0, rightLayoutUnit: 90_000_000, wrapPolicy: "overlay" }),
    ]],
    ["full-width zero-space advancement", { content: "image-only" }, [
      spatialEntry({ objectId: "zero-space", leftLayoutUnit: 0, rightLayoutUnit: 90_000_000, bottomLayoutUnit: 1 }),
    ]],
    ["image-expanded-band requery", { content: "image-only", height: { value: 30, unit: "pt" } }, [
      spatialEntry({ objectId: "late-band", leftLayoutUnit: 0, rightLayoutUnit: 90_000_000, topLayoutUnit: 20_000_000, bottomLayoutUnit: 25_000_000 }),
    ]],
  ] as const)("retains the former RootV1 corpus through V2 for %s", (_name, options, spatialEntries) => {

    const fixture=acceptedInlineImageEvidenceFixture(options)
    const result=createVNextTextBlockUnifiedLayoutRootV2({inputAuthority:"core-synthetic-qa-only",initialFlow:fixture.initialFlow,evidence:fixture.evidence,spatialEntries})
    expect(result.status).toBe("accepted")
    if(result.status!=="accepted") throw new Error(_name+" blocked")
    const {root}=result
    expect(inspectVNextTextBlockUnifiedLayoutRootV2(root)).toMatchObject({status:"valid"})
    expect(root.contracts).toMatchObject({mayPublishLayout:false,productionBinding:false,stagedEditorApply:false})
    expect(root.persistentScene.contracts).toMatchObject({mayPublishLayout:false,productionBinding:false,stagedEditorApply:false})
    expect(root.dependencyFingerprints.sourceState).toBe(root.sourceState.fingerprint)
    expect(root.dependencyFingerprints.flowTree).toBe(root.flowTree.fingerprint)
    expect(root.dependencyFingerprints.lineTree).toBe(root.lineTree.fingerprint)
    expect(root.dependencyFingerprints.persistentScene).toBe(root.persistentScene.fingerprint)
  })
  it("keeps cloned, replaced and refingerprinted children outside Root authority",()=>{
    const {root}=acceptedUnifiedLayoutRootFixtureV2({content:"text-image-text-break"})
    const candidates=[structuredClone(root),Object.freeze({...root}),{...root,fingerprint:"sha256:"+"f".repeat(64)}]
    for(const key of ["sourceState","flowTree","spatialState","lineTree","persistentScene"] as const) {
      candidates.push(Object.freeze({...root,[key]:structuredClone(root[key])}))
    }
    for(const candidate of candidates) expect(inspectVNextTextBlockUnifiedLayoutRootV2(candidate)).toMatchObject({status:"invalid"})
    expect(Reflect.set(root,"fingerprint","mutated")).toBe(false)
    expect(inspectVNextTextBlockUnifiedLayoutRootV2(root)).toMatchObject({status:"valid"})
  })
})
