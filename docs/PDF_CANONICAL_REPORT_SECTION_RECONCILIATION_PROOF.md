# PDF Canonical Report Section Reconciliation Proof

Status: PDF-PILOT-08B-R2C-H reconciliation accepted; twelve-page pagination remains blocked.

## Objective

R2C-H consumes the accepted R2C-C projection and R2C-G vertical-capacity
bundle. It replaces the incorrect one-Core-section-per-semantic-section
projection with one continuous composition section, retains all semantic
lineage separately, defines a reusable Core demand/window spacing bridge, and
recalculates the twelve-page gate without deleting report content.

The phase does not bind family pagination inputs, measure generated page
numbers, split tables, repeat table headers, assign pages, or render PDF bytes.

## Accepted Inputs

- R2C-C projection fingerprint:
  `f1a756ec9d3028a0eba9cc455bec852eea16cbac9702cd825c4e29bc4113fc2c`;
- R2C-G vertical-capacity fingerprint:
  `5926711cbca1000888e4d7accb99d000f4c6549d504b2359c4b97884272bc994`;
- reconciliation plan fingerprint:
  `99d723197d7928bc4b5e2d3071d9a060ea401e85b410db8a4dca93c31fcc5839`;
- reconciled projection fingerprint:
  `sha256:6d1cdede9cf3d55894bc9673e4bda34942ceb1d16e4f827d2f7a3c4688f97af3`;
- Core manifest fingerprint:
  `sha256:9a39de97f63947451093bf3d709548068f78f8fe2d3f7ead7a954da186b2cbba`;
- accepted bundle fingerprint:
  `4b538abb9c849abad3cee9a6bfd498f55c351e1adc31300dcae0f82c94def972`.

Both source bundles are self-hash checked. R2C-G must retain the exact R2C-C
lineage and a valid Core composition manifest before reconciliation can run.

## Core Spacing Bridge

Core now exposes `documentCompositionSpacingBridgeV1`. The bridge does not add
authored or derived spacer roots. For each document-composition demand it:

1. subtracts the root's leading gap from the first-page capacity sent to the
   family paginator;
2. returns `fresh-page-required` unchanged when the adjusted capacity cannot
   make progress;
3. suppresses the gap when the retry demand starts on a fresh page;
4. projects a preserved gap as a no-paint offset before first-page fragments;
5. restores the original transition capacity and binds the transformed window
   to a new pagination fingerprint.

This avoids the atomic-spacer failure mode where a standalone spacer could
move to the top of a new page independently from the content it precedes.
Focused Core tests cover preserve, suppress, retry, zero-gap, and drift cases.

## Section Reconciliation

The twelve source sections are semantic report divisions, but R2C-G projected
all twelve as Core composition sections. Core correctly closes every section
boundary, producing a seventeen-page natural floor and eighteen-page spaced
capacity count.

R2C-H proves that all twelve source sections have the same normalized Letter
page profile, header content, and footer structure. Only the first section owns
`pageNumberStart: 1`; the other eleven continue generated numbering. The
reconciled Core manifest therefore uses one continuous composition section and
the first section's equivalent header/footer evidence. A separate map retains:

- all twelve semantic section identities and order;
- each original body zone;
- all 173 root identities and family/measurement owner pins;
- composition zone order for reconstructing semantic lineage.

The source Document v4 and the accepted R2C-G bundle are not mutated.

## Corrected Spacing

R2C-G assigned zero leading gap to each section start because every section was
assumed to start on a fresh page. That is not valid after continuous-flow
reconciliation. R2C-H adds a `semantic-section-start` rule for the eleven
non-initial section headings:

- basis: accepted section-heading line height `22pt`;
- multiplier: `0.5`;
- leading gap: `11pt`;
- added spacing: `121pt`.

The bridge now binds all 173 roots. The first title retains zero gap; the other
172 roots have positive leading gaps. Gross spacing rises from `808pt` to
`929pt` before page-top suppression.

## Twelve-Page Gate

One continuous section removes eleven forced Core boundaries, reducing the
natural global demand to eleven capacity units. Corrected gross demand is
`7755.047243pt`, while twelve Letter bodies provide `7703.433072pt`. The gross
profile is therefore thirteen capacity units and exceeds the target by
`51.614171pt` before table-header repetition or continuation overhead.

Twelve pages remain theoretically possible because each fresh-page root
suppresses its leading gap. Across eleven possible new-page starts, the largest
theoretical suppression is `135pt`, leaving at most `83.385829pt` for all
pagination overhead after covering the gross overflow. This is an upper bound,
not a pass: breaks inside a continuing root suppress no inter-root gap, and
table splitting can consume the remaining budget.

The twelve-page gate therefore remains blocked until real family pagination
proves exact suppression, repeated headers, continuation fragments, and final
page count.

## Boundaries

R2C-H owns static-zone content equivalence, the continuous composition
projection, semantic lineage, section-start spacing, Core spacing bindings,
the reconciled manifest, and the pagination-sensitive capacity gate.

It does not own source section mutation, content removal, family pagination
input materialization, generated footer measurement, row splitting, repeated
headers, page assignment, or PDF bytes.

## Reproduction

```text
npm --prefix packages/pdf-renderer-pilot run build:report-section-reconciliation
npx vitest run tests/documentCompositionSpacingBridgeV1.test.ts tests/pdfRendererPilotCanonicalReportSectionReconciliation.test.ts
npm run check
```

## Evidence

- `src/composition/documentCompositionSpacingBridgeV1.ts`;
- `fixtures/pdf-pilot-canonical-report-section-reconciliation.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-section-reconciliation-qa.v1.json`;
- `packages/pdf-renderer-pilot/src/canonicalReportSectionReconciliation.ts`;
- `tests/documentCompositionSpacingBridgeV1.test.ts`;
- `tests/pdfRendererPilotCanonicalReportSectionReconciliation.test.ts`.

Next phase: `PDF-PILOT-08B-R2C-I` family pagination input binding and generated
footer measurement.
