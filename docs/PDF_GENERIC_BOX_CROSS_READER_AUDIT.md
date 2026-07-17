# PDF Generic Box and Cross-Reader Audit

Status: PDF-PILOT-08B-R2C-R cross-reader baseline accepted

## Decision

The measured PDF paint boundary is generic enough to carry axis-aligned box
fills and strokes without callout semantics. Poppler and PDFium independently
render the retained generic panel and the three canonical callout fragments
inside the accepted one-pixel reader-agreement threshold.

This does not generalize the authored box pipeline. Padding-aware measurement
and consecutive label/note grouping still belong to the canonical report
adapter. A reusable authored-box contract remains the next topic.

Visual fidelity and production binding remain false.

## Independent Artifacts

The audit uses two existing artifacts rather than deriving both conclusions
from the canonical report:

| Artifact | Purpose | SHA-256 | Pages |
| --- | --- | --- | ---: |
| Thai one-page panel | generic `fill-rect` plus `stroke-rect` outside report policy | `fafa7e4d01df4d9f9b5acdffe2d7652e073e5b329142e4c8886085521322fd24` | 1 |
| Canonical full document | measured callout fragments from Core pagination | `c4d09f0dfd66e1e3983bc679602fdc7d397de30edcb4f93fac3a0fa0c422960b` | 13 |

The panel contract paints `492 x 124pt` at `(60, 60)pt` with a fill and a
`0.75pt` solid stroke. It has no dependency on the canonical template,
reader-summary roles, source fields, or report pagination.

The canonical artifact contributes the executive fragments on pages 1 and 2
and the decision fragment on page 10. All three retain the exact bounds emitted
by the Phase Q display-list contract.

## Reader Evidence

The audit renders selected pages at 96 DPI through two independent engine
families:

- Poppler 25.07.0 through `pdftocairo` and `pdftotext`;
- PDFium 151.0.7920.0 through pypdfium2 5.11.0.

Every selected page is `816 x 1056` RGB and nonblank. Both engines recover all
pinned Thai text sentinels. Full-page pixel parity is intentionally not a gate
because font anti-aliasing differs by engine.

| Region | Page | Max contract edge delta | Max reader edge delta | Result |
| --- | ---: | ---: | ---: | --- |
| Generic panel fill and stroke | 1 | 1px | 1px | accepted |
| Executive callout start | 1 | 1px | 1px | accepted |
| Executive callout continuation | 2 | 1px | 1px | accepted |
| Decision callout | 10 | 1px | 1px | accepted |

MuPDF and Adobe Acrobat are not claimed as tested. The pinned workspace does
not provide a callable PyMuPDF runtime, and this phase has no deterministic
Acrobat raster/text harness.

## Boundary Classification

| Boundary | Current fact | Generic now |
| --- | --- | --- |
| Document v4 target schema | `text-block`, `column`, and `table-cell` can carry fill, padding, and border | yes, schema only |
| Measured PDF draw contract | exposes `fill-rect` and `stroke-rect` | yes |
| PDF renderer pilot | consumes rectangle paints without reader-summary semantics | yes |
| Canonical measurement handoff | `textBlockContentWidthPt` subtracts authored padding | no, report adapter |
| Canonical display list | `calloutProjection` groups consecutive label/note nodes | no, report adapter |

The accepted boundary is therefore a generic renderer primitive plus a
cross-reader baseline. It is not evidence that arbitrary authored boxes flow
through measurement, pagination, fragment ownership, and rendering yet.

## Acceptance

- two independent renderer families exercised;
- two independent PDF artifacts retained;
- one generic fill/stroke panel accepted;
- three measured callout fragments accepted;
- contract-edge delta at most 1px, below the 2px contract threshold;
- reader-to-reader edge delta at most 1px;
- all selected pages nonblank and all Thai sentinels recovered;
- no report-specific policy moved into Core;
- pixel parity, reusable authored-box acceptance, visual fidelity, and
  production binding remain false.

## Evidence

- `fixtures/pdf-pilot-thai-one-page-request.v1.json`;
- `fixtures/pdf-pilot-canonical-report-body-display-list.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/generic-box-cross-reader-compatibility.v1.json`;
- `packages/pdf-renderer-pilot/scripts/inspect-generic-box-cross-reader-compatibility.py`;
- `tests/pdfRendererPilotGenericBoxCrossReaderCompatibility.test.ts`.

Reproduce after building both PDF artifacts:

```text
python packages/pdf-renderer-pilot/scripts/inspect-generic-box-cross-reader-compatibility.py
```

The command requires Poppler `pdftocairo`, `pdftotext`, and `pdfinfo`, plus
Python `numpy`, `Pillow`, and `pypdfium2`. Raster intermediates are written
under `tmp/pdfs/r2c-r` and are not retained in the repository.

Next topic: `PDF-PILOT-08B-R2C-S` reusable authored box contract. It must move
padding, fragment ownership, fill, and border projection behind a generic
boundary before additional report policies use it.
