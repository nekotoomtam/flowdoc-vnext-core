# Resolution Input Pins Contract

Status: Phase 273 pure core contract.

## Decision

Resolved output may be deterministic only when every input belongs to one
exact Published Structure Version and one exact Document Instance revision.
Resolution therefore accepts a strict pinned input set instead of fetching or
falling back to mutable package data while it runs.

## Published Inputs

One Published Resolution Bundle contains:

- the Published Structure Version identity;
- a field contract owned by that exact version;
- a text-style catalog owned by that exact version; and
- a static media registry owned by that exact version.

Field definitions are not instance values. Style definitions are named presets
that a text block may reference through `textStyleId`; local inline run styles
remain the later override layer. Phase 273 keeps the first style catalog
deliberately bounded to text run properties already accepted by document v4.

## Instance Inputs

The materialized document, atomic Data Snapshot, and instance media snapshot
must all pin the same Document Instance id, revision, and Published Structure
Version. The materialized document root id must equal the instance id.

Data Snapshot values remain separate from the published field contract. A
snapshot does not redefine a key, label, capability, or value type.

## Media Ownership

Published static media and instance media keep separate ownership:

- authored `asset-ref` and authored fallback assets resolve from published
  static media;
- image values supplied by a Data Snapshot resolve from instance media; and
- the same `assetId` may not exist in both registries.

Cross-registry collisions block the input rather than selecting a winner. This
is required because the current authored image source stores an `assetId`
without a namespace.

## Strictness

`safeParseVNextResolvedProjectionInputV1(...)` rejects:

- a registry owned by another structure version;
- a document instance pinned to another published version;
- data or media from another instance revision;
- a document root using another instance id;
- mismatched style map keys; and
- unknown properties at contract boundaries.

The parser returns a cloned, JSON-safe value and never fetches catalogs, reads
media bytes, updates an instance, or creates resolved output.

## Non-Goals

- no scalar/image value resolution yet;
- no renderer-facing binding projection;
- no collection or repeat values;
- no style inheritance graph or layout-style vocabulary;
- no media-byte embedding, upload, or deduplication;
- no package v3 parser change or package data fallback;
- no persistence, HTTP, editor state, pagination, or artifact output.
