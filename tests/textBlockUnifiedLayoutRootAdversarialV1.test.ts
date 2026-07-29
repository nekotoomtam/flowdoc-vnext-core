import { describe, expect, it } from "vitest"
import {
  createVNextTextBlockUnifiedLayoutRootV1,
  inspectVNextTextBlockUnifiedLayoutRootV1,
} from "../src/layout/textBlockUnifiedLayoutRootV1.js"
import {
  inspectVNextTextBlockUnifiedLayoutSceneV1,
} from "../src/layout/textBlockUnifiedLayoutSceneV1.js"
import {
  inspectVNextTextBlockUnifiedLayoutRootBindingInternalV1,
  registerVNextTextBlockUnifiedLayoutRootInternalV1,
} from "../src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV1.js"
import type { VNextTextBlockUnifiedLayoutRootV1 } from "../src/layout/textBlockUnifiedLayoutRootContractV1.js"
import { acceptedInlineImageEvidenceFixture } from "./helpers/textBlockInlineImageFlowV2.js"

function acceptedRoot(content: "text-only" | "text-image-text" = "text-image-text") {
  const fixture = acceptedInlineImageEvidenceFixture({ content })
  const result = createVNextTextBlockUnifiedLayoutRootV1({
    inputAuthority: "core-synthetic-qa-only",
    initialFlow: fixture.initialFlow,
    evidence: fixture.evidence,
    spatialEntries: [],
  })
  if (result.status !== "accepted") throw new Error("adversarial root fixture blocked")
  return { fixture, root: result.root }
}

function expectInvalidRoot(value: unknown): void {
  expect(inspectVNextTextBlockUnifiedLayoutRootV1(value)).toMatchObject({
    status: "invalid",
  })
}

describe("unified TextBlock layout root adversarial authority v1", () => {
  it("rejects clone, structurally equal replacement, reordered scene, mutable wrapper, and re-fingerprinted clone", () => {
    // Catches any change that turns exact process-local authority into structural equality.
    const { root } = acceptedRoot()
    const clonedRoot = structuredClone(root)
    const equalReplacement = Object.freeze({ ...root })
    const reorderedSceneRoot = structuredClone(root)
    ;(reorderedSceneRoot.scene.chunks as unknown as unknown[]).reverse()
    const mutableWrapperRoot = structuredClone(root)
    ;(mutableWrapperRoot.work as unknown as { rootWrapperAllocationCount: number }).rootWrapperAllocationCount = 2
    const refingerprintedRoot = structuredClone(root)
    refingerprintedRoot.fingerprint = `sha256:${"f".repeat(64)}`

    expect(reorderedSceneRoot.scene.chunks.map((chunk) => chunk.chunkIndex))
      .toEqual([...root.scene.chunks].reverse().map((chunk) => chunk.chunkIndex))
    expect(mutableWrapperRoot.work.rootWrapperAllocationCount).toBe(2)
    expect(refingerprintedRoot.fingerprint).not.toBe(root.fingerprint)
    for (const candidate of [clonedRoot, equalReplacement, reorderedSceneRoot, mutableWrapperRoot, refingerprintedRoot]) {
      expectInvalidRoot(candidate)
    }
    expect(inspectVNextTextBlockUnifiedLayoutSceneV1(structuredClone(root.scene))).toMatchObject({
      status: "invalid",
      code: "unregistered-unified-layout-scene",
    })
  })

  it("rejects every foreign retained child after a root is registered", () => {
    // Catches registration that trusts a root shell without checking its exact retained child identities.
    const { root } = acceptedRoot()
    const bindings = {
      initialFlow: root.initialFlow,
      evidence: root.evidence,
      persistentFlowTree: root.persistentFlowTree,
      spatialIndex: root.spatialIndex,
      spatialLayout: root.spatialLayout,
      authoredBoxGeometry: root.authoredBoxGeometry,
      scene: root.scene,
    }
    const keys = [
      "persistentFlowTree",
      "spatialIndex",
      "spatialLayout",
      "authoredBoxGeometry",
      "scene",
    ] as const

    for (const key of keys) {
      const foreignRoot = Object.freeze({
        ...root,
        [key]: structuredClone(root[key]),
      }) as VNextTextBlockUnifiedLayoutRootV1
      registerVNextTextBlockUnifiedLayoutRootInternalV1({
        root: foreignRoot,
        ...bindings,
        canonicalRootFacts: "foreign child must be rejected before canonical facts",
      })
      expect(inspectVNextTextBlockUnifiedLayoutRootBindingInternalV1(foreignRoot)).toMatchObject({
        status: "invalid",
        code: "unified-layout-dependency-mismatch",
      })
    }
  })

  it("blocks foreign Initial Flow/evidence pairs and unsafe spatial entries without partial root or scene", () => {
    const text = acceptedInlineImageEvidenceFixture({ content: "text-only" })
    const mixed = acceptedInlineImageEvidenceFixture({ content: "text-image-text" })
    const attempts = [
      {
        inputAuthority: "core-synthetic-qa-only",
        initialFlow: text.initialFlow,
        evidence: mixed.evidence,
        spatialEntries: [],
        code: "flow-evidence-provenance-mismatch",
      },
      {
        inputAuthority: "core-synthetic-qa-only",
        initialFlow: mixed.initialFlow,
        evidence: text.evidence,
        spatialEntries: [],
        code: "flow-evidence-provenance-mismatch",
      },
      {
        inputAuthority: "core-synthetic-qa-only",
        initialFlow: mixed.initialFlow,
        evidence: mixed.evidence,
        spatialEntries: [{
          objectId: "unsafe",
          geometryOwnerFingerprint: `sha256:${"a".repeat(64)}`,
          xLayoutUnit: Number.MAX_SAFE_INTEGER + 1,
          yLayoutUnit: 0,
          widthLayoutUnit: 1,
          heightLayoutUnit: 1,
          clearance: { topLayoutUnit: 0, rightLayoutUnit: 0, bottomLayoutUnit: 0, leftLayoutUnit: 0 },
          wrapPolicy: "rectangular-exclusion",
        }],
        code: "spatial-index-blocked",
      },
    ] as const
    for (const attempt of attempts) {
      const { code, ...input } = attempt
      expect(createVNextTextBlockUnifiedLayoutRootV1(input)).toMatchObject({
        status: "blocked",
        root: null,
        scene: null,
        issues: [{ code: attempt.code }],
      })
    }
  })

  it("rejects accessor, class, symbol, throwing proxy, and present undefined production input without reading getters", () => {
    // Catches strict-envelope regressions that read attacker-controlled values before rejecting them.
    const { fixture } = acceptedRoot()
    let accessorReads = 0
    let proxyGets = 0
    const accessorInput = Object.create(null)
    Object.defineProperties(accessorInput, {
      inputAuthority: { enumerable: true, value: "core-synthetic-qa-only" },
      initialFlow: { enumerable: true, get: () => { accessorReads += 1; return fixture.initialFlow } },
      evidence: { enumerable: true, value: fixture.evidence },
      spatialEntries: { enumerable: true, value: [] },
    })
    const classInput = new (class RootInput {
      inputAuthority = "core-synthetic-qa-only" as const
      initialFlow = fixture.initialFlow
      evidence = fixture.evidence
      spatialEntries: readonly unknown[] = []
    })()
    const symbolInput = {
      inputAuthority: "core-synthetic-qa-only",
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      spatialEntries: [],
      [Symbol("unexpected")]: true,
    }
    const proxyInput = new Proxy({
      inputAuthority: "core-synthetic-qa-only" as const,
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      spatialEntries: [],
    }, {
      get(target, key, receiver) {
        proxyGets += 1
        return Reflect.get(target, key, receiver)
      },
    })
    const throwingProxy = new Proxy({}, { ownKeys: () => { throw new Error("must stay inside strict-input catch") } })
    const invalidInputs = [
      accessorInput,
      classInput,
      symbolInput,
      throwingProxy,
      {
        inputAuthority: "core-synthetic-qa-only",
        initialFlow: fixture.initialFlow,
        evidence: fixture.evidence,
        spatialEntries: [],
        bindProductionLayout: undefined,
      },
    ]
    for (const input of invalidInputs) {
      expect(createVNextTextBlockUnifiedLayoutRootV1(input)).toMatchObject({
        status: "blocked",
        root: null,
        scene: null,
        issues: [{ code: "invalid-input" }],
      })
    }
    expect(createVNextTextBlockUnifiedLayoutRootV1(proxyInput)).toMatchObject({ status: "accepted" })
    expect(accessorReads).toBe(0)
    expect(proxyGets).toBe(0)
  })

  it("remains valid after attempted direct mutation of the registered root and scene", () => {
    // Catches shallow freezing that lets callers change retained facts after authority registration.
    const { root } = acceptedRoot()
    expect(() => { (root as { fingerprint: string }).fingerprint = "changed" }).toThrow(TypeError)
    expect(() => { (root.scene.chunks as unknown as unknown[]).push(null) }).toThrow(TypeError)
    expect(() => { (root.contracts as { productionBinding: boolean }).productionBinding = true }).toThrow(TypeError)
    expect(inspectVNextTextBlockUnifiedLayoutRootV1(root)).toMatchObject({ status: "valid" })
    expect(inspectVNextTextBlockUnifiedLayoutSceneV1(root.scene)).toMatchObject({ status: "valid" })
  })
})
