# Template Builder Text Action Boundary

Status: Phase 32 implementation boundary.

Phase 32 adds the first explicit text-insert action to the sandbox. It is not
caret typing yet. It proves that the browser can ask for a granular vNext text
transaction through the same mutation bridge and packet-cache path established
in Phases 29 through 31.

## Purpose

The sandbox now has two text mutation actions:

```text
sandbox.replacePlainTextBlock
  -> text.range.replace

sandbox.insertPlainTextAtEnd
  -> text.insert at the current text-block end offset
```

Both actions are explicit inspector commands. The browser does not derive text
ranges from DOM selection and does not run IME composition handling in this
phase.

## Supported Insert Action

`sandbox.insertPlainTextAtEnd`

- target: selected node must be a `text-block`;
- allowed content: plain single-line text only;
- rejected content: empty text, newline text, non-text nodes, field refs, page
  numbers, and line breaks;
- core command: `text.insert`;
- position: end of the selected text-block projection;
- response: change packet by default in the browser path;
- cache update: browser applies the returned packet to its derived runtime
  cache.

## Runtime Rules

- The bridge owns the working package and calls `runVNextTextTransaction(...)`
  through `@flowdoc/vnext-core`.
- The insert action uses projection offsets from
  `projectVNextTextBlockInlines(...)`.
- Successful inserts update document revision, mutation count, dirty scope,
  mutation summary, and changed node packet data.
- Rejected inserts preserve the working package revision and report packet
  issues.
- The browser still treats packet-applied state as a derived view model, not
  canonical document truth.

## Why Caret And IME Stay Deferred

Caret and IME work need DOM selection mapping, composition lifecycle handling,
range normalization, focus restoration, and browser-specific edge-case testing.
Those are intentionally deferred until the save/package and live-layout
boundaries are steadier.

## Non-Goals

Phase 32 does not implement:

- per-keystroke typing;
- DOM caret mapping;
- IME composition;
- browser-derived text ranges;
- partial range replace from selection;
- undo/redo execution;
- live layout rendering;
- structural packet operations;
- durable browser cache persistence;
- save/publish persistence;
- backend API routes outside the sandbox dev server;
- exact layout, preview, PDF, or DOCX rendering.
