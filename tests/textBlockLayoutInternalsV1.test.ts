import { describe, expect, it } from "vitest"
import { createVNextTextBlockPersistentFlowTreeV1 } from "../src/index.js"
import {
  bindVNextTextBlockSpatialIndexAuthorityInternalV1,
  getOrCreateVNextTextBlockV1LayoutAuthorityInternalV1,
  getVNextTextBlockV2LayoutAuthorityInternalV1,
  hasVNextTextBlockSpatialIndexAuthorityInternalV1,
  registerVNextTextBlockV2LayoutAuthorityInternalV1,
} from "../src/layout/textBlockLayoutAuthorityInternalsV1.js"
import {
  buildVNextTextBlockPersistentRopeRootKernelV1,
  collectVNextTextBlockPersistentRopeNodesKernelV1,
  countVNextTextBlockPersistentRopeNodesKernelV1,
  partitionVNextTextBlockPersistentValuesKernelV1,
} from "../src/layout/textBlockPersistentRopeKernelV1.js"
import { acceptedInlineImageEvidenceFixture } from "./helpers/textBlockInlineImageFlowV2.js"
import { acceptedPersistentFlowFixture } from "./helpers/textBlockPersistentFlowV1.js"

type TestRopeNode = {
  kind: "leaf"
  id: string
} | {
  kind: "branch"
  id: string
  children: readonly TestRopeNode[]
}

function testNodeChildren(node: TestRopeNode): readonly TestRopeNode[] {
  return node.kind === "branch" ? node.children : []
}

function v1AuthorityFixture() {
  const fixture = acceptedPersistentFlowFixture()
  const result = createVNextTextBlockPersistentFlowTreeV1(fixture)
  if (result.status !== "accepted") throw new Error("V1 authority fixture blocked")
  return { ...fixture, tree: result.tree }
}

describe("TextBlock persistent rope kernel v1", () => {
  it("rejects empty roots, invalid safe limits, and fanout one", () => {
    expect(() => buildVNextTextBlockPersistentRopeRootKernelV1<TestRopeNode>({
      leaves: [],
      maximumBranchChildren: 2,
      createBranch: (children) => ({ kind: "branch", id: "unused", children }),
    })).toThrow("persistent rope requires at least one leaf")

    for (const maximumValues of [0, -1, 1.5, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => partitionVNextTextBlockPersistentValuesKernelV1(
        ["leaf"],
        maximumValues,
      )).toThrow("maximumValues must be a positive safe integer")
    }

    for (const maximumBranchChildren of [
      0,
      -1,
      1.5,
      Number.POSITIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      expect(() => buildVNextTextBlockPersistentRopeRootKernelV1<TestRopeNode>({
        leaves: [{ kind: "leaf" as const, id: "leaf" }],
        maximumBranchChildren,
        createBranch: (children) => ({ kind: "branch", id: "unused", children }),
      })).toThrow("maximumBranchChildren must be a positive safe integer")
    }

    expect(() => buildVNextTextBlockPersistentRopeRootKernelV1<TestRopeNode>({
      leaves: [{ kind: "leaf" as const, id: "leaf" }],
      maximumBranchChildren: 1,
      createBranch: (children) => ({ kind: "branch", id: "unused", children }),
    })).toThrow("maximumBranchChildren must be at least two")
  })

  it("partitions into balanced groups without changing source order", () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const groups = partitionVNextTextBlockPersistentValuesKernelV1(values, 3)

    expect(groups).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8],
      [9, 10],
    ])
    expect(groups.map((group) => group.length)).toEqual([3, 3, 2, 2])
    expect(groups.flat()).toEqual(values)
  })

  it("builds balanced generated levels and preserves leaf order", () => {
    const leaves: TestRopeNode[] = Array.from({ length: 11 }, (_value, index) => ({
      kind: "leaf",
      id: `leaf-${index}`,
    }))
    let branchIndex = 0
    const root = buildVNextTextBlockPersistentRopeRootKernelV1<TestRopeNode>({
      leaves,
      maximumBranchChildren: 3,
      createBranch: (children) => ({
        kind: "branch",
        id: `branch-${branchIndex += 1}`,
        children,
      }),
    })
    const leafFacts: Array<{ id: string; depth: number }> = []
    const branchFanouts: number[] = []
    const visit = (node: TestRopeNode, depth: number): void => {
      if (node.kind === "leaf") {
        leafFacts.push({ id: node.id, depth })
        return
      }
      branchFanouts.push(node.children.length)
      node.children.forEach((child) => visit(child, depth + 1))
    }
    visit(root, 0)

    expect(leafFacts.map(({ id }) => id)).toEqual(leaves.map(({ id }) => id))
    expect([...new Set(leafFacts.map(({ depth }) => depth))]).toEqual([3])
    expect(branchFanouts.every((fanout) => fanout >= 2 && fanout <= 3)).toBe(true)
  })

  it("collects stable pre-order references and counts generic nodes", () => {
    const leafA: TestRopeNode = { kind: "leaf", id: "a" }
    const leafB: TestRopeNode = { kind: "leaf", id: "b" }
    const leafC: TestRopeNode = { kind: "leaf", id: "c" }
    const left: TestRopeNode = {
      kind: "branch",
      id: "left",
      children: [leafA, leafB],
    }
    const right: TestRopeNode = {
      kind: "branch",
      id: "right",
      children: [leafC],
    }
    const root: TestRopeNode = {
      kind: "branch",
      id: "root",
      children: [left, right],
    }

    expect(collectVNextTextBlockPersistentRopeNodesKernelV1({
      root,
      children: testNodeChildren,
    })).toEqual([root, left, leafA, leafB, right, leafC])
    expect(countVNextTextBlockPersistentRopeNodesKernelV1({
      root,
      children: testNodeChildren,
    })).toBe(6)
  })
})

describe("TextBlock layout authority internals v1", () => {
  it("rejects non-exact V1 bindings before returning a stable exact token", () => {
    const fixture = v1AuthorityFixture()

    expect(getOrCreateVNextTextBlockV1LayoutAuthorityInternalV1({
      persistentFlowTree: fixture.tree,
      request: structuredClone(fixture.request),
    })).toBeNull()
    expect(getOrCreateVNextTextBlockV1LayoutAuthorityInternalV1({
      persistentFlowTree: structuredClone(fixture.tree),
      request: fixture.request,
    })).toBeNull()

    const authority = getOrCreateVNextTextBlockV1LayoutAuthorityInternalV1({
      persistentFlowTree: fixture.tree,
      request: fixture.request,
    })
    expect(authority).not.toBeNull()
    expect(getOrCreateVNextTextBlockV1LayoutAuthorityInternalV1({
      persistentFlowTree: fixture.tree,
      request: fixture.request,
    })).toBe(authority)
    expect(Object.isFrozen(authority)).toBe(true)
    expect(Object.keys(authority!)).toEqual([])
    expect(Object.getOwnPropertyNames(authority!)).toEqual([])
    expect(JSON.stringify(authority)).toBe("{}")
  })

  it("requires the exact V2 tuple and replaces a colliding tree registration", () => {
    const first = acceptedInlineImageEvidenceFixture()
    const second = acceptedInlineImageEvidenceFixture()
    const persistentFlowTree = {}
    const firstAuthority = registerVNextTextBlockV2LayoutAuthorityInternalV1({
      ...first,
      persistentFlowTree,
    })

    expect(getVNextTextBlockV2LayoutAuthorityInternalV1({
      ...first,
      persistentFlowTree,
    })).toBe(firstAuthority)
    expect(getVNextTextBlockV2LayoutAuthorityInternalV1({
      initialFlow: structuredClone(first.initialFlow),
      evidence: first.evidence,
      persistentFlowTree,
    })).toBeNull()
    expect(getVNextTextBlockV2LayoutAuthorityInternalV1({
      initialFlow: first.initialFlow,
      evidence: structuredClone(first.evidence),
      persistentFlowTree,
    })).toBeNull()
    expect(getVNextTextBlockV2LayoutAuthorityInternalV1({
      initialFlow: second.initialFlow,
      evidence: first.evidence,
      persistentFlowTree,
    })).toBeNull()
    expect(getVNextTextBlockV2LayoutAuthorityInternalV1({
      initialFlow: first.initialFlow,
      evidence: second.evidence,
      persistentFlowTree,
    })).toBeNull()

    const secondAuthority = registerVNextTextBlockV2LayoutAuthorityInternalV1({
      ...second,
      persistentFlowTree,
    })
    expect(secondAuthority).not.toBe(firstAuthority)
    expect(getVNextTextBlockV2LayoutAuthorityInternalV1({
      ...first,
      persistentFlowTree,
    })).toBeNull()
    expect(getVNextTextBlockV2LayoutAuthorityInternalV1({
      ...second,
      persistentFlowTree,
    })).toBe(secondAuthority)
  })

  it("binds and rebinds a spatial index by exact authority identity", () => {
    const first = acceptedInlineImageEvidenceFixture()
    const second = acceptedInlineImageEvidenceFixture()
    const firstAuthority = registerVNextTextBlockV2LayoutAuthorityInternalV1({
      ...first,
      persistentFlowTree: {},
    })
    const secondAuthority = registerVNextTextBlockV2LayoutAuthorityInternalV1({
      ...second,
      persistentFlowTree: {},
    })
    const index = {}

    expect(hasVNextTextBlockSpatialIndexAuthorityInternalV1(
      index,
      firstAuthority,
    )).toBe(false)
    bindVNextTextBlockSpatialIndexAuthorityInternalV1(index, firstAuthority)
    expect(hasVNextTextBlockSpatialIndexAuthorityInternalV1(
      index,
      firstAuthority,
    )).toBe(true)
    expect(hasVNextTextBlockSpatialIndexAuthorityInternalV1(
      index,
      secondAuthority,
    )).toBe(false)

    bindVNextTextBlockSpatialIndexAuthorityInternalV1(index, secondAuthority)
    expect(hasVNextTextBlockSpatialIndexAuthorityInternalV1(
      index,
      firstAuthority,
    )).toBe(false)
    expect(hasVNextTextBlockSpatialIndexAuthorityInternalV1(
      index,
      secondAuthority,
    )).toBe(true)
  })
})
