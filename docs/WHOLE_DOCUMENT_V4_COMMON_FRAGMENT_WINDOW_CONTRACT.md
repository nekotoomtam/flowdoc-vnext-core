# Whole-Document V4 Common Fragment-Window Contract

Status: Phase 367 implemented core contract; Phase 368 adds the first Text-flow
adapter. The sequential composer remains inactive.

## Outcome

Phase 367 introduces the strict common language that future Composition Node
Family adapters must use when handing accepted pagination evidence to the pure
whole-document composer.

The contract is renderer-neutral, JSON-safe, source-immutable, fingerprinted,
and bounded. It does not adapt any current family result yet and does not call
measurement, pagination, rendering, persistence, or editor runtime.

## Public API

`src/composition/fragmentWindowV1.ts` exports:

- six-family and eight-root strict schemas;
- the exact family/root compatibility registry;
- compact owner-pin, capacity, cursor-reference, placement, page, and window
  input schemas/types;
- `finalizeVNextCompositionFragmentWindowV1(...)`; and
- `parseVNextCompositionFragmentWindowV1(...)` with optional exact expectation
  validation.

The package root exports the module through `src/index.ts`.

## Family And Root Compatibility

| Composition Node Family | Accepted root node types |
|---|---|
| `text-flow` | `text-block` |
| `columns-flow` | `columns` |
| `table-flow` | `table` |
| `generated-flow` | `toc` |
| `utility-flow` | `page-break`, `divider`, `spacer` |
| `media-flow` | `image` |

A valid schema shape with the wrong family/root pairing is still rejected by
semantic validation. Structural `zone`, `column`, `table-row`, and `table-cell`
nodes cannot become independent common windows.

## Compact Ownership

Every window pins five inputs with `sha256:<64 lowercase hex>` values:

1. canonical document structure;
2. resolved projection;
3. family source;
4. accepted measurement; and
5. accepted pagination.

Every family cursor reference pins the exact measurement owner and carries a
separate compact state fingerprint. Placements retain only a compact family
evidence fingerprint; they do not duplicate content-sized measurement or
pagination facts.

Finalization hashes the normalized complete window facts with the retained
browser-safe SHA-256 implementation. Parsing recomputes that fingerprint and
rejects any retained fact changed after finalization.

## Capacity

Each window pins:

- positive page-body height;
- exact non-negative first-page available height;
- maximum page count; and
- maximum fragment count.

First-page height cannot exceed body height. The static contract caps one
window at 10,000 pages and 100,000 fragments, while each request may select a
smaller maximum. Accepted pages and fragments cannot exceed either bound.

The optional parse expectation compares the full capacity object. A window
created for a 60 pt remainder is stale for a 59 pt remainder even when every
other owner is unchanged.

## Cursor Checkpoints

The common cursor reference is deliberately opaque. It retains family, root,
measurement owner, state fingerprint, and complete state without embedding
Text lines, Columns lanes, Table rows/cells, TOC entries, or media payloads.

Every committed family page retains its own cursor-before and cursor-after.
Validation requires:

- the first page cursor-before equals the window cursor-before;
- each later page starts at the exact previous page cursor-after;
- every committed page advances cursor state;
- only the final page may complete the family cursor; and
- the final page cursor-after equals the window cursor-after.

This requirement intentionally prevents current multi-page Columns/Table output
from being labeled composition-ready until their adapters can provide honest
per-page checkpoints.

## Page And Placement Geometry

Window page indexes start at zero and are contiguous. The first page must use
the exact first-page capacity; later pages use full body height.

For each page:

- `flowEffect` explicitly distinguishes content placement from forced page
  advance;
- used height plus remaining height equals available height within 0.01 pt;
- ordered placements do not overlap;
- every positive placement extent ends inside committed used height; and
- fragment ids remain unique across the complete window.

Document page number, section page number, renderer coordinates, and artifact
commands are intentionally absent. The later composer assigns document pages;
family evidence retains internal layout coordinates.

`force-page-advance` is restricted to one complete page-break utility window
with zero used height, full remainder, no placements, and cursor progress. This
retains intentional blank-page semantics without pretending page-break has
content extent.

## Heading Identity

At most one placement in a root window may expose heading identity. It must be:

- owned by `text-flow`;
- attached to fragment index zero;
- attached to the heading root node itself; and
- marked as not continuing from a previous page.

This is the future first-fragment input for the authoritative heading-page map.
The common contract does not produce that map.

## Window States

### `complete`

Contains one or more committed pages, exact work facts, no issues, and a
complete cursor-after.

### `partial`

Contains one or more committed pages, exact work facts, no issues, and an
incomplete cursor-after that may be resumed by the owning family.

### `fresh-page-required`

Contains no pages or committed work. Cursor-after equals cursor-before exactly.
It is valid only when first-page capacity is smaller than a fresh body page;
requesting another fresh page from an already fresh page is blocked as
no-progress.

### `blocked`

Contains one or more structured family issues, cursor-before, and zero committed
work. It has no pages or cursor-after. A blocked family result can itself be a
valid, fingerprinted window fact; the composer will later propagate it rather
than mistake it for malformed transport.

Malformed, stale, or tampered envelopes are parser failures and are distinct
from a valid window whose family status is `blocked`.

## Exact Work

`pageCount`, `fragmentCount`, and `cursorCommitCount` must exactly equal the
committed arrays. Blocked and fresh-page-required windows retain all three at
zero. This is retained work evidence, not estimated progress.

## Finalize And Parse

`finalizeVNextCompositionFragmentWindowV1(...)`:

1. strictly parses untrusted input facts;
2. applies family/root, owner, capacity, cursor, geometry, heading, bounds, and
   work invariants;
3. clones normalized facts without mutating the caller; and
4. attaches a deterministic compact fingerprint.

`parseVNextCompositionFragmentWindowV1(...)`:

1. requires a compact retained fingerprint;
2. removes only that envelope field and strictly re-finalizes all facts;
3. rejects unknown properties and fingerprint drift; and
4. optionally rejects identity, owner pins, capacity, or initial cursor state
   that differs from the current composition request.

## Failure Contract

Rejected input returns `status: "blocked"`, `window: null`, and structured error
issues. It never returns partially normalized facts.

Direct tests cover:

- deterministic finalization and exact JSON round-trip;
- caller-source immutability;
- family/root mismatch;
- stale owner, capacity, and cursor expectation;
- page checkpoint chain break and page no-progress;
- height drift, placement overlap, and dishonest work;
- valid fresh-page-required and family-blocked facts;
- fresh-page no-progress;
- unknown properties; and
- retained-fingerprint tampering.

## Responsibility Boundary

Core owns this vocabulary, strict validation, fingerprinting, and diagnostic
facts. Future family adapters own projection from their accepted pagination
results. Future pure composition owns ordering and document page commit.

Backend still owns scheduling, durable retention, expiry, retry, storage,
authorization, and tenancy. Editor still owns progress/blocker UX, viewport,
selection, input, and preview scheduling. Renderer/export still owns artifact
commands and bytes.

## PASS

- The six-family/eight-root registry is strict and public.
- Compact owner pins and capacity are mandatory.
- Every committed page has an exact progressing cursor checkpoint.
- Accepted state, valid family failure, parser failure, and stale expectation
  are distinct.
- Finalize/parse are deterministic, JSON-safe, and source-immutable.
- Runtime work is bounded and exact.

## FAIL / BLOCKER

- Text-flow and Utility/Media emit this contract; Columns, Table, and TOC do not.
- Text-flow still lacks first-remainder and resumable source pagination.
- Columns/Table still lack retained per-page family checkpoints.
- Utility/media still lack isolated v4 body fragment producers.
- No sequential composer, document page plan, or production heading-page map
  exists.

## RISK

- Adapter authors may attempt to synthesize checkpoints from final family
  cursors; that would be dishonest and must remain blocked.
- Five mandatory pins require a clear adapter rule for utility nodes whose
  measurement may be trivial but must still be explicit.
- Static caps bound retained output but do not establish production resource
  budgets.

## UNKNOWN

- Final adapter-specific cursor reference derivation.
- Whether later streaming transport needs a smaller default window bound.
- Production packed-package and cross-worker serialization profiles.

## Intentionally Not Changed

- canonical package/document schemas and authored node grammar;
- Text, Columns, Table, TOC, utility, and media pagination behavior;
- document v3 measured pagination and renderer paths;
- field/materialization and published-version policy;
- backend/editor/renderer runtime behavior.

## Next Recommended Direction

Open the Columns/Table/TOC Common Adapter Readiness Lock was this phase's
recorded handoff. Phase 370 now locks that readiness and selects the constrained
TOC one-page adapter first. Implement it with fresh-page demand, forced-overflow
rejection, exact resume equivalence, compact ownership, and bounded scale before
changing Columns or Table pagination:
`docs/WHOLE_DOCUMENT_V4_COLUMNS_TABLE_TOC_ADAPTER_READINESS_LOCK.md`.
