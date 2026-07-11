# Text-block V4 Authoring Contract

Status: Phase 275 v4-native grammar, projection, and selection boundary.

## Decision

Document v4 keeps one canonical text-block with five flat inline forms: text,
field-ref, line-break, page-number, and inline-image. It does not reuse the
package v2/document v3 transaction contract. Only the schema-independent safe
UTF-16 boundary helper is shared.

## Canonical Empty Block

The only canonical empty representation is `children: []`. Empty text leaves,
`<br>`, zero-width characters, DOM sentinels, and placeholders are not authored
content.

An empty-block caret uses:

```ts
{
  textBlockId: string
  inlineId: null
  offset: 0
  affinity: "forward" | "backward"
}
```

`inlineId: null` is valid only while the block has no inline children. This
keeps runtime caret support without allocating fake persisted identity.

## Canonical Selection

A non-empty anchor is `(textBlockId, inlineId, local UTF-16 offset, affinity)`.
Selection is a pair of anchors inside one text-block. Page, line, DOM, glyph,
and screen coordinates remain projections rather than selection identity.

- text offsets range from `0` through JavaScript string length and may not
  split a surrogate pair;
- line-break, field-ref, page-number, and inline-image are atomic and accept
  offset `0` before or `1` after;
- affinity chooses the previous or next inline identity at a shared boundary;
- block offsets are accepted only as an adapter input and are deterministically
  mapped to inline-local anchors.

Grapheme-safe keyboard behavior remains an editor input responsibility. It
does not replace deterministic UTF-16 authored offsets.

## Grammar And Field Placement

V4 schema already rejects empty text leaves and raw CR/LF text. Grammar
validation additionally enforces:

- inline ids unique within the owning text-block;
- field-ref keys exist in the pinned Published Field Contract;
- image and collection fields cannot use scalar inline field-ref placement;
- page-number appears only in header/footer static zones; and
- inline-image remains an authored atomic with its own placement id.

Field definition, placement, and value remain separate. This phase validates a
placement but does not add a field placement mutation yet.

## Projection

The model projection contributes literal text length for text, newline for
line-break, and one U+FFFC slot for every other atomic. The rendered field
label/value, page digits, or image dimensions never change authored offsets.

## Non-Goals

- no v4 text mutation or rich-inline replace operation yet;
- no editor DOM, IME, paste, delete, or browser selection adapter;
- no cross-block selection;
- no collaboration-safe id allocator;
- no measured line packets, pagination, renderer, or cross-page editing;
- no backend route or instance persistence activation.
