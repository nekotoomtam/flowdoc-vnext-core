# Template Builder Browser Cache Boundary

Status: Phase 31 implementation boundary.

Phase 31 turns the Phase 30 change packet into the browser's active mutation
response path. The sandbox still loads a full snapshot on boot, but accepted
and rejected bridge actions now request packet-only responses and apply those
packets to a browser-owned runtime cache.

## Purpose

The browser runtime flow is now:

```text
boot
  -> GET /api/snapshot
  -> browser snapshot view model
  -> browser runtime cache and node index

mutation
  -> POST /api/actions/replace-text?response=packet
  -> apply change packet to snapshot view model
  -> rebuild browser runtime cache
```

The browser cache is not canonical document truth. It is a derived view model
cache for rendering and selection lookup. Canonical package state stays inside
the sandbox mutation bridge and vNext core transaction path.

## Runtime Cache Contract

The browser cache owns:

- node id lookup for selection and inspector reads;
- boot revision;
- current document revision;
- current node count;
- packet apply count;
- last packet revision;
- fallback snapshot refresh count.

The cache is rebuilt from the current browser snapshot view model after a
packet applies. That is acceptable in this phase because the goal is response
ownership and browser-side packet consumption before typing work starts.

Phase 32 reuses this cache path for `sandbox.insertPlainTextAtEnd`, the first
explicit text-insert action.

Phase 33 reuses the same packet path for bounded authoring-history summaries,
so the browser cache updates history status without receiving full history
records or a complete snapshot tree.

## Packet Apply Rules

- The browser asks the mutation route for `?response=packet`.
- A valid packet must have source `flowdoc-template-builder-change-packet` and
  packet version `1`.
- The packet base revision must match the browser snapshot revision.
- Changed node summaries replace matching nodes in the current snapshot view
  model.
- Mutation bridge metadata, diagnostics, dirty scope count, and document
  revision are updated from the packet.
- If a packet is missing, stale, or asks for a snapshot, the browser refreshes
  from `/api/snapshot` and records a fallback snapshot refresh.

## Non-Goals

Phase 31 does not implement:

- per-keystroke typing;
- DOM caret mapping;
- IME composition;
- partial text ranges from browser selection;
- undo/redo execution;
- durable authoring history persistence;
- live layout rendering;
- structural packet operations;
- durable browser cache persistence;
- save/publish persistence;
- backend API routes outside the sandbox dev server;
- exact layout, preview, PDF, or DOCX rendering.
