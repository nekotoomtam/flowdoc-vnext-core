import { describe, expect, it } from "vitest"
import {
  VNEXT_IDENTITY_PROFILES_V1,
  VNEXT_IDENTITY_STANDARD_VERSION,
  safeParseVNextAllocatedIdentityV1,
  safeParseVNextDerivedIdentityProvenanceV1,
  type VNextAllocatedIdentityV1,
} from "../src/identity/identityStandardV1.js"

function resolvedRowIdentity(overrides: Partial<VNextAllocatedIdentityV1> = {}): VNextAllocatedIdentityV1 {
  return {
    contractVersion: VNEXT_IDENTITY_STANDARD_VERSION,
    kind: "allocated-identity",
    identityKind: "resolved-row",
    identityClass: "resolved-entity",
    id: "rowi_0123456789ab",
    allocationOwner: "resolution-orchestrator",
    allocationStrategy: "deterministic",
    scope: {
      kind: "document-resolution",
      documentInstanceId: "instance-1",
      instanceRevision: 4,
      resolutionInputFingerprint: "resolution-fingerprint-1",
    },
    ...overrides,
  } as VNextAllocatedIdentityV1
}

describe("identity standard v1", () => {
  it("publishes complete profile facts for every allocated identity kind", () => {
    expect(Object.keys(VNEXT_IDENTITY_PROFILES_V1)).toEqual([
      "structure",
      "structure-draft",
      "published-structure-version",
      "document-instance",
      "resolved-row",
      "resolved-cell",
      "resolved-group",
      "layout-fragment",
      "request",
      "job",
      "artifact",
    ])
  })

  it("accepts a bounded opaque resolved-row identity in its required scope", () => {
    expect(safeParseVNextAllocatedIdentityV1(resolvedRowIdentity())).toEqual({
      ok: true,
      identity: resolvedRowIdentity(),
      issues: [],
    })
  })

  it.each([
    ["wrong prefix", { id: "celli_0123456789ab" }, "id"],
    ["wrong class", { identityClass: "artifact" }, "identityClass"],
    ["wrong owner", { allocationOwner: "boundary-owner" }, "allocationOwner"],
    ["wrong scope", { scope: { kind: "global" } }, "scope.kind"],
  ])("blocks %s", (_label, override, expectedPath) => {
    const result = safeParseVNextAllocatedIdentityV1(resolvedRowIdentity(override as Partial<VNextAllocatedIdentityV1>))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.issues.some((issue) => issue.path === expectedPath)).toBe(true)
  })

  it.each([
    "rowi_short",
    "rowi_0123456789ab!",
    `rowi_${"a".repeat(65)}`,
    "ROWI_0123456789ab",
  ])("blocks malformed opaque id %s", (id) => {
    expect(safeParseVNextAllocatedIdentityV1(resolvedRowIdentity({ id })).ok).toBe(false)
  })

  it("keeps origin refs and revision pins outside the allocated id", () => {
    const result = safeParseVNextDerivedIdentityProvenanceV1({
      contractVersion: 1,
      kind: "derived-identity-provenance",
      identity: resolvedRowIdentity(),
      origin: {
        kind: "collection-row",
        refs: {
          tableId: "table-orders",
          rowTemplateId: "row-template-order",
          itemKey: "ลูกค้า/2026/0001",
        },
        revisionPins: {
          dataSnapshotRevision: 9,
        },
      },
      allocationInputKey: "identity-input-v1-placeholder",
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.provenance.identity.id).toBe("rowi_0123456789ab")
      expect(result.provenance.origin.refs.itemKey).toBe("ลูกค้า/2026/0001")
    }
  })

  it("blocks empty origins and unknown provenance fields", () => {
    const base = {
      contractVersion: 1,
      kind: "derived-identity-provenance",
      identity: resolvedRowIdentity(),
      origin: {
        kind: "collection-row",
        refs: {},
        revisionPins: {},
      },
      allocationInputKey: "identity-input-v1-placeholder",
    }
    expect(safeParseVNextDerivedIdentityProvenanceV1(base).ok).toBe(false)
    expect(safeParseVNextDerivedIdentityProvenanceV1({
      ...base,
      origin: { ...base.origin, refs: { itemKey: "item-1" } },
      hiddenTimestamp: 123,
    }).ok).toBe(false)
  })
})
