import { readFileSync } from "node:fs"
import * as ts from "typescript"
import { describe, expect, it } from "vitest"
import {
  collectVNextTextBlockSpatialIndexNodesForQaV1,
  createVNextCompactFingerprint,
  createVNextTextBlockSpatialIndexUpdateV1,
  createVNextTextBlockSpatialIndexV1,
  inspectVNextTextBlockSpatialIndexUpdateV1,
  queryVNextTextBlockSpatialIndexV1,
} from "../src/index.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import {
  acceptedSpatialWrappingFixture,
  SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
} from "./helpers/textBlockSpatialWrappingV1.js"

function updateWrapperOwnershipViolations(source: string): readonly string[] {
  const file = ts.createSourceFile("update-wrapper.ts", source, ts.ScriptTarget.Latest, true)
  const violations: string[] = []
  const calledNames = (node: ts.Node): readonly string[] => {
    const names: string[] = []
    const visit = (child: ts.Node): void => {
      if (ts.isCallExpression(child) && ts.isIdentifier(child.expression)) {
        names.push(child.expression.text)
      }
      ts.forEachChild(child, visit)
    }
    visit(node)
    return names
  }
  const visit = (node: ts.Node): void => {
    if (ts.isObjectLiteralExpression(node)) {
      const names = new Set(node.properties.flatMap((property) => (
        ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)
          ? [property.name.getText()]
          : []
      )))
      if (names.has("entry") && names.has("left") && names.has("right")) {
        violations.push("node topology materialization")
      }
    }
    if (ts.isBinaryExpression(node) && [
      ts.SyntaxKind.PlusEqualsToken,
      ts.SyntaxKind.MinusEqualsToken,
    ].includes(node.operatorToken.kind)) {
      const text = node.left.getText()
      if (/createdNodeCount|visitedNodeCount/u.test(text)) violations.push("work accounting")
    }
    if (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) {
      const text = node.operand.getText()
      if (/createdNodeCount|visitedNodeCount/u.test(text)) violations.push("work accounting")
    }
    if (ts.isFunctionDeclaration(node) && node.name != null && node.body != null) {
      const calls = calledNames(node.body)
      const topology = ["left", "right"].every((name) => {
        let found = false
        const scan = (child: ts.Node): void => {
          if (ts.isPropertyAccessExpression(child) && child.name.text === name) found = true
          ts.forEachChild(child, scan)
        }
        scan(node.body!)
        return found
      })
      if (calls.includes(node.name.text) && topology) violations.push("recursive path-copy")
    }
    ts.forEachChild(node, visit)
  }
  visit(file)
  return violations
}

function calledNames(source: string): readonly string[] {
  const file = ts.createSourceFile("update-calls.ts", source, ts.ScriptTarget.Latest, true)
  const names: string[] = []
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) names.push(node.expression.text)
    ts.forEachChild(node, visit)
  }
  visit(file)
  return names
}

function movableSpatialIndexFixture() {
  const fixture = acceptedSpatialWrappingFixture()
  const entries = fixture.entries.map((entry) => (
    entry.objectId === "left-exclusion"
      ? { ...entry, yLayoutUnit: 10_000_000 }
      : entry
  ))
  const built = createVNextTextBlockSpatialIndexV1({
    inputAuthority: "core-synthetic-qa-only",
    persistentFlowTree: fixture.tree,
    request: fixture.request,
    entries,
  })
  if (built.status !== "accepted") throw new Error("movable spatial fixture blocked")
  return {
    ...fixture,
    index: built.index,
  }
}

describe("TextBlock spatial index update v1", () => {
  it("delegates persistent treap path-copy updates to the shared kernel", () => {
    // Catches a future production split that reintroduces path-copy deletion or insertion
    // outside the shared persistent-treap kernel.
    const updateSource = readFileSync(
      new URL("../src/layout/textBlockSpatialIndexUpdateV1.ts", import.meta.url),
      "utf8",
    )
    const internalsSource = readFileSync(
      new URL("../src/layout/textBlockSpatialIndexInternalsV1.ts", import.meta.url),
      "utf8",
    )
    const indexSource = readFileSync(
      new URL("../src/layout/textBlockSpatialIndexV1.ts", import.meta.url),
      "utf8",
    )

    expect(updateSource).toContain("updateVNextTextBlockSpatialIndexRootKernelV1")
    expect(calledNames(updateSource)).toContain("updateVNextTextBlockSpatialIndexRootKernelV1")
    expect(updateWrapperOwnershipViolations(updateSource)).toEqual([])
    expect(internalsSource).not.toContain("deleteSpatialNodePathCopyV1")
    expect(internalsSource).not.toContain("insertSpatialNodePathCopyV1")
    expect(internalsSource).not.toMatch(/function (?:rotate|merge|insert|delete)/u)
    expect(indexSource).not.toContain("maximumBottomLayoutUnit >")
    expect(updateSource).not.toContain("work.createdNodeCount")
  })

  it("rejects renamed local path-copy and work algorithms that lexical helper names miss", () => {
    const renamedDuplicate = `
      function spliceBranch(node: any, work: any): any {
        work.createdNodeCount += 1
        if (node.left != null) return spliceBranch(node.left, work)
        return { entry: node.entry, left: node.left, right: node.right }
      }
    `
    const originalLexicalGuardWouldAccept = !renamedDuplicate.includes(
      "deleteSpatialNodePathCopyV1",
    )

    expect(originalLexicalGuardWouldAccept).toBe(true)
    expect(updateWrapperOwnershipViolations(renamedDuplicate)).toEqual(expect.arrayContaining([
      "node topology materialization",
      "work accounting",
      "recursive path-copy",
    ]))
  })

  it("path-copies a move, reuses untouched nodes, and reports disjoint old/new bands", () => {
    const fixture = movableSpatialIndexFixture()
    const result = createVNextTextBlockSpatialIndexUpdateV1({
      previousIndex: fixture.index,
      expectedPreviousIndexFingerprint: fixture.index.fingerprint,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      objectId: "left-exclusion",
      geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
      nextGeometry: {
        xLayoutUnit: 0,
        yLayoutUnit: 50_000_000,
        widthLayoutUnit: 20_000_000,
        heightLayoutUnit: 20_000_000,
      },
    })

    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("spatial move blocked")
    expect(result.update).toMatchObject({
      previousIndexFingerprint: fixture.index.fingerprint,
      objectId: "left-exclusion",
      affectedBands: [
        { topLayoutUnit: 10_000_000, bottomLayoutUnit: 30_000_000 },
        { topLayoutUnit: 50_000_000, bottomLayoutUnit: 70_000_000 },
      ],
      work: {
        completeIndexRebuildCount: 0,
      },
      contracts: {
        pathCopyUpdate: true,
        oldNewBandUnion: true,
        processLocalProofBinding: true,
        mayPublishLayout: false,
        productionBinding: false,
      },
    })
    expect(result.nextIndex).toBe(result.update.nextIndex)
    expect(result.nextIndex).not.toBe(fixture.index)
    expect(Object.isFrozen(result.update)).toBe(true)
    expect(Object.isFrozen(result.nextIndex)).toBe(true)

    const previousNodes = collectVNextTextBlockSpatialIndexNodesForQaV1(fixture.index)
    const nextNodes = collectVNextTextBlockSpatialIndexNodesForQaV1(result.nextIndex)
    expect(nextNodes.some((node) => previousNodes.includes(node))).toBe(true)
    const previousEntries = new Map(previousNodes.map((node) => [node.entry.objectId, node.entry]))
    const nextEntries = new Map(nextNodes.map((node) => [node.entry.objectId, node.entry]))
    for (const objectId of ["middle-exclusion", "barrier", "overlay"]) {
      expect(nextEntries.get(objectId)).toBe(previousEntries.get(objectId))
    }

    const oldBand = queryVNextTextBlockSpatialIndexV1({
      index: result.nextIndex,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      band: { topLayoutUnit: 10_000_000, bottomLayoutUnit: 11_000_000 },
    })
    const newBand = queryVNextTextBlockSpatialIndexV1({
      index: result.nextIndex,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      band: { topLayoutUnit: 50_000_000, bottomLayoutUnit: 51_000_000 },
    })
    expect(oldBand.status === "accepted"
      ? oldBand.entries.map((entry) => entry.objectId)
      : null).not.toContain("left-exclusion")
    expect(newBand.status === "accepted"
      ? newBand.entries.map((entry) => entry.objectId)
      : null).toContain("left-exclusion")
    expect(inspectVNextTextBlockSpatialIndexUpdateV1({
      update: result.update,
      previousIndex: fixture.index,
      nextIndex: result.nextIndex,
    })).toEqual({
      status: "valid",
      fingerprint: result.update.fingerprint,
    })
  })

  it("merges overlapping resize bands and rejects stale, foreign, or no-op updates", () => {
    const fixture = movableSpatialIndexFixture()
    const update = (
      overrides: Partial<Parameters<typeof createVNextTextBlockSpatialIndexUpdateV1>[0]> = {},
    ) => createVNextTextBlockSpatialIndexUpdateV1({
      previousIndex: fixture.index,
      expectedPreviousIndexFingerprint: fixture.index.fingerprint,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      objectId: "left-exclusion",
      geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
      nextGeometry: {
        xLayoutUnit: 0,
        yLayoutUnit: 10_000_000,
        widthLayoutUnit: 20_000_000,
        heightLayoutUnit: 20_000_000,
      },
      ...overrides,
    })
    const moved = update({
      nextGeometry: {
        xLayoutUnit: 0,
        yLayoutUnit: 50_000_000,
        widthLayoutUnit: 20_000_000,
        heightLayoutUnit: 20_000_000,
      },
    })
    expect(moved.status).toBe("accepted")
    if (moved.status !== "accepted") throw new Error("spatial move blocked")
    const resized = createVNextTextBlockSpatialIndexUpdateV1({
      previousIndex: moved.nextIndex,
      expectedPreviousIndexFingerprint: moved.nextIndex.fingerprint,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      objectId: "left-exclusion",
      geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
      nextGeometry: {
        xLayoutUnit: 0,
        yLayoutUnit: 55_000_000,
        widthLayoutUnit: 20_000_000,
        heightLayoutUnit: 30_000_000,
      },
    })
    expect(resized.status).toBe("accepted")
    if (resized.status !== "accepted") throw new Error("spatial resize blocked")
    expect(resized.update.affectedBands).toEqual([
      { topLayoutUnit: 50_000_000, bottomLayoutUnit: 85_000_000 },
    ])
    const resizedBand = queryVNextTextBlockSpatialIndexV1({
      index: resized.nextIndex,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      band: { topLayoutUnit: 84_000_000, bottomLayoutUnit: 85_000_000 },
    })
    expect(resizedBand.status === "accepted"
      ? resizedBand.entries.map((entry) => entry.objectId)
      : null).toContain("left-exclusion")

    const rejected = [
      update(),
      update({ expectedPreviousIndexFingerprint: `sha256:${"0".repeat(64)}` }),
      update({ geometryOwnerFingerprint: `sha256:${"b".repeat(64)}` }),
      update({ objectId: "missing-object" }),
      update({ previousIndex: structuredClone(fixture.index) }),
      update({ persistentFlowTree: structuredClone(fixture.tree) }),
      update({ request: structuredClone(fixture.request) }),
      update({
        nextGeometry: {
          xLayoutUnit: fixture.request.availableWidthLayoutUnit - 1,
          yLayoutUnit: 10_000_000,
          widthLayoutUnit: 2,
          heightLayoutUnit: 20_000_000,
        },
      }),
    ]
    expect(rejected.map((result) => (
      result.status === "blocked" ? result.issues[0]?.code : "accepted"
    ))).toEqual([
      "no-spatial-change",
      "spatial-index-stale",
      "spatial-owner-mismatch",
      "spatial-object-not-found",
      "spatial-index-stale",
      "spatial-index-stale",
      "spatial-index-stale",
      "spatial-boundary-violation",
    ])

    const extraGeometry = update({
      nextGeometry: {
        xLayoutUnit: 0,
        yLayoutUnit: 20_000_000,
        widthLayoutUnit: 20_000_000,
        heightLayoutUnit: 20_000_000,
        unexpected: true,
      } as Parameters<typeof createVNextTextBlockSpatialIndexUpdateV1>[0]["nextGeometry"],
    })
    expect(extraGeometry).toMatchObject({
      status: "blocked",
      update: null,
      nextIndex: null,
      work: null,
      issues: [{ code: "invalid-spatial-entry" }],
    })
    expect(inspectVNextTextBlockSpatialIndexUpdateV1({
      update: structuredClone(moved.update),
      previousIndex: fixture.index,
      nextIndex: moved.nextIndex,
    })).toMatchObject({
      status: "invalid",
      code: "spatial-update-provenance-mismatch",
    })
    expect(inspectVNextTextBlockSpatialIndexUpdateV1({
      update: moved.update,
      previousIndex: fixture.index,
      nextIndex: structuredClone(moved.nextIndex),
    })).toMatchObject({
      status: "invalid",
      code: "spatial-update-binding-mismatch",
    })
    const alteredUpdate = structuredClone(moved.update)
    alteredUpdate.affectedBands = [{
      topLayoutUnit: 0,
      bottomLayoutUnit: 1,
    }]
    const { fingerprint: _discardedFingerprint, ...alteredFacts } = alteredUpdate
    alteredUpdate.fingerprint = createVNextCompactFingerprint(
      stringifyVNextCanonicalJson(alteredFacts),
    )
    expect(inspectVNextTextBlockSpatialIndexUpdateV1({
      update: alteredUpdate,
      previousIndex: fixture.index,
      nextIndex: moved.nextIndex,
    })).toMatchObject({
      status: "invalid",
      code: "spatial-update-provenance-mismatch",
    })
  })

  it("counts nodes inspected while merging both delete subtrees", () => {
    const fixture = acceptedSpatialWrappingFixture()
    const entries = Array.from({ length: 64 }, (_, index) => ({
      ...fixture.entries[0],
      objectId: `merge-${index.toString().padStart(2, "0")}`,
      xLayoutUnit: 0,
      yLayoutUnit: index * 3_000_000,
      widthLayoutUnit: 1_000_000,
      heightLayoutUnit: 1_000_000,
    }))
    const built = createVNextTextBlockSpatialIndexV1({
      inputAuthority: "core-synthetic-qa-only",
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      entries,
    })
    expect(built.status).toBe("accepted")
    if (built.status !== "accepted") throw new Error("merge-count index blocked")
    const stack = built.index.root == null
      ? []
      : [{ node: built.index.root, pathVisitedNodeCount: 1 }]
    let target = stack[0]
    while (stack.length > 0) {
      const candidate = stack.pop()!
      if (candidate.node.left != null && candidate.node.right != null) {
        target = candidate
        break
      }
      if (candidate.node.left != null) stack.push({
        node: candidate.node.left,
        pathVisitedNodeCount: candidate.pathVisitedNodeCount + 1,
      })
      if (candidate.node.right != null) stack.push({
        node: candidate.node.right,
        pathVisitedNodeCount: candidate.pathVisitedNodeCount + 1,
      })
    }
    if (
      target == null
      || target.node.left == null
      || target.node.right == null
    ) throw new Error("merge-count fixture has no two-child node")
    const result = createVNextTextBlockSpatialIndexUpdateV1({
      previousIndex: built.index,
      expectedPreviousIndexFingerprint: built.index.fingerprint,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      objectId: target.node.entry.objectId,
      geometryOwnerFingerprint: target.node.entry.geometryOwnerFingerprint,
      nextGeometry: {
        xLayoutUnit: target.node.entry.xLayoutUnit,
        yLayoutUnit: target.node.entry.yLayoutUnit + 500_000,
        widthLayoutUnit: target.node.entry.widthLayoutUnit,
        heightLayoutUnit: target.node.entry.heightLayoutUnit,
      },
    })
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("merge-count update blocked")
    expect(result.work.deleteVisitedNodeCount).toBeGreaterThan(
      target.pathVisitedNodeCount,
    )
  })

  it("updates only the ordinally distinct same-envelope object id", () => {
    const fixture = acceptedSpatialWrappingFixture()
    const entries = ["a-b", "ab"].map((objectId) => ({
      ...fixture.entries[0],
      objectId,
      xLayoutUnit: 10_000_000,
      yLayoutUnit: 10_000_000,
      widthLayoutUnit: 10_000_000,
      heightLayoutUnit: 10_000_000,
    }))
    const built = createVNextTextBlockSpatialIndexV1({
      inputAuthority: "core-synthetic-qa-only",
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      entries,
    })
    expect(built.status).toBe("accepted")
    if (built.status !== "accepted") throw new Error("ordinal update index blocked")
    const updated = createVNextTextBlockSpatialIndexUpdateV1({
      previousIndex: built.index,
      expectedPreviousIndexFingerprint: built.index.fingerprint,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      objectId: "a-b",
      geometryOwnerFingerprint: entries[0]!.geometryOwnerFingerprint,
      nextGeometry: {
        xLayoutUnit: 10_000_000,
        yLayoutUnit: 30_000_000,
        widthLayoutUnit: 10_000_000,
        heightLayoutUnit: 10_000_000,
      },
    })
    expect(updated.status).toBe("accepted")
    if (updated.status !== "accepted") throw new Error("ordinal update blocked")
    const previousBand = queryVNextTextBlockSpatialIndexV1({
      index: updated.nextIndex,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      band: { topLayoutUnit: 10_000_000, bottomLayoutUnit: 11_000_000 },
    })
    const nextBand = queryVNextTextBlockSpatialIndexV1({
      index: updated.nextIndex,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      band: { topLayoutUnit: 30_000_000, bottomLayoutUnit: 31_000_000 },
    })
    expect(previousBand.status === "accepted"
      ? previousBand.entries.map((entry) => entry.objectId)
      : null).toEqual(["ab"])
    expect(nextBand.status === "accepted"
      ? nextBand.entries.map((entry) => entry.objectId)
      : null).toEqual(["a-b"])
  })
})
