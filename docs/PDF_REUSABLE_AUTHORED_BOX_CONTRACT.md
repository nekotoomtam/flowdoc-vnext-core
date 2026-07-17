# PDF Reusable Authored Box Contract

Status: PDF-PILOT-08B-R2C-S reusable authored box contract accepted

## Decision

Core now owns a reusable authored-box planning and page-fragment projection
contract. It normalizes authored fill, padding, and per-edge border values,
derives content insets and measurement width, validates authoritative layout
placements, and emits fill and border paint intents without report semantics.

The canonical report adapter still decides that consecutive reader-label and
note nodes form one callout. That semantic grouping is report policy and is not
part of the Core contract.

The accepted canonical display bundle and PDF remain byte-identical. Real
export binding, visual fidelity, and production binding remain false.

## Core Boundary

`createVNextAuthoredBoxPlanV1` accepts a parsed Document v4 `text-block`,
`column`, or `table-cell` and its available outer width. A ready plan records:

- normalized point values for padding and all four borders;
- normalized fill and border colors;
- content insets equal to padding plus the corresponding border width;
- positive content width derived from the outer width;
- stable style and complete-plan fingerprints;
- the `open-continuation-edges` page-split policy.

`projectVNextAuthoredBoxFragmentsV1` consumes that plan plus authoritative
layout placements. It does not measure text or paginate. The caller supplies
page identity, exact page-container bounds, block offsets and extents, and the
single start/end boundaries. The projection emits one fragment per occupied
page, one fill intent per fragment when authored, side-border intents on every
fragment, and top/bottom border intents only at the closed first/last edges.

Malformed widths, unsupported owners, invalid border semantics, duplicate or
gapped placements, container drift, and missing padding reserve block the
projection without partial output.

## Ownership

| Boundary | Owner |
| --- | --- |
| Authored fill, padding, border normalization | Core authored-box contract |
| Content inset and measurement width | Core authored-box contract |
| Fragment bounds and paint intents | Core authored-box contract |
| Text measurement and line breaking | existing text-engine boundary |
| Page placement and continuation facts | existing Core pagination boundary |
| Which report nodes form a callout | canonical report adapter |
| PDF byte execution | isolated PDF renderer pilot |

Core source contains no `callout`, `reader-label`, or `reader-summary` policy.
The adapter retains `calloutProjection` only to select the semantic group and
map its authoritative placements into the generic contract.

## Canonical Migration

All twelve canonical reader label/note nodes now use the Core plan at both
measurement and display-list boundaries. Their `467.95pt` outer width, `9pt`
horizontal inset, and `449.95pt` content width are unchanged.

The two report-owned groups still produce three Core-authored fragments:

| Group | Pages | Placements | Fill intents |
| --- | --- | ---: | ---: |
| Executive summary | 1, 2 | 6 | 2 |
| Decision view | 10 | 6 | 1 |

Exact retained identities:

- body display bundle fingerprint:
  `96c48b7287fc0c5532059cf8ad4ff135df5f07fb63bfe6bf6054e150775a8b67`;
- canonical PDF SHA-256:
  `c4d09f0dfd66e1e3983bc679602fdc7d397de30edcb4f93fac3a0fa0c422960b`;
- canonical PDF size and page count: `1,212,656` bytes and 13 pages.

The exact measurement handoff, body display fixture, renderer summary, and PDF
rebuild without artifact changes. This proves an ownership migration, not a
post-layout visual patch.

## Acceptance

- public Core v1 plan and projection types are exported;
- no-box owners preserve the full available content width;
- point and millimetre authored values normalize deterministically;
- fill, padding, all four border edges, three visible border styles, and
  content insets are covered;
- single-page and three-page fragment projection are covered;
- continuation edges suppress only the open top/bottom border intents;
- invalid geometry and placement lineage fail closed;
- all twelve canonical nodes delegate measurement width to Core;
- both canonical groups delegate fragment geometry and fill intent to Core;
- canonical semantic grouping remains outside Core;
- accepted bundle and PDF identities remain exact.

The canonical artifact currently exercises authored fill and padding. Generic
border projection is contract-tested, but an end-to-end authored-border export
artifact is not claimed. Poppler/PDFium compatibility remains the accepted
Phase R reader baseline; MuPDF and Acrobat remain untested.

## Evidence

- `src/renderer/authoredBoxContractV1.ts`;
- `tests/authoredBoxContractV1.test.ts`;
- `tests/pdfRendererPilotReusableAuthoredBoxContract.test.ts`;
- `packages/pdf-renderer-pilot/src/canonicalReportMeasurementRequestHandoff.ts`;
- `packages/pdf-renderer-pilot/src/canonicalReportBodyDisplayList.ts`;
- `fixtures/pdf-pilot-canonical-report-body-display-list.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-summary.v1.json`.

Next phase: `PDF-PILOT-08B-R2C-T real export handoff`. It must bind a real
export request to the existing resolved, measured, paginated, and authored-box
contracts without letting the exporter remeasure, regroup, or relayout content.
