import { describe, expect, it } from "vitest"
import {
  createVNextDerivedIdentityProvenanceV1,
  createVNextIdentityAllocationInputKeyV1,
} from "../src/identity/identityAllocationInputV1.js"
import { auditVNextDerivedIdentityBatchV1 } from "../src/identity/identityBatchAuditV1.js"
import type {
  VNextAllocatedIdentityV1,
  VNextDerivedIdentityOriginV1,
} from "../src/identity/identityStandardV1.js"

function identity(id = "rowi_0123456789ab", fingerprint = "resolution-1"): VNextAllocatedIdentityV1 {
  return {
    contractVersion: 1,
    kind: "allocated-identity",
    identityKind: "resolved-row",
    identityClass: "resolved-entity",
    id,
    allocationOwner: "resolution-orchestrator",
    allocationStrategy: "deterministic",
    scope: {
      kind: "document-resolution",
      documentInstanceId: "document-instance-1",
      instanceRevision: 2,
      resolutionInputFingerprint: fingerprint,
    },
  }
}

function origin(itemKey = "ลูกค้า|2026:0001"): VNextDerivedIdentityOriginV1 {
  return {
    kind: "collection-row",
    refs: {
      tableId: "table-orders",
      rowTemplateId: "row-template-order",
      itemKey,
    },
    revisionPins: {
      dataSnapshotRevision: 7,
      structureVersionOrdinal: 3,
    },
  }
}

describe("identity allocation input and batch audit v1", () => {
  it("creates the same length-safe key regardless of map insertion order", () => {
    const left = origin()
    const right: VNextDerivedIdentityOriginV1 = {
      kind: "collection-row",
      refs: {
        itemKey: left.refs.itemKey,
        rowTemplateId: left.refs.rowTemplateId,
        tableId: left.refs.tableId,
      },
      revisionPins: {
        structureVersionOrdinal: 3,
        dataSnapshotRevision: 7,
      },
    }

    const leftKey = createVNextIdentityAllocationInputKeyV1(left)
    expect(createVNextIdentityAllocationInputKeyV1(right)).toBe(leftKey)
    expect(leftKey).toContain('"itemKey":"ลูกค้า|2026:0001"')
  })

  it("distinguishes delimiter-like and Unicode origin values structurally", () => {
    expect(createVNextIdentityAllocationInputKeyV1(origin("a|b:c"))).not.toBe(
      createVNextIdentityAllocationInputKeyV1(origin("a:b|c")),
    )
  })

  it("builds and accepts a canonical provenance batch", () => {
    const first = createVNextDerivedIdentityProvenanceV1(identity(), origin())
    const second = createVNextDerivedIdentityProvenanceV1(
      identity("rowi_0123456789ac"),
      origin("customer-2"),
    )

    expect(auditVNextDerivedIdentityBatchV1([first, second])).toMatchObject({
      status: "ready",
      identityCount: 2,
      issues: [],
    })
  })

  it("blocks a key that does not match the structured origin", () => {
    const record = createVNextDerivedIdentityProvenanceV1(identity(), origin())
    const result = auditVNextDerivedIdentityBatchV1([{
      ...record,
      allocationInputKey: `${record.allocationInputKey}-changed`,
    }])
    expect(result.status).toBe("blocked")
    expect(result.issues.map((issue) => issue.code)).toContain("allocation-input-key-mismatch")
  })

  it("blocks duplicate and conflicting identities inside one scope", () => {
    const first = createVNextDerivedIdentityProvenanceV1(identity(), origin())
    const duplicate = auditVNextDerivedIdentityBatchV1([first, first])
    expect(duplicate.issues.map((issue) => issue.code)).toContain("duplicate-identity")

    const conflict = createVNextDerivedIdentityProvenanceV1(identity(), origin("customer-2"))
    const conflicted = auditVNextDerivedIdentityBatchV1([first, conflict])
    expect(conflicted.issues.map((issue) => issue.code)).toContain("identity-provenance-conflict")
  })

  it("blocks one identity crossing scopes", () => {
    const first = createVNextDerivedIdentityProvenanceV1(identity(), origin())
    const second = createVNextDerivedIdentityProvenanceV1(
      identity("rowi_0123456789ab", "resolution-2"),
      origin("customer-2"),
    )
    const result = auditVNextDerivedIdentityBatchV1([first, second])
    expect(result.issues.map((issue) => issue.code)).toContain("cross-scope-identity-reuse")
  })

  it("blocks one canonical allocation input mapping to different ids", () => {
    const first = createVNextDerivedIdentityProvenanceV1(identity(), origin())
    const second = createVNextDerivedIdentityProvenanceV1(
      identity("rowi_0123456789ac"),
      origin(),
    )
    const result = auditVNextDerivedIdentityBatchV1([first, second])
    expect(result.issues.map((issue) => issue.code)).toContain("allocation-input-identity-conflict")
  })

  it("reports invalid records at their batch index without returning a partial batch", () => {
    const valid = createVNextDerivedIdentityProvenanceV1(identity(), origin())
    const result = auditVNextDerivedIdentityBatchV1([valid, { nope: true }])
    expect(result).toMatchObject({ status: "blocked", records: null, identityCount: 0 })
    expect(result.issues.some((issue) => issue.path.startsWith("[1]"))).toBe(true)
  })
})
