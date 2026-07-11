# Text-block v1 Grammar Validator and Normalizer

Date: 2026-07-11

Status: Phase 249 pure target-grammar implementation.

## Purpose

Phase 249 implements the first executable boundary from the Phase 248 grammar
lock without tightening package v2/document v3 parsing or mutating documents
on read.

The public core boundary provides:

- `validateVNextTextBlockV1Grammar(...)`;
- `planVNextTextBlockV1Normalization(...)`;
- `applyVNextTextBlockV1Normalization(...)`;
- `isVNextTextBlockV1SafeTextOffset(...)`.

## Validation

Validation returns `valid`, `normalization-required`, or `blocked` plus
JSON-safe issues and counts.

The current implementation checks:

- duplicate inline ids;
- empty text leaves;
- raw CR, LF, and CRLF in text leaves;
- malformed current inline shapes;
- unpaired UTF-16 surrogates;
- field-ref keys against an optional provided registry;
- scalar inline compatibility for text, number, date, boolean, and enum fields;
- rejection of image and collection fields as text field-ref usages;
- page-number placement outside static header/footer zones.

## Normalization

Only two deterministic repairs are planned:

1. remove empty text leaves;
2. split raw CR/LF sequences into styled text leaves and explicit line-break
   atomics.

Normalization preserves source text ids on the first produced text segment,
allocates deterministic collision-safe ids for later text/break segments,
copies text style only to produced text leaves, and never mutates the input.

Blocked validation returns no normalized text-block. Duplicate ids, missing or
incompatible fields, invalid page-number zones, malformed inline shapes, and
unpaired surrogates are not guessed or repaired.

`applyVNextTextBlockV1Normalization(...)` applies only the already-built pure
plan and returns a clone. It does not write a package, history, storage, route,
editor state, or layout artifact.

## Offset Safety

`isVNextTextBlockV1SafeTextOffset(...)` accepts integer UTF-16 offsets within a
text string and rejects positions between a high/low surrogate pair. Grapheme
selection remains input-adapter policy as locked in Phase 248.

## Fixture Evidence

`tests/textBlockV1GrammarFixtures.test.ts` audits all current product fixtures:

| Fixture | Text blocks | Valid | Normalize | Blocked |
|---|---:|---:|---:|---:|
| `product-report-vnext-baseline.flowdoc.json` | 35 | 35 | 0 | 0 |
| `product-report-vnext-minimal.flowdoc.json` | 5 | 5 | 0 | 0 |
| `product-report-vnext.flowdoc.json` | 28 | 28 | 0 | 0 |
| `reorder-blocked-target-qa.flowdoc.json` | 4 | 4 | 0 | 0 |

All 72 current fixture text-blocks pass without implicit normalization. At the
end of Phase 249, table insert operations still created empty text leaves;
Phase 250 aligned those accepted-write producers with canonical empty blocks.

## PASS

- Pure validation, planning, and apply contracts are public and JSON-safe.
- Normalization is deterministic, style-preserving, idempotent, and
  source-immutable.
- Unsafe identity, field, zone, shape, and Unicode cases block explicitly.
- Thai and valid emoji text pass unchanged.
- Current product fixtures pass the target grammar without migration.
- Source guards keep the module independent from DOM, storage, package writes,
  backend transport, pagination, and renderer execution.

## FAIL / BLOCKER

- No blocker prevents using this helper for explicit audits and future command
  preflight.
- Automatic package-read normalization remains blocked by version/migration
  policy.
- Inline-image remains blocked until its source contract and schema exist.
- Production text editing remains blocked on editor active-target/range/IME
  state and revision-safe backend text mutation transport.

## RISK

- The target grammar is stricter than current document v3 for empty text and
  raw newlines.
- Producers outside the audited core table operations can still create
  target-grammar warnings if they bypass this boundary.
- Field compatibility currently uses registry field type; richer field
  presentation capabilities may require an explicit registry extension.
- Offset safety prevents surrogate splits but does not perform grapheme
  segmentation.

## UNKNOWN

- Phase 251 resolves enforcement to target document v4 through explicit
  copy-forward migration, with no package-read normalization.
- Inline-image source payload and image-field placement contract.
- When and where normalization becomes an accepted write operation.
- Whether future field metadata needs a capability beyond current field type.

## Files Changed

- `src/authoring/textBlockV1Grammar.ts`
- `src/index.ts`
- `tests/textBlockV1Grammar.test.ts`
- `tests/textBlockV1GrammarFixtures.test.ts`
- `docs/TEXT_BLOCK_V1_GRAMMAR_VALIDATOR.md`
- `README.md`
- `docs/PHASE_LEDGER.md`

## Behavior Changed

- A new opt-in pure public core helper can inspect and normalize cloned
  text-block values.
- Existing package parsing, operations, editor behavior, backend behavior,
  pagination, and rendering are unchanged.

## Intentionally Not Changed

- package v2/document v3 parser and serializer;
- canonical `InlineNodeSchema`;
- existing text/rich-inline operations;
- table-cell placeholder creation, which was subsequently aligned in Phase
  250;
- fixtures;
- editor state, DOM, WYSIWYG, and field palette;
- backend routes, package records, and storage writes;
- image schema or asset lifecycle;
- layout, fragments, and artifacts.

## Next Recommended Direction

After Phase 251 selects target document v4 and explicit copy-forward migration,
define the image source contract and extend this grammar with inline-image
payload facts before activating a v4 parser or migration executor.
