import { describe, expect, it } from "vitest"
import {
  safeParseVNextTableCollectionSnapshotV1,
  type VNextTableCollectionSnapshotV1,
} from "../src/table/tableCollectionSnapshotV1.js"

function snapshot(): VNextTableCollectionSnapshotV1 {
  return {
    contractVersion: 1,
    kind: "table-collection-snapshot",
    collectionSnapshotId: "orders-collection-snapshot",
    snapshotRevision: 8,
    instance: {
      contractVersion: 1,
      kind: "document-instance",
      instanceId: "order-report-1",
      revision: 4,
      structureVersion: {
        structureId: "order-report",
        structureVersionId: "order-report-v3",
        versionOrdinal: 3,
      },
    },
    collections: {
      "orders.items": {
        collectionFieldKey: "orders.items",
        items: [
          {
            itemKey: "ลูกค้า/2026/0002",
            values: {
              description: "Second item",
              quantity: 2,
              taxable: true,
              photo: { kind: "image-asset-ref", assetId: "item-photo-2" },
            },
          },
          {
            itemKey: "ลูกค้า/2026/0001",
            values: { description: "First item", quantity: 1, note: null },
          },
        ],
      },
    },
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

describe("table collection snapshot v1", () => {
  it("accepts exact instance-pinned ordered items with scalar and image values", () => {
    const input = snapshot()
    const before = JSON.stringify(input)
    const result = safeParseVNextTableCollectionSnapshotV1(input)

    expect(result).toEqual({ ok: true, snapshot: input, issues: [] })
    expect(result.ok && result.snapshot.collections["orders.items"].items.map((item) => item.itemKey)).toEqual([
      "ลูกค้า/2026/0002",
      "ลูกค้า/2026/0001",
    ])
    expect(JSON.stringify(input)).toBe(before)
  })

  it("accepts an explicit empty ordered collection", () => {
    const input = snapshot()
    input.collections["orders.items"].items = []
    expect(safeParseVNextTableCollectionSnapshotV1(input).ok).toBe(true)
  })

  it("blocks duplicate stable item keys without falling back to array index", () => {
    const input = clone(snapshot())
    input.collections["orders.items"].items[1].itemKey = input.collections["orders.items"].items[0].itemKey
    const result = safeParseVNextTableCollectionSnapshotV1(input)

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.issues).toContainEqual(expect.objectContaining({
      path: "collections.orders.items.items[1].itemKey",
      message: expect.stringContaining("duplicate collection item key"),
    }))
  })

  it("blocks collection record-key drift, blank item keys, and unknown fields", () => {
    const input = clone(snapshot())
    input.collections["orders.items"].collectionFieldKey = "other.items"
    input.collections["orders.items"].items[0].itemKey = "   "
    const drift = safeParseVNextTableCollectionSnapshotV1(input)
    expect(drift.ok).toBe(false)
    if (!drift.ok) expect(drift.issues.map((item) => item.path)).toEqual(expect.arrayContaining([
      "collections.orders.items.collectionFieldKey",
      "collections.orders.items.items[0].itemKey",
    ]))

    expect(safeParseVNextTableCollectionSnapshotV1({ ...snapshot(), fetchedAt: "now" }).ok).toBe(false)
  })
})
