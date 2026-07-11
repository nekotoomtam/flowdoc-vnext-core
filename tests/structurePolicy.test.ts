import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  VNEXT_DOCUMENT_V4_ALLOWED_CHILD_TYPES,
  VNEXT_DOCUMENT_V4_AUTHORED_NODE_TYPES,
  VNextStructurePolicySetV1Schema,
  evaluateVNextEffectiveChildCompositionV1,
  evaluateVNextEffectiveNodeCapabilityV1,
  resolveVNextStructurePolicyV1,
  type VNextStructurePolicySetV1,
} from "../src/index.js"

function policySet(): VNextStructurePolicySetV1 {
  return VNextStructurePolicySetV1Schema.parse({
    contractVersion: 1,
    kind: "structure-policy-set",
    policySetId: "operation-guide:policies",
    owner: {
      kind: "published-structure-version",
      ref: {
        structureId: "operation-guide",
        structureVersionId: "operation-guide@v1",
        versionOrdinal: 1,
      },
    },
    defaultPolicyKey: "locked",
    policies: {
      locked: { key: "locked", nodeActions: [] },
      body: {
        key: "body",
        nodeActions: ["node.reorder"],
        children: {
          actions: ["child.insert", "child.delete", "child.duplicate", "child.reorder"],
          allowedChildTypes: ["text-block", "image", "table", "columns"],
          minChildren: 1,
          maxChildren: 10,
          childPolicyKey: "body-item",
        },
      },
      "body-item": {
        key: "body-item",
        nodeActions: ["node.delete", "node.duplicate", "node.reorder", "content.edit", "style.apply"],
        allowedStyleKeys: ["body", "heading-2", "caption"],
      },
    },
    nodeBindings: {
      cover: "locked",
      "body-zone": "body",
    },
  })
}

describe("structure policy", () => {
  it("keeps policy vocabulary aligned with document v4 authored node types", () => {
    expect([...VNEXT_DOCUMENT_V4_AUTHORED_NODE_TYPES]).toEqual(Object.keys(VNEXT_DOCUMENT_V4_ALLOWED_CHILD_TYPES))
  })

  it("resolves explicit, parent-child, and default policy without inheritance chains", () => {
    const set = policySet()
    expect(resolveVNextStructurePolicyV1(set, "cover")).toMatchObject({ policyKey: "locked", source: "explicit-node" })
    expect(resolveVNextStructurePolicyV1(set, "new-paragraph", "body")).toMatchObject({
      policyKey: "body-item",
      source: "parent-child",
    })
    expect(resolveVNextStructurePolicyV1(set, "unbound")).toMatchObject({ policyKey: "locked", source: "set-default" })
  })

  it("intersects core, structure, and session node capability with distinct denial layers", () => {
    const policy = policySet().policies["body-item"]
    expect(evaluateVNextEffectiveNodeCapabilityV1({
      action: "content.edit",
      coreAllowed: true,
      policy,
      sessionAllowed: true,
    })).toMatchObject({ allowed: true, denials: [] })

    expect(evaluateVNextEffectiveNodeCapabilityV1({
      action: "style.override",
      coreAllowed: false,
      policy,
      sessionAllowed: false,
    })).toMatchObject({
      allowed: false,
      denials: [
        { code: "core-capability-denied", layer: "core" },
        { code: "structure-policy-denied", layer: "structure" },
        { code: "session-permission-denied", layer: "session" },
      ],
    })
  })

  it("checks parent child action, type, cardinality, core containment, and session permission", () => {
    const parentPolicy = policySet().policies.body
    expect(evaluateVNextEffectiveChildCompositionV1({
      action: "child.insert",
      childType: "text-block",
      coreAllowedChildTypes: VNEXT_DOCUMENT_V4_ALLOWED_CHILD_TYPES.zone,
      currentChildCount: 1,
      parentPolicy,
      sessionAllowed: true,
    })).toMatchObject({ allowed: true, denials: [] })

    expect(evaluateVNextEffectiveChildCompositionV1({
      action: "child.insert",
      childType: "spacer",
      coreAllowedChildTypes: ["text-block"],
      currentChildCount: 10,
      parentPolicy,
      sessionAllowed: false,
    })).toMatchObject({
      allowed: false,
      denials: [
        { code: "core-child-type-denied", layer: "core" },
        { code: "structure-child-type-denied", layer: "structure" },
        { code: "structure-cardinality-max", layer: "structure" },
        { code: "session-permission-denied", layer: "session" },
      ],
    })
    expect(evaluateVNextEffectiveChildCompositionV1({
      action: "child.delete",
      childType: "text-block",
      coreAllowedChildTypes: [],
      currentChildCount: 1,
      parentPolicy,
      sessionAllowed: true,
    })).toMatchObject({
      allowed: false,
      denials: [{ code: "structure-cardinality-min", layer: "structure" }],
    })
  })

  it("rejects missing references, duplicates, invalid cardinality, and cross-purpose unknowns", () => {
    const base = policySet()
    const invalids = [
      { ...base, defaultPolicyKey: "missing" },
      { ...base, nodeBindings: { cover: "missing" } },
      {
        ...base,
        policies: {
          ...base.policies,
          body: { ...base.policies.body, nodeActions: ["node.reorder", "node.reorder"] },
        },
      },
      {
        ...base,
        policies: {
          ...base.policies,
          body: {
            ...base.policies.body,
            children: { ...base.policies.body.children, minChildren: 3, maxChildren: 2 },
          },
        },
      },
      { ...base, packageVersion: 4 },
    ]
    invalids.forEach((candidate) => expect(VNextStructurePolicySetV1Schema.safeParse(candidate).success).toBe(false))
  })

  it("publishes Phase 271 without activating instance operations", () => {
    const doc = readFileSync(new URL("../docs/STRUCTURE_POLICY_EFFECTIVE_CAPABILITY_CONTRACT.md", import.meta.url), "utf8")
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")

    expect(doc).toContain("## Resolution Precedence")
    expect(doc).toContain("## Effective Capability")
    expect(doc).toContain("## Cardinality And Containment")
    expect(doc).toMatch(/does not wire policy into current v4\s+operations/)
    expect(readme).toContain("Phase 271 adds strict Structure Policy and effective capability contracts")
    expect(ledger).toContain("| 271 | Structure Policy and effective capability contracts | done |")
  })
})
