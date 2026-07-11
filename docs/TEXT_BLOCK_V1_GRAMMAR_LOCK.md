# Text-block v1 Grammar Lock

Date: 2026-07-11

Status: Phase 248 decision boundary. This document locks the target Text-block
v1 grammar before schema or runtime implementation. It does not change package
v2/document v3, text transactions, editor input, backend routes, pagination,
or renderer output.

## Purpose

`text-block` is the most complex v1 authoring node because it joins model
offsets, styled text, atomic inline usages, browser selection, IME, history,
pagination, and future image behavior. The grammar must be stable before image
schema work, production WYSIWYG, field placement, fragmentation, or
large-document windowing depends on it.

This lock defines:

- block and inline ownership;
- target inline vocabulary;
- text and atomic offset semantics;
- text style ownership and insertion marks;
- empty-block and normalization rules;
- field, page number, line break, and inline-image behavior;
- structural selection versus active text editing;
- IME, history, invalidation, and transport boundaries.

## Evidence Scope

Core evidence:

- `src/schema/document.ts`
- `src/authoring/textTransactions.ts`
- `src/authoring/richInlineCommit.ts`
- `src/authoring/intentHistory.ts`
- `src/authoring/fieldChipCommands.ts`
- `src/pagination/textMeasurement.ts`
- `src/pagination/measuredPagination.ts`
- `tests/textTransactions.test.ts`
- `tests/richInlineCommit.test.ts`
- `tests/fieldChipCommands.test.ts`
- `docs/TEXT_EDITING_TRANSACTION_PLAN.md`
- `docs/WYSIWYG_PRIMARY_INPUT_DECISION_GATE.md`
- `docs/RICH_INLINE_OPERATION_DECISION_BOUNDARY.md`
- `docs/GUARDED_INPUT_INTEGRATION_CLOSE_AUDIT.md`

Product editor evidence at `flowdoc-vnext-editor@e50e28c`:

- `src/editor/selection/selectionState.ts`
- `src/editor/presentation/nodePresentationProjector.ts`
- `src/editor/coreBinding/capabilityMirror.ts`
- `src/editor/render/renderProjector.ts`
- `src/components/paper/PaperBlock.tsx`

Backend evidence at `flowdoc-vnext-backend@9d4b202`:

- `src/storage/richInlineSessionRecord.ts`
- `src/contracts/mutation.ts`
- `src/service/mutationService.ts`

## Current Contract Mismatch

The current system has three overlapping text contracts:

1. `InlineNodeSchema` accepts `text`, `field-ref`, `page-number`, and
   `line-break`.
2. Granular text transactions project all four types but can insert only text
   and field-ref. Plain text delete/replace rejects any range intersecting a
   non-text segment.
3. Rich-inline commit and replay accept only text and field-ref even though
   they validate against the broader inline schema first.

The product editor currently exposes a selected surface id only. It has no
active text-block id, caret, inline range, composition, or insertion-mark state.
Text-blocks nested inside columns and tables resolve selection to the owning
group surface.

Backend retains rich-inline replay validation facts, but no current product
mutation route accepts text or rich-inline commands. These facts are evidence,
not production text editing readiness.

## Text-block Shape

The v1 authored block keeps this responsibility split:

```text
text-block
  id       stable authored block identity
  role     paragraph/heading/list/caption/note/label semantics
  props    block style reference and box behavior
  children ordered inline authored content
```

The block owns reading order and inline identity scope. It does not own:

- caret or DOM selection;
- resolved field values;
- page, line, or fragment coordinates;
- IME composition state;
- active toolbar marks;
- asset bytes;
- generated layout fragments.

Those remain runtime, binding, backend asset, or measured-layout facts.

## Role Grammar

The existing v1 block roles remain accepted:

| Role | Required metadata | v1 meaning |
|---|---|---|
| `paragraph` | none | normal flow paragraph |
| `heading` | level 1-6 | document heading and outline source |
| `list-item` | list instance, level, item id, optional start | one authored list item |
| `caption` | none | caption semantics; not an image child by implication |
| `note` | none | note/callout text semantics |
| `label` | none | short label semantics |

Role is block semantics, not inline style. Bold text does not become a heading,
and a caption role does not create or own an image relationship automatically.

Role-dependent block split/merge behavior is outside this grammar lock and
must be a later structural-operation decision.

## Target Inline Vocabulary

Text-block v1 targets five inline forms:

| Inline type | Authored payload | Projection | Editable as plain text | Style ownership | Status |
|---|---|---|---|---|---|
| `text` | non-empty text plus optional sparse run style | literal UTF-16 text | yes | owns sparse run override | current, tighten normalization |
| `line-break` | id only | one newline slot | no; explicit remove required | inherits surrounding presentation | current |
| `field-ref` | key plus optional label/fallback | one U+FFFC atomic slot | no; explicit usage command required | inherits surrounding presentation | current |
| `page-number` | id only | one U+FFFC atomic slot | no; explicit usage command required | inherits surrounding presentation | current, restrict placement |
| `inline-image` | source and intrinsic presentation facts to be decided | one U+FFFC atomic slot | no; explicit image command required | image-specific presentation | required before Node v1 close |

`inline-image` is a reserved target grammar form, not an implemented schema in
this phase. The image source contract will decide whether its source is an
asset id, compatible image field usage, or a discriminated source union.

The inline grammar does not use arbitrary nested spans, HTML nodes, DOM
elements, or recursive inline containers. Text styling remains on text leaves;
non-text inline content remains managed atomic content.

## Text Leaf Rules

The target v1 normalization rules are:

1. A `text` leaf contains non-empty text.
2. A `text` leaf does not contain CR or LF characters.
3. Authored hard line breaks use `line-break` nodes.
4. Adjacent text leaves may remain separate when their stable ids represent
   distinct edit/history segments; automatic merging is optional and must not
   silently discard identity.
5. Adjacent leaves with different style overrides remain separate.
6. Arbitrary HTML and unsupported rich paste markup never become text leaves.

The current document v3 schema allows empty text and newline characters. The
implementation phase must not silently tighten existing v3 parsing. It must
use an explicit version/migration decision or a bounded normalization gate.

## Empty Block Rule

The target canonical empty text-block is:

```json
{
  "type": "text-block",
  "children": []
}
```

An editor placeholder, caret sentinel, `<br>`, zero-width character, or empty
DOM text node is runtime-only and must not be persisted as authored content.

Current table operations create one empty text leaf for a new cell. That is a
known compatibility gap to resolve during implementation; this lock does not
rewrite existing fixtures or operations.

## Inline Identity

- Authored node ids remain document-wide authored identities.
- Inline ids are unique within their owning text-block.
- The stable inline identity is `(textBlockId, inlineId)`.
- Moving or copying an inline usage into another block must allocate an id that
  is unique in the destination block.
- Splitting a text leaf keeps the original id on one side and allocates a new
  id for the other side.
- Replacing an entire rich-inline child list must reject duplicate inline ids.
- Renderer fragments and DOM nodes must not replace authored inline identity.

Document-wide inline-id uniqueness is not required for v1.

## Model Offset Contract

Text positions remain block-scoped model positions:

```ts
type TextPosition = {
  textBlockId: string
  offset: number
}
```

V1 offset rules:

1. Offsets count UTF-16 code units in the projected authored stream.
2. Text contributes its JavaScript string length.
3. `line-break` contributes one newline code unit.
4. Field-ref, page-number, and inline-image each contribute one U+FFFC atomic
   code unit.
5. Offsets are not page, line, glyph, DOM-tree, or screen coordinates.
6. Core text edits must reject offsets that split a UTF-16 surrogate pair.
7. The input adapter must submit grapheme-safe caret/delete ranges. Grapheme
   policy belongs to input handling because locale/runtime segmentation may
   evolve, while authored offsets remain deterministic UTF-16.
8. IME composition updates do not create canonical offsets until composition
   commit.

UTF-16 is retained because browser selection and JavaScript strings use the
same unit. Grapheme-safe UX is required, but it must not redefine persisted
model offsets.

## Atomic Inline Rules

All non-text inline forms are managed atomics:

- the caret may sit before or after an atomic;
- the caret cannot sit inside an atomic;
- plain text delete/replace cannot partially intersect an atomic;
- atomic removal uses an explicit command targeting inline identity;
- backspace/delete adjacent to an atomic is translated by the editor into that
  explicit command after preflight;
- copy/paste preserves the atomic payload or falls back according to an
  explicit policy;
- cross-block atomic moves are structural rich-inline operations, not DOM
  default behavior;
- an atomic always contributes one model slot regardless of rendered label,
  resolved value, page number digits, or image dimensions.

An explicit future command family should cover `inline.remove`, line-break
insert, page-number insert, and inline-image insert. Field placement may emit
the retained field-ref insertion transaction after compatibility checks, but
the UX begins from the central field registry rather than the selected node.

## Line Break Policy

`line-break` means a hard line break inside one text-block. It does not create
a new paragraph, list item, heading, history block, or canvas surface.

- Enter behavior that creates a new block must use block split semantics.
- Shift+Enter-style behavior may create `line-break` after command policy.
- Plain-text paste must normalize newline input according to paste mode: hard
  breaks within one block or structural block splits. Raw CR/LF must not be
  stored inside a text leaf in the target grammar.
- Removing a line break is an explicit atomic removal, not an edit inside text.

## Page Number Policy

`page-number` is generated inline content for `header`, `footer`,
`first-page-header`, and `first-page-footer` zones in v1.

- It stores no resolved page digits.
- It remains one atomic model slot.
- Body references to other pages belong to a future cross-reference model,
  not this current-page token.
- TOC page numbers remain generated TOC/layout facts rather than authored
  `page-number` children in body text.

The current schema does not enforce this zone restriction. Enforcement belongs
to the schema/graph implementation slice after version policy is decided.

## Field Usage Policy

`field-ref` remains the serialized inline usage of a compatible central field.
It does not define or own the field.

- Field definition and type live in the central registry.
- Field value lives in the data/binding snapshot.
- Placement policy decides whether a field can create an inline usage at a
  target text position.
- Inline field-ref is limited to scalar text-presentable field capabilities.
- Image fields use inline-image or block image placement, not a text field-ref.
- Collection fields require collection/repeat placement, not inline text.
- Editing a field key is registry/key migration, not plain text editing.
- Resolved display length never changes the one-slot authored offset.

The current `canInsertFieldChip` node capability name in the product editor is
superseded direction and must be replaced by field-placement compatibility in
a later field phase.

## Inline Image Insertion Point

This grammar reserves `inline-image` as a non-text atomic child of text-block.
It establishes only these semantics:

- one authored inline identity;
- one U+FFFC model slot;
- before/after caret boundaries only;
- explicit insert/remove/copy/paste commands;
- no edit inside the image;
- contributes intrinsic/declared dimensions to line-box measurement;
- may not split across lines or pages independently from its containing line;
- references shared image source facts rather than embedding asset bytes.

Asset source shape, alt-text ownership, dimensions, baseline alignment,
fallback rendering, field compatibility, and document version belong to the
next image source contract. Floating wrap and L-shaped text flow remain outside
v1.

## Style Grammar

V1 keeps sparse style overrides on `text` leaves only. The current style
vocabulary remains the baseline:

- font size;
- font family key;
- text color;
- normal/bold weight;
- normal/italic style;
- none/underline decoration;
- strikethrough.

Style resolution order is:

```text
document/style registry default
  -> text-block textStyleId
  -> text leaf sparse override
  -> editor-only active insertion marks
```

Active insertion marks are runtime state and are never persisted without
inserted text. Production text insertion must carry explicit mark context or
derive it through one deterministic policy. The current core heuristic that
looks at containing, previous, then next text leaves is useful baseline
evidence but is not the final toolbar/caret contract.

Atomic field/page-number content inherits surrounding text presentation at
render time unless its future type-specific contract overrides that behavior.
It does not copy arbitrary text style properties into the atomic authored node.

Style-only changes remain geometry-affecting unless the patched properties are
proven paint-only. Exact generation becomes stale after any accepted rich
inline commit in the current baseline.

## Normalization Boundary

Normalization occurs at explicit command/import/paste boundaries, not as a
background rewrite of every package read.

Target normalization may:

- convert CR/LF into line-break or structural split intent;
- remove zero-length text leaves when safe;
- reject duplicate inline ids;
- reject unsupported inline types or properties;
- sanitize unsupported paste markup;
- preserve supported text styles and atomic identities.

Normalization must not:

- flatten field/page/image atomics into authored text;
- materialize field values or page digits into authored text;
- merge leaves when doing so loses identity needed by a pending operation;
- rewrite a canonical document merely because it was opened;
- depend on DOM serialization as canonical truth.

## Selection And Editing Targets

Structural selection and text editing target are separate runtime facts:

```text
selectedSurfaceId  columns/table/text-block structural surface
activeTextBlockId  one concrete text-block being edited, possibly nested
textRange          block-scoped anchor/focus UTF-16 offsets
composition        editor-only IME lifecycle
insertionMarks     editor-only active style state
```

V1 opens at most one active text-block editing island. A nested text-block in a
column or table cell may become `activeTextBlockId` without becoming an
independent reorderable canvas surface. Group selection remains on columns or
table while text commands target the active descendant block.

Cross-block text ranges are not accepted in the first v1 production editing
slice. Structural block selection may include multiple blocks later, but that
is not one text transaction.

Selection, caret, composition, and insertion marks are session/runtime state;
they are not persisted in canonical packages or backend package records.

## IME Policy

- Composition start/update remain local to the active editing island.
- No durable history or canonical mutation is emitted per composition update.
- Composition commit becomes one text insert or range-replace intent.
- Composition cancel restores the pre-composition draft and selection.
- Destructive atomic commands, structural mutations, and block commit are
  blocked while composition is active.
- Thai and other complex-script input must preserve browser-provided committed
  text and grapheme-safe selection ranges.

Core receives committed model intent; it does not own DOM composition events.

## Command And Commit Policy

V1 uses two complementary mutation levels:

1. Granular text transactions are the primary typing/delete/replace path.
2. Full `text-block.rich-inline.replace` remains a bounded single-user commit,
   import, paste-normalization, and replay fallback.

Full replacement must eventually validate the complete accepted v1 inline
grammar. Its current text/field-only restriction is a known gap. Full
replacement is not collaboration-safe and must not become a concurrent merge
primitive.

The first implementation slice after this lock should add pure grammar
validation/normalization facts before adding production DOM or backend routes.

## History And Invalidation

- Continuous typing may coalesce by active text-block and typing session.
- Paste, IME commit, style command, atomic insert/remove, and rich replacement
  are single intent groups unless an explicit UX policy says otherwise.
- Atomic commands preserve inline identity in history facts.
- Text edits emit text-block, parent, section, zone, and nearest table scope.
- Accepted content/style changes mark exact generation stale.
- Selection-only and composition-update changes are not durable history.
- Current full before/after rich-inline snapshots remain single-user v1
  evidence, not future collaboration protocol.

## Pagination And Rendering

Authored text grammar does not store lines or fragments. Measured pagination
maps the inline stream into line and page fragments while preserving authored
block/inline identity references.

- text may split by measured line ranges;
- an atomic cannot split internally;
- inline image dimensions affect its line box;
- resolved field label/value length affects measurement but not authored
  offset length;
- page-number rendering uses current measured page facts;
- renderer consumes measured fragments and must not relayout authored input.

Fragment identity and incremental 200-300 page invalidation remain later work.

## Backend Passage

Backend remains responsible for transport, revision gates, package records,
and future asset storage. It does not own inline grammar.

Current backend rich-inline records validate retained replay facts but do not
write storage, execute replay, expose a rich-inline API, or restore selection.
The implementation sequence must add core grammar first, then a backend-owned
revision-safe command envelope, then editor stale-gated apply.

Asset bytes and upload/crop lifecycle remain backend concerns after the image
source contract exists.

## V1 Decisions

1. Text-block owns an ordered flat inline list, not arbitrary nested rich DOM.
2. Model offsets are block-scoped UTF-16 code-unit offsets.
3. Core rejects surrogate-splitting offsets; input provides grapheme-safe
   ranges.
4. Non-text inline forms are one-slot managed atomics.
5. Target text leaves are non-empty and contain no CR/LF.
6. Canonical empty block is `children: []`.
7. Inline identity is scoped to the owning text-block.
8. Hard line break is an inline atomic; paragraph/list creation is structural.
9. Page-number is restricted to static header/footer zones in v1.
10. Field-ref is a compatible central-field usage, not field ownership.
11. Inline-image is required before Node v1 closes and is separate from block
    image.
12. Sparse inline style belongs to text leaves; insertion marks are runtime.
13. One active text-block island may coexist with a group structural selection.
14. Cross-block text ranges are outside the first production v1 slice.
15. IME updates remain local and commit as one model transaction.
16. Granular transactions are primary; full rich replacement is bounded
    single-user fallback and not collaboration protocol.

## BLOCKER

Implementation must not begin production WYSIWYG until:

- document-version/migration policy is chosen for tightened text leaves and
  inline-image;
- pure v1 inline validation and normalization can represent all target forms;
- atomic insert/remove commands are specified;
- surrogate-boundary validation is covered;
- nested active text target is separate from structural selection in the
  product runtime;
- line-break paste/insert/remove policy is implemented without raw text LF;
- page-number zone validation is implemented;
- rich-inline commit/replay accepts or explicitly rejects every v1 inline type
  consistently;
- image source contract supplies inline-image payload facts.

## RISK

- At lock time, tightening text leaves could reject table-cell placeholders;
  Phase 250 subsequently aligned the core table insertion producers.
- UTF-16 offsets are DOM-compatible but input adapters can still submit unsafe
  grapheme ranges.
- Existing style inheritance heuristic is ambiguous at mixed-style boundaries.
- Full rich replacement can overwrite concurrent semantic intent.
- Current product editor has no active nested text target or text range state.
- Current field-chip capability naming can pull implementation back toward the
  rejected node-selected field UX.
- Resolved field value length and inline-image metrics can cause layout drift
  even though each remains one authored atomic slot.

## UNKNOWN

- Whether grammar tightening and image additions require document v4 or a
  different explicit migration/version policy.
- Final inline-image source payload, alt text, dimensions, and baseline
  alignment.
- Exact toolbar active-mark behavior at a boundary between unlike text styles.
- Role-specific block split/merge behavior.
- Production clipboard format for managed atomics.
- Collaboration/offline granular operation and range-rebasing protocol.

## PASS

- Current core has stable block-scoped UTF-16 projections and granular plain
  text transaction evidence.
- Field-ref, page-number, and line-break already project as non-text segments.
- Atomic field-ref insertion and rejection of plain edits through atomics are
  tested.
- Sparse text run styles and style-preserving insertion baseline exist.
- Rich-inline replacement, history-ready facts, dirty scope, and exact-stale
  signals exist for bounded single-user use.
- Hybrid managed-card input and one active island remain the accepted product
  direction.
- Backend rich-inline facts remain separated from editor selection and core
  grammar ownership.

## Intentionally Not Changed

- package v2/document v3 schema;
- current four-type `InlineNodeSchema`;
- text transaction or rich-inline runtime behavior;
- table-cell placeholder creation;
- product editor selection state or DOM;
- field palette or field placement;
- backend mutation routes or storage writes;
- image schema, asset registry, upload, crop, floating wrap, or rendering;
- pagination, fragments, PDF/DOCX artifacts, or collaboration.

## Next Recommended Direction

Implement a pure Text-block v1 grammar validator and normalizer behind an
explicit target-version boundary. Start with text, line-break, field-ref, and
page-number consistency plus empty-block/newline/surrogate checks. Do not add
inline-image until the following image source contract decides its payload and
document-version policy.
