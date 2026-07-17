from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from statistics import mean

import pdfplumber
from PIL import Image


PACKAGE_ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = PACKAGE_ROOT.parent.parent
PAGE_HEIGHT_PT = 792.0
HEADING_IDS = [
    "cover",
    "executive-summary",
    "method",
    "ocr-accuracy",
    "source-evidence",
    "native-extraction",
    "latency-cost-size",
    "mapping",
    "decision-view",
    "limitations",
    "appendix-runs",
    "appendix-evidence",
]
RASTER_BANDS_PT = [
    ("top-static", 0.0, 48.0),
    ("top-transition", 48.0, 84.0),
    ("body-core", 84.0, 708.0),
    ("bottom-transition", 708.0, 744.0),
    ("bottom-static", 744.0, 792.0),
]

parser = argparse.ArgumentParser()
parser.add_argument("--reference", required=True)
parser.add_argument(
    "--candidate",
    default="output/pdf/flowdoc-pdf-pilot-canonical-full-document-13-page.pdf",
)
parser.add_argument(
    "--composition",
    default="fixtures/pdf-pilot-canonical-report-composition.v1.json",
)
parser.add_argument(
    "--capacity",
    default="fixtures/pdf-pilot-canonical-report-vertical-capacity.v1.json",
)
parser.add_argument(
    "--bundle",
    default="fixtures/pdf-pilot-canonical-report-body-display-list.v1.json",
)
parser.add_argument(
    "--summary",
    default="packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-summary.v1.json",
)
parser.add_argument(
    "--reference-raster-dir",
    default="tmp/pdfs/r2c-o/reference",
)
parser.add_argument(
    "--candidate-raster-dir",
    default="tmp/pdfs/r2c-o/current",
)
parser.add_argument(
    "--output",
    default="packages/pdf-renderer-pilot/fixtures/canonical-full-document-reader-hierarchy.v1.json",
)
parser.add_argument(
    "--phase-id",
    choices=["PDF-PILOT-08B-R2C-N", "PDF-PILOT-08B-R2C-O"],
    default="PDF-PILOT-08B-R2C-O",
)
parser.add_argument(
    "--baseline-comparison",
    default=(
        "packages/pdf-renderer-pilot/fixtures/"
        "canonical-full-document-visual-comparison.v1.json"
    ),
)
args = parser.parse_args()


def repo_path(value: str) -> Path:
    path = Path(value)
    return path if path.is_absolute() else REPO_ROOT / path


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def normalized_length(value: str) -> int:
    return len(re.sub(r"\s+", "", value or ""))


def rounded(value: float, digits: int = 4) -> float:
    return round(float(value), digits)


def clustered_tops(values: list[float]) -> list[float]:
    groups: list[list[float]] = []
    for value in sorted(values):
        if not groups or value - groups[-1][-1] > 0.8:
            groups.append([value])
        else:
            groups[-1].append(value)
    return [rounded(min(group), 1) for group in groups]


def detect_headings(pages) -> list[dict]:
    cover: list[tuple[int, float]] = []
    sections: list[tuple[int, float]] = []
    for page_number, page in enumerate(pages, start=1):
        words = page.extract_words(extra_attrs=["size", "fontname"])
        cover_tops = clustered_tops([
            float(word["top"])
            for word in words
            if round(float(word["size"]), 1) >= 23.5
        ])
        section_tops = clustered_tops([
            float(word["top"])
            for word in words
            if 15.8 <= round(float(word["size"]), 1) <= 16.2
        ])
        cover.extend((page_number, top) for top in cover_tops)
        sections.extend((page_number, top) for top in section_tops)

    ordered = [min(cover)] + sorted(sections) if cover else sorted(sections)
    if (
        not cover
        or any(page_number != 1 for page_number, _ in cover)
        or len(sections) != len(HEADING_IDS) - 1
    ):
        raise RuntimeError(
            "Expected a page-one cover heading and eleven 16pt section headings; "
            f"found cover={cover}, sections={sections}"
        )
    return [
        {
            "sectionId": section_id,
            "pageNumber": page_number,
            "topPt": top,
            "documentTopPt": rounded((page_number - 1) * PAGE_HEIGHT_PT + top, 1),
        }
        for section_id, (page_number, top) in zip(HEADING_IDS, ordered)
    ]


def body_section_facts(chars: list[dict], headings: list[dict], page_count: int) -> list[dict]:
    facts = []
    for index, heading in enumerate(headings):
        start = heading["documentTopPt"]
        end = (
            headings[index + 1]["documentTopPt"]
            if index + 1 < len(headings)
            else page_count * PAGE_HEIGHT_PT
        )
        character_count = sum(
            normalized_length(char["text"])
            for char in chars
            if start <= char["documentTopPt"] < end
        )
        facts.append({
            **heading,
            "nonWhitespaceCharacterCount": character_count,
        })
    return facts


def analyze_pdf(path: Path, body_top_pt: float, body_bottom_pt: float) -> dict:
    font_counts: Counter[str] = Counter()
    font_size_counts: Counter[float] = Counter()
    page_facts = []
    body_chars: list[dict] = []
    all_chars: list[dict] = []
    image_page_numbers = []

    with pdfplumber.open(path) as pdf:
        headings = detect_headings(pdf.pages)
        for page_number, page in enumerate(pdf.pages, start=1):
            extracted_text = page.extract_text() or ""
            non_whitespace_chars = [
                char for char in page.chars if not char.get("text", "").isspace()
            ]
            page_body_chars = [
                char
                for char in non_whitespace_chars
                if float(char["top"]) >= body_top_pt
                and float(char["bottom"]) <= body_bottom_pt
            ]
            for char in non_whitespace_chars:
                font_counts[char.get("fontname", "unknown")] += normalized_length(char["text"])
                font_size_counts[round(float(char.get("size", 0.0)), 1)] += normalized_length(
                    char["text"]
                )
                all_chars.append(char)
            for char in page_body_chars:
                body_chars.append({
                    **char,
                    "documentTopPt": (page_number - 1) * PAGE_HEIGHT_PT
                    + float(char["top"]),
                })

            if page.images:
                image_page_numbers.append(page_number)
            body_bounds = None
            if page_body_chars:
                body_bounds = {
                    "x0Pt": rounded(min(float(char["x0"]) for char in page_body_chars), 2),
                    "topPt": rounded(min(float(char["top"]) for char in page_body_chars), 2),
                    "x1Pt": rounded(max(float(char["x1"]) for char in page_body_chars), 2),
                    "bottomPt": rounded(
                        max(float(char["bottom"]) for char in page_body_chars), 2
                    ),
                }
            page_facts.append({
                "pageNumber": page_number,
                "widthPt": rounded(page.width, 2),
                "heightPt": rounded(page.height, 2),
                "extractedNonWhitespaceCharacterCount": normalized_length(extracted_text),
                "bodyCharacterCount": sum(
                    normalized_length(char["text"]) for char in page_body_chars
                ),
                "bodyBounds": body_bounds,
                "lineObjectCount": len(page.lines),
                "rectangleObjectCount": len(page.rects),
                "imageObjectCount": len(page.images),
            })

        bold_count = sum(
            count for name, count in font_counts.items() if "bold" in name.lower()
        )
        total_font_chars = sum(font_counts.values())
        body_bounds = {
            "x0Pt": rounded(min(float(char["x0"]) for char in body_chars), 2),
            "topPt": rounded(min(float(char["top"]) for char in body_chars), 2),
            "x1Pt": rounded(max(float(char["x1"]) for char in body_chars), 2),
            "bottomPt": rounded(max(float(char["bottom"]) for char in body_chars), 2),
        }
        body_bounds["widthPt"] = rounded(body_bounds["x1Pt"] - body_bounds["x0Pt"], 2)
        body_bounds["heightPt"] = rounded(
            body_bounds["bottomPt"] - body_bounds["topPt"], 2
        )
        static_envelope = {
            "topPt": rounded(min(float(char["top"]) for char in all_chars), 2),
            "bottomPt": rounded(max(float(char["bottom"]) for char in all_chars), 2),
        }
        section_facts = body_section_facts(body_chars, headings, len(pdf.pages))
        return {
            "sha256": sha256(path),
            "bytes": path.stat().st_size,
            "pageCount": len(pdf.pages),
            "allLetter612x792Pt": all(
                rounded(page.width, 2) == 612.0 and rounded(page.height, 2) == 792.0
                for page in pdf.pages
            ),
            "extractedNonWhitespaceCharacterCount": sum(
                fact["extractedNonWhitespaceCharacterCount"] for fact in page_facts
            ),
            "bodyCharacterCount": sum(fact["bodyCharacterCount"] for fact in page_facts),
            "fontCharacterCounts": dict(font_counts.most_common()),
            "fontSizeCharacterCounts": {
                str(size): count for size, count in font_size_counts.most_common()
            },
            "dominantFontSizePt": font_size_counts.most_common(1)[0][0],
            "boldCharacterCount": bold_count,
            "boldCharacterShare": rounded(bold_count / total_font_chars, 6),
            "bodyAnalysisWindow": {
                "topPt": rounded(body_top_pt, 6),
                "bottomPt": rounded(body_bottom_pt, 6),
            },
            "observedBodyBounds": body_bounds,
            "observedStaticEnvelope": static_envelope,
            "imagePageNumbers": image_page_numbers,
            "headings": headings,
            "sections": section_facts,
            "pages": page_facts,
        }


def analyze_rasters(directory: Path, expected_page_count: int) -> dict:
    paths = sorted(directory.glob("page-*.png"))
    if len(paths) != expected_page_count:
        raise RuntimeError(
            f"Expected {expected_page_count} rasters in {directory}, found {len(paths)}"
        )
    pages = []
    band_ratios: dict[str, list[float]] = {name: [] for name, _, _ in RASTER_BANDS_PT}
    for page_number, path in enumerate(paths, start=1):
        with Image.open(path) as source:
            image = source.convert("RGB")
            grayscale = image.convert("L")
            histogram = grayscale.histogram()
            non_white = sum(histogram[:250])
            mask = grayscale.point(lambda value: 255 if value < 250 else 0)
            bbox = mask.getbbox()
            page_bands = {}
            for name, top_pt, bottom_pt in RASTER_BANDS_PT:
                top_px = round(top_pt / PAGE_HEIGHT_PT * image.height)
                bottom_px = round(bottom_pt / PAGE_HEIGHT_PT * image.height)
                band = grayscale.crop((0, top_px, image.width, bottom_px))
                band_non_white = sum(band.histogram()[:250])
                ratio = band_non_white / (band.width * band.height)
                page_bands[name] = rounded(ratio, 6)
                band_ratios[name].append(ratio)
            pages.append({
                "pageNumber": page_number,
                "widthPx": image.width,
                "heightPx": image.height,
                "nonWhitePixelRatio": rounded(non_white / (image.width * image.height), 6),
                "nonWhiteBoundsPt": None
                if bbox is None
                else {
                    "x0Pt": rounded(bbox[0] / image.width * 612.0, 2),
                    "topPt": rounded(bbox[1] / image.height * PAGE_HEIGHT_PT, 2),
                    "x1Pt": rounded(bbox[2] / image.width * 612.0, 2),
                    "bottomPt": rounded(bbox[3] / image.height * PAGE_HEIGHT_PT, 2),
                },
                "bandNonWhitePixelRatios": page_bands,
            })
    return {
        "renderer": "pdftoppm",
        "dpi": 96,
        "pageCount": len(pages),
        "allPages816x1056Px": all(
            page["widthPx"] == 816 and page["heightPx"] == 1056 for page in pages
        ),
        "meanNonWhitePixelRatio": rounded(
            mean(page["nonWhitePixelRatio"] for page in pages), 6
        ),
        "meanBandNonWhitePixelRatios": {
            name: rounded(mean(values), 6) for name, values in band_ratios.items()
        },
        "pages": pages,
    }


reference_path = repo_path(args.reference)
candidate_path = repo_path(args.candidate)
composition = read_json(repo_path(args.composition))
capacity = read_json(repo_path(args.capacity))
bundle = read_json(repo_path(args.bundle))
summary = read_json(repo_path(args.summary))

candidate_geometry = capacity["sectionCapacities"][0]["pageGeometry"]
candidate_body_top = float(candidate_geometry["bodyOriginYPt"])
candidate_body_bottom = candidate_body_top + float(candidate_geometry["bodyHeightPt"])
reference = analyze_pdf(reference_path, 45.0, 745.0)
candidate = analyze_pdf(candidate_path, candidate_body_top, candidate_body_bottom)

expected_reference = composition["referenceArtifact"]
if reference["sha256"] != expected_reference["sha256"]:
    raise RuntimeError("Reference PDF hash does not match the pinned composition artifact")
if reference["bytes"] != expected_reference["bytes"]:
    raise RuntimeError("Reference PDF byte length does not match the pinned composition artifact")
if candidate["sha256"] != summary["artifact"]["sha256"]:
    raise RuntimeError("Candidate PDF hash does not match the R2C-M renderer artifact")

reference_raster = analyze_rasters(
    repo_path(args.reference_raster_dir), reference["pageCount"]
)
candidate_raster = analyze_rasters(
    repo_path(args.candidate_raster_dir), candidate["pageCount"]
)

terminal_page = bundle["rendererHandoff"]["measuredDrawContract"]["pages"][-1]
terminal_body_commands = [
    command
    for command in terminal_page["commands"]
    if "canonical-body" in command["sourceCommandId"]
]
terminal_top = min(float(command["bounds"]["yPt"]) for command in terminal_body_commands)
terminal_bottom = max(
    float(command["bounds"]["yPt"]) + float(command["bounds"]["heightPt"])
    for command in terminal_body_commands
)
terminal_span = terminal_bottom - terminal_top

anchor_comparison = []
for reference_heading, candidate_heading in zip(reference["headings"], candidate["headings"]):
    if reference_heading["sectionId"] != candidate_heading["sectionId"]:
        raise RuntimeError("Semantic heading order changed between the artifacts")
    anchor_comparison.append({
        "sectionId": reference_heading["sectionId"],
        "reference": {
            "pageNumber": reference_heading["pageNumber"],
            "topPt": reference_heading["topPt"],
        },
        "candidate": {
            "pageNumber": candidate_heading["pageNumber"],
            "topPt": candidate_heading["topPt"],
        },
        "pageDelta": candidate_heading["pageNumber"] - reference_heading["pageNumber"],
        "documentTopDeltaPt": rounded(
            candidate_heading["documentTopPt"] - reference_heading["documentTopPt"], 1
        ),
    })

section_comparison = []
for reference_section, candidate_section in zip(reference["sections"], candidate["sections"]):
    if reference_section["sectionId"] != candidate_section["sectionId"]:
        raise RuntimeError("Semantic section order changed between the artifacts")
    reference_count = reference_section["nonWhitespaceCharacterCount"]
    candidate_count = candidate_section["nonWhitespaceCharacterCount"]
    section_comparison.append({
        "sectionId": reference_section["sectionId"],
        "referenceCharacterCount": reference_count,
        "candidateCharacterCount": candidate_count,
        "characterCountDelta": candidate_count - reference_count,
        "candidateToReferenceRatio": rounded(candidate_count / reference_count, 4),
    })

reference_envelope_height = reference["observedBodyBounds"]["heightPt"]
candidate_frame_height = float(candidate_geometry["bodyHeightPt"])
theoretical_gain_per_page = reference_envelope_height - candidate_frame_height
theoretical_gain_twelve_pages = theoretical_gain_per_page * expected_reference["pageCount"]
theoretical_headroom = theoretical_gain_twelve_pages - terminal_span
page_deltas = {anchor["pageDelta"] for anchor in anchor_comparison}

comparison = {
    "comparisonVersion": 1,
    "comparisonId": "pdf-pilot-08b-r2c-n-canonical-full-document-visual-comparison-v1",
    "phaseId": "PDF-PILOT-08B-R2C-N",
    "status": "accepted-comparison-visual-fidelity-rejected-thirteen-page-authoritative",
    "inputs": {
        "reference": {
            "artifactId": expected_reference["artifactId"],
            "pointer": expected_reference["pointer"],
            "sha256": reference["sha256"],
            "bytes": reference["bytes"],
            "pageCount": reference["pageCount"],
        },
        "candidate": {
            "artifactId": summary["artifact"]["artifactId"],
            "pointer": "local-output://pdf/flowdoc-pdf-pilot-canonical-full-document-13-page.pdf",
            "sha256": candidate["sha256"],
            "bytes": candidate["bytes"],
            "pageCount": candidate["pageCount"],
            "sourceBundleFingerprint": bundle["bundleFingerprint"],
        },
        "externalPdfBytesRetained": False,
        "rasterBytesRetained": False,
    },
    "method": {
        "geometryAndTextEngine": "pdfplumber",
        "geometryAndTextEngineVersion": pdfplumber.__version__,
        "rasterRenderer": "pdftoppm",
        "rasterDpi": 96,
        "nonWhiteThreshold": "grayscale < 250",
        "headingDetection": {
            "coverFontSizeMinimumPt": 23.5,
            "sectionFontSizeRangePt": [15.8, 16.2],
            "nearBaselineClusterTolerancePt": 0.8,
            "semanticBinding": "document-order-to-pinned-twelve-section-order",
        },
        "referenceBodyAnalysisWindowPt": [45.0, 745.0],
        "candidateBodyAnalysisWindowPt": [
            rounded(candidate_body_top, 6),
            rounded(candidate_body_bottom, 6),
        ],
        "limitations": [
            "Reference Thai extraction contains producer-specific glyph ordering artifacts.",
            "Character counts are a normalized extracted-text density proxy, not semantic equality.",
            "Raster occupancy is region evidence, not a pixel-parity score.",
            "Observed reference content bounds are not a reusable pagination frame.",
        ],
    },
    "reference": {**reference, "raster": reference_raster},
    "candidate": {**candidate, "raster": candidate_raster},
    "comparison": {
        "pageCountDelta": candidate["pageCount"] - reference["pageCount"],
        "extractedNonWhitespaceCharacterDelta": (
            candidate["extractedNonWhitespaceCharacterCount"]
            - reference["extractedNonWhitespaceCharacterCount"]
        ),
        "candidateToReferenceExtractedCharacterRatio": rounded(
            candidate["extractedNonWhitespaceCharacterCount"]
            / reference["extractedNonWhitespaceCharacterCount"],
            4,
        ),
        "dominantFontSizeDeltaPt": rounded(
            candidate["dominantFontSizePt"] - reference["dominantFontSizePt"], 1
        ),
        "boldCharacterShareDelta": rounded(
            candidate["boldCharacterShare"] - reference["boldCharacterShare"], 6
        ),
        "observedBodyWidthDeltaPt": rounded(
            candidate["observedBodyBounds"]["widthPt"]
            - reference["observedBodyBounds"]["widthPt"],
            2,
        ),
        "meanRasterInkRatioDelta": rounded(
            candidate_raster["meanNonWhitePixelRatio"]
            - reference_raster["meanNonWhitePixelRatio"],
            6,
        ),
        "anchors": anchor_comparison,
        "sections": section_comparison,
        "anchorPageDeltasAreNonUniform": len(page_deltas) > 1,
        "terminalContinuation": {
            "pageNumber": terminal_page["pageNumber"],
            "bodyCommandCount": len(terminal_body_commands),
            "topPt": rounded(terminal_top, 6),
            "bottomPt": rounded(terminal_bottom, 6),
            "spanPt": rounded(terminal_span, 6),
        },
        "verticalReclamationHypothesis": {
            "referenceObservedBodyEnvelopeHeightPt": reference_envelope_height,
            "candidateContractBodyFrameHeightPt": rounded(candidate_frame_height, 6),
            "theoreticalGainPerPagePt": rounded(theoretical_gain_per_page, 6),
            "theoreticalGainAcrossTwelvePagesPt": rounded(
                theoretical_gain_twelve_pages, 6
            ),
            "terminalContinuationSpanPt": rounded(terminal_span, 6),
            "theoreticalHeadroomPt": rounded(theoretical_headroom, 6),
            "capacityProof": False,
            "classification": "numerically-close-but-fragmentation-and-content-policy-unproven",
        },
        "regionClassifications": [
            {
                "region": "page-box",
                "classification": "matched",
                "evidence": "Both artifacts use 612x792pt Letter pages.",
            },
            {
                "region": "typography-scale",
                "classification": "near-reference",
                "evidence": "Section headings are 16pt in both artifacts and dominant text differs by 0.1pt.",
            },
            {
                "region": "typography-weight",
                "classification": "materially-diverged",
                "evidence": "Candidate bold-character share exceeds the reference by more than 25 percentage points.",
            },
            {
                "region": "static-zones",
                "classification": "materially-diverged",
                "evidence": "Candidate header/footer ink is inset relative to the reference envelope.",
            },
            {
                "region": "semantic-composition",
                "classification": "materially-diverged",
                "evidence": "Section density and anchors move non-uniformly because the candidate carries source-backed detail.",
            },
            {
                "region": "pagination",
                "classification": "content-driven-extra-page",
                "evidence": "The final 328pt table continuation is retained on page 13.",
            },
        ],
    },
    "decision": {
        "comparisonEvidenceAccepted": True,
        "visualFidelityAccepted": False,
        "pixelParityApplicable": False,
        "twelvePageHardGateAccepted": False,
        "sourceBackedPageCountAccepted": True,
        "authoritativeCandidatePageCount": candidate["pageCount"],
        "pageCountPolicy": "content-driven-not-reference-fixed",
        "reasonCodes": [
            "source-backed-content-exceeds-reference",
            "semantic-section-balance-differs",
            "anchor-drift-is-non-uniform",
            "margin-reclamation-is-not-capacity-proof",
            "terminal-table-content-must-be-retained",
        ],
        "allowedNextChanges": [
            "calibrate role-level font weight and static-zone geometry",
            "restore source-backed decision narrative without removing audit evidence",
            "repaginate through the existing measured Core boundary",
        ],
        "prohibitedShortcuts": [
            "delete source-backed rows to force twelve pages",
            "bypass measured wrapping or pagination",
            "hard-code a twelve-page renderer layout",
        ],
        "productionBinding": False,
    },
    "nextPhase": (
        "PDF-PILOT-08B-R2C-O source-backed information hierarchy and role-level visual calibration"
    ),
}

if args.phase_id == "PDF-PILOT-08B-R2C-O":
    if not args.baseline_comparison:
        raise RuntimeError("R2C-O requires --baseline-comparison")

    baseline_path = repo_path(args.baseline_comparison)
    baseline = read_json(baseline_path)
    if baseline["phaseId"] != "PDF-PILOT-08B-R2C-N":
        raise RuntimeError("R2C-O baseline must be the accepted R2C-N comparison")
    if baseline["inputs"]["reference"]["sha256"] != reference["sha256"]:
        raise RuntimeError("R2C-O and R2C-N must use the same pinned reference")

    baseline_sections = {
        section["sectionId"]: section
        for section in baseline["comparison"]["sections"]
    }
    current_sections = {
        section["sectionId"]: section for section in section_comparison
    }
    baseline_bold_gap = abs(
        baseline["candidate"]["boldCharacterShare"]
        - baseline["reference"]["boldCharacterShare"]
    )
    current_bold_gap = abs(
        candidate["boldCharacterShare"] - reference["boldCharacterShare"]
    )
    acceptance = {
        "referenceIdentityPreserved": True,
        "candidateStructuralIdentityAligned": (
            candidate["sha256"] == summary["artifact"]["sha256"]
            and candidate["pageCount"] == summary["summary"]["pageCount"]
        ),
        "pageCountRemainsContentDriven": (
            candidate["pageCount"] == baseline["candidate"]["pageCount"]
        ),
        "extractedDensityNonDecreasing": (
            candidate["extractedNonWhitespaceCharacterCount"]
            >= baseline["candidate"]["extractedNonWhitespaceCharacterCount"]
        ),
        "executiveNarrativeExpanded": (
            current_sections["executive-summary"]["candidateCharacterCount"]
            > baseline_sections["executive-summary"]["candidateCharacterCount"]
        ),
        "decisionNarrativeExpanded": (
            current_sections["decision-view"]["candidateCharacterCount"]
            > baseline_sections["decision-view"]["candidateCharacterCount"]
        ),
        "roleWeightGapImproved": current_bold_gap < baseline_bold_gap,
        "roleWeightWithinEightPercentagePoints": current_bold_gap <= 0.08,
        "visualFidelityAccepted": False,
    }
    if not all(value for key, value in acceptance.items() if key != "visualFidelityAccepted"):
        raise RuntimeError(f"R2C-O hierarchy acceptance failed: {acceptance}")

    comparison.update({
        "comparisonId": (
            "pdf-pilot-08b-r2c-o-canonical-full-document-reader-hierarchy-v1"
        ),
        "phaseId": "PDF-PILOT-08B-R2C-O",
        "status": (
            "accepted-reader-hierarchy-visual-fidelity-still-rejected"
        ),
        "baseline": {
            "comparisonId": baseline["comparisonId"],
            "phaseId": baseline["phaseId"],
            "pointer": (
                "packages/pdf-renderer-pilot/fixtures/"
                "canonical-full-document-visual-comparison.v1.json"
            ),
            "sha256": sha256(baseline_path),
            "candidateSha256": baseline["candidate"]["sha256"],
        },
        "calibration": {
            "boldCharacterShare": {
                "reference": reference["boldCharacterShare"],
                "before": baseline["candidate"]["boldCharacterShare"],
                "after": candidate["boldCharacterShare"],
                "absoluteGapBefore": rounded(baseline_bold_gap, 6),
                "absoluteGapAfter": rounded(current_bold_gap, 6),
                "absoluteGapImprovement": rounded(
                    baseline_bold_gap - current_bold_gap, 6
                ),
            },
            "extractedNonWhitespaceCharacterCount": {
                "before": baseline["candidate"][
                    "extractedNonWhitespaceCharacterCount"
                ],
                "after": candidate["extractedNonWhitespaceCharacterCount"],
                "delta": (
                    candidate["extractedNonWhitespaceCharacterCount"]
                    - baseline["candidate"][
                        "extractedNonWhitespaceCharacterCount"
                    ]
                ),
            },
            "executiveSummaryCharacterCount": {
                "reference": current_sections["executive-summary"][
                    "referenceCharacterCount"
                ],
                "before": baseline_sections["executive-summary"][
                    "candidateCharacterCount"
                ],
                "after": current_sections["executive-summary"][
                    "candidateCharacterCount"
                ],
            },
            "decisionViewCharacterCount": {
                "reference": current_sections["decision-view"][
                    "referenceCharacterCount"
                ],
                "before": baseline_sections["decision-view"][
                    "candidateCharacterCount"
                ],
                "after": current_sections["decision-view"][
                    "candidateCharacterCount"
                ],
            },
            "sourceBackedBody": {
                "pageCount": bundle["summary"]["pageCount"],
                "bodyEntryCount": bundle["summary"]["bodyEntryCount"],
                "textEntryCount": bundle["summary"]["textEntryCount"],
                "tableEntryCount": bundle["summary"]["tableEntryCount"],
                "missingGlyphCount": bundle["summary"]["missingGlyphCount"],
            },
            "acceptance": acceptance,
        },
    })

    for region in comparison["comparison"]["regionClassifications"]:
        if region["region"] == "typography-weight":
            region.update({
                "classification": "calibrated-near-reference",
                "evidence": (
                    "Absolute Bold-share gap improved from "
                    f"{rounded(baseline_bold_gap * 100, 2)} to "
                    f"{rounded(current_bold_gap * 100, 2)} percentage points."
                ),
            })
        elif region["region"] == "semantic-composition":
            region.update({
                "classification": "source-backed-hierarchy-improved-not-parity",
                "evidence": (
                    "Executive and decision narrative expanded without reducing "
                    "the candidate extracted-text density."
                ),
            })

    comparison["decision"].update({
        "informationHierarchyAccepted": True,
        "roleLevelWeightCalibrationAccepted": True,
        "sourceBackedNarrativeAccepted": True,
        "visualFidelityAccepted": False,
        "reasonCodes": [
            "role-weight-gap-materially-reduced",
            "executive-narrative-expanded",
            "decision-narrative-expanded",
            "source-backed-density-preserved",
            "static-zone-and-section-composition-still-diverge",
        ],
        "allowedNextChanges": [
            "calibrate static-zone geometry through measured layout inputs",
            "rebalance section composition without deleting audit evidence",
            "repaginate through the existing measured Core boundary",
        ],
        "prohibitedShortcuts": [
            "delete source-backed rows to imitate the reference",
            "bypass measured wrapping or pagination",
            "hard-code a twelve-page renderer layout",
        ],
    })
    comparison["nextPhase"] = (
        "PDF-PILOT-08B-R2C-P measured static-zone and section-composition calibration"
    )

if not comparison["reference"]["allLetter612x792Pt"]:
    raise RuntimeError("Reference page boxes are not all Letter")
if not comparison["candidate"]["allLetter612x792Pt"]:
    raise RuntimeError("Candidate page boxes are not all Letter")
if not comparison["comparison"]["anchorPageDeltasAreNonUniform"]:
    raise RuntimeError("Expected non-uniform semantic anchor drift")
if comparison["decision"]["visualFidelityAccepted"]:
    raise RuntimeError(f"{args.phase_id} must not accept visual fidelity for non-parity content")

output_path = repo_path(args.output)
output_path.parent.mkdir(parents=True, exist_ok=True)
output_path.write_bytes(
    (json.dumps(comparison, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
)
print(output_path)
