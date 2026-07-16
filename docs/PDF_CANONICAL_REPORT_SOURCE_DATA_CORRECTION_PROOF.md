# PDF Canonical Report Source-Data Correction Proof

Status: PDF-PILOT-08B-R1 source-data correction accepted.

Umbrella work item: `PDF-PILOT-INV-9437125258`.

## Reason For Revision

PDF-PILOT-08A proved semantic presence and extracted-character coverage, while
PDF-PILOT-08B proved typography and layout. Neither phase proved that every
displayed value was derived from the benchmark source model. A source audit
found seven factual drifts that those contracts could not detect.

The renderer, typography, and prior byte evidence remain valid. Their factual
parity claim is superseded by this revision.

## Source Chain

The correction manifest pins five external files without copying their bytes
into Core:

| Source | Role | SHA-256 |
| --- | --- | --- |
| `build_report.py` | report formatting and prose assembly | `d074e334ab877dbe1294fe6ecc2b7c080a4932731999f638c0eeac29650d2e49` |
| `metrics.json` | computed benchmark metrics | `b9b6f11475b45a15080631dc1c280071704ee09bae55466e7a18699cccd6f309` |
| `ground-truth.json` | human-reviewed reference values | `77e4973ae4f21da4c50bcfb2700551372e3333b0d638840b6879f20a10c8bea0` |
| `benchmark-spec.json` | conditions and Run IDs | `acbf7d6eaccaa82b8f86f80b8123602ae204b56e8da8f10f19b12df979b54568` |
| `analyze.ts` | raw-result metric derivation | `f0744b147a69783df8471d852b2785464f7ed0939da35fbf74dd6ec84dc1cffb` |

`analyze.ts` was rerun against the six retained raw runs in an isolated
directory. Its output equals the pinned `metrics.json` after excluding only the
new `generatedAt` timestamp. This local verification did not modify the OCR
benchmark workspace.

## Binding Contract

`fixtures/pdf-pilot-canonical-report-source-data.v1.json` contains a generated
source snapshot, not hand-authored report numbers. The request builder:

1. verifies all five byte lengths and SHA-256 identities;
2. recomputes every metric summary from its three run records;
3. verifies benchmark/run identities, validation flags, total cost, truth-set
   counts, repeatability, and stable forced-GDIM results;
4. derives 205 scalar report values across 16 data-bearing elements;
5. requires the derived snapshot digest
   `cfca20e65bfac2e2b20fe837d54985fada0e256549aefd18c8b935b20471ac26`;
6. fails before shaping when source identity or derived content drifts.

The snapshot covers cover identity/date, executive metrics, method settings,
OCR/native tables, ground-truth examples, missing native concepts, latency and
cost, GDIM mapping, decision trade-offs, Run IDs, and evidence facts. Static
prose remains governed by the 08A content contract.

## Corrected Facts

| Page | Fact | Previous | Source-backed |
| --- | --- | --- | --- |
| 7 | Azure OCR maximum latency | `4.90 วิ` | `6.50 วิ` |
| 7 | Google Document AI maximum latency | `9.70 วิ` | `9.75 วิ` |
| 11 | Azure round 1 Run ID | `2026-07-16T11-54-39-432Z` | `2026-07-16T11-52-39-170Z` |
| 11 | Azure round 2 Run ID | `2026-07-16T11-57-51-612Z` | `2026-07-16T11-52-57-651Z` |
| 11 | Google round 2 Run ID | `2026-07-16T12-00-39-322Z` | `2026-07-16T11-53-50-392Z` |
| 11 | Google round 3 Run ID | `2026-07-16T12-04-06-892Z` | `2026-07-16T11-54-06-893Z` |
| 11 | Azure round 3 Run ID | `2026-07-16T12-06-23-394Z` | `2026-07-16T11-54-21-384Z` |

The earlier `0.20 MB` to `0.10 MB` Azure OCR correction remains valid and is
now derived from `metrics.json` rather than protected only as an exact string.

## Artifact And QA

```text
PDF: output/pdf/flowdoc-pdf-pilot-canonical-report-source-backed-twelve-page.pdf
bytes: 941,026
sha256: 78c35020d987fb478ea269fb2cb90181c64444b7f8f59a175276d350b01bfca5
pages: 12
glyph runs: 413
glyphs: 10,562
fonts/images: 2 / 5
```

Poppler `pdftoppm` and `pdftocairo` each rendered 12 nonblank `1224 x 1584`
pages at 144 DPI. ActualText order matches all 413 measured runs, Poppler finds
all 413 after whitespace normalization, the seven corrected values are present,
and stale values are absent. Pages 7 and 11 pass visual inspection without
clipping, overlap, or footer collision. A second build reproduced the same PDF
hash. The Phase 08B PDF hash remains unchanged.

Primary evidence:

- `fixtures/pdf-pilot-canonical-report-source-data.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-source-backed-twelve-page-qa.v1.json`;
- `tests/pdfRendererPilotCanonicalReportSourceData.test.ts`.

## Scope Boundary

This revision proves source-derived decision data for the retained benchmark.
It does not claim verbatim prose parity, pixel equivalence, automatic layout,
production renderer binding, storage, delivery, or broader document coverage.

Next phase: `PDF-PILOT-08C` visual acceptance thresholds.
