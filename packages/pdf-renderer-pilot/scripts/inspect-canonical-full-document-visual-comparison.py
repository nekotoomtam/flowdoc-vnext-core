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
    choices=[
        "PDF-PILOT-08B-R2C-N",
        "PDF-PILOT-08B-R2C-O",
        "PDF-PILOT-08B-R2C-P",
        "PDF-PILOT-08B-R2C-Q",
    ],
    default="PDF-PILOT-08B-R2C-O",
)
parser.add_argument(
    "--baseline-comparison",
    default="",
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
    wide_filled_rectangles = []

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
            for rectangle in page.rects:
                color = rectangle.get("non_stroking_color")
                if (
                    rectangle.get("fill")
                    and float(rectangle.get("width", 0.0)) >= 400.0
                    and float(rectangle.get("height", 0.0)) >= 15.0
                    and isinstance(color, (list, tuple))
                    and len(color) == 3
                    and not all(float(channel) >= 0.999 for channel in color)
                ):
                    wide_filled_rectangles.append({
                        "pageNumber": page_number,
                        "x0Pt": rounded(rectangle["x0"], 6),
                        "topPt": rounded(rectangle["top"], 6),
                        "x1Pt": rounded(rectangle["x1"], 6),
                        "bottomPt": rounded(rectangle["bottom"], 6),
                        "widthPt": rounded(rectangle["width"], 6),
                        "heightPt": rounded(rectangle["height"], 6),
                        "fillRgb": [rounded(channel, 6) for channel in color],
                    })
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
            "wideFilledRectangles": wide_filled_rectangles,
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
body_commands = [
    command
    for page in bundle["rendererHandoff"]["measuredDrawContract"]["pages"]
    for command in page["commands"]
    if "canonical-body" in command["sourceCommandId"]
]
body_command_left = min(float(command["bounds"]["xPt"]) for command in body_commands)
body_command_right = max(
    float(command["bounds"]["xPt"]) + float(command["bounds"]["widthPt"])
    for command in body_commands
)

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
    baseline_path = repo_path(
        args.baseline_comparison
        or (
            "packages/pdf-renderer-pilot/fixtures/"
            "canonical-full-document-visual-comparison.v1.json"
        )
    )
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

if args.phase_id == "PDF-PILOT-08B-R2C-P":
    baseline_path = repo_path(
        args.baseline_comparison
        or (
            "packages/pdf-renderer-pilot/fixtures/"
            "canonical-full-document-reader-hierarchy.v1.json"
        )
    )
    baseline = read_json(baseline_path)
    if baseline["phaseId"] != "PDF-PILOT-08B-R2C-O":
        raise RuntimeError("R2C-P baseline must be the accepted R2C-O comparison")
    if baseline["inputs"]["reference"]["sha256"] != reference["sha256"]:
        raise RuntimeError("R2C-P and R2C-O must use the same pinned reference")

    reference_static = reference["observedStaticEnvelope"]
    baseline_static = baseline["candidate"]["observedStaticEnvelope"]
    current_static = candidate["observedStaticEnvelope"]
    reference_body = reference["observedBodyBounds"]
    baseline_body = baseline["candidate"]["observedBodyBounds"]
    current_body = candidate["observedBodyBounds"]

    def absolute_gap(subject: dict, target: dict, key: str) -> float:
        return abs(float(subject[key]) - float(target[key]))

    static_top_gap_before = absolute_gap(baseline_static, reference_static, "topPt")
    static_top_gap_after = absolute_gap(current_static, reference_static, "topPt")
    static_bottom_gap_before = absolute_gap(
        baseline_static, reference_static, "bottomPt"
    )
    static_bottom_gap_after = absolute_gap(
        current_static, reference_static, "bottomPt"
    )
    body_left_gap_before = absolute_gap(baseline_body, reference_body, "x0Pt")
    body_left_gap_after = absolute_gap(current_body, reference_body, "x0Pt")
    body_top_gap_before = absolute_gap(baseline_body, reference_body, "topPt")
    body_top_gap_after = absolute_gap(current_body, reference_body, "topPt")
    body_frame_left = float(candidate_geometry["bodyOriginXPt"])
    body_frame_right = body_frame_left + float(candidate_geometry["bodyWidthPt"])

    category_counts = Counter(
        item["category"] for item in capacity["spacedBodyItems"]
    )
    spacing_rules = {
        rule["ruleId"]: rule for rule in capacity["spacingProfile"]["rules"]
    }
    semantic_rule_ids = [
        "body-to-reader-label",
        "reader-label-to-summary",
        "reader-summary-stack",
        "reader-summary-to-body",
    ]
    semantic_rules = [spacing_rules[rule_id] for rule_id in semantic_rule_ids]

    acceptance = {
        "referenceIdentityPreserved": True,
        "baselineHierarchyAccepted": baseline["decision"][
            "informationHierarchyAccepted"
        ],
        "candidateStructuralIdentityAligned": (
            candidate["sha256"] == summary["artifact"]["sha256"]
            and candidate["pageCount"] == summary["summary"]["pageCount"]
            and bundle["bundleFingerprint"] == summary["sourceBundleFingerprint"]
        ),
        "pageCountRemainsContentDriven": (
            candidate["pageCount"] == baseline["candidate"]["pageCount"]
        ),
        "extractedDensityNonDecreasing": (
            candidate["extractedNonWhitespaceCharacterCount"]
            >= baseline["candidate"]["extractedNonWhitespaceCharacterCount"]
        ),
        "staticTopGapImproved": static_top_gap_after < static_top_gap_before,
        "staticTopWithinOnePoint": static_top_gap_after <= 1.0,
        "staticBottomGapImproved": (
            static_bottom_gap_after < static_bottom_gap_before
        ),
        "staticBottomWithinOnePoint": static_bottom_gap_after <= 1.0,
        "bodyLeftGapImproved": body_left_gap_after < body_left_gap_before,
        "bodyLeftWithinOneTenthPoint": body_left_gap_after <= 0.1,
        "bodyTopGapImproved": body_top_gap_after < body_top_gap_before,
        "bodyTopWithinTwoPoints": body_top_gap_after <= 2.0,
        "bodyCommandsStayInsideCalibratedWidth": (
            body_command_left >= body_frame_left - 0.001
            and body_command_right <= body_frame_right + 0.001
        ),
        "readerRoleBindingsPresent": (
            category_counts["reader-label"] == 2
            and category_counts["reader-summary"] == 10
        ),
        "semanticSpacingRulesPresent": len(semantic_rules) == 4,
        "visualFidelityAccepted": False,
    }
    if not all(
        value for key, value in acceptance.items() if key != "visualFidelityAccepted"
    ):
        raise RuntimeError(f"R2C-P calibration acceptance failed: {acceptance}")

    comparison.update({
        "comparisonId": (
            "pdf-pilot-08b-r2c-p-canonical-full-document-static-section-calibration-v1"
        ),
        "phaseId": "PDF-PILOT-08B-R2C-P",
        "status": (
            "accepted-static-section-calibration-visual-fidelity-still-rejected"
        ),
        "baseline": {
            "comparisonId": baseline["comparisonId"],
            "phaseId": baseline["phaseId"],
            "pointer": (
                "packages/pdf-renderer-pilot/fixtures/"
                "canonical-full-document-reader-hierarchy.v1.json"
            ),
            "sha256": sha256(baseline_path),
            "candidateSha256": baseline["candidate"]["sha256"],
        },
        "calibration": {
            "pageFramePt": {
                "margin": capacity["sectionCapacities"][0]["marginPt"],
                "headerReservedPt": capacity["sectionCapacities"][0][
                    "headerReservedPt"
                ],
                "footerReservedPt": capacity["sectionCapacities"][0][
                    "footerReservedPt"
                ],
                "body": candidate_geometry,
            },
            "staticEnvelopeGapsPt": {
                "top": {
                    "before": rounded(static_top_gap_before, 2),
                    "after": rounded(static_top_gap_after, 2),
                },
                "bottom": {
                    "before": rounded(static_bottom_gap_before, 2),
                    "after": rounded(static_bottom_gap_after, 2),
                },
            },
            "observedBodyGapsPt": {
                "left": {
                    "before": rounded(body_left_gap_before, 2),
                    "after": rounded(body_left_gap_after, 2),
                },
                "top": {
                    "before": rounded(body_top_gap_before, 2),
                    "after": rounded(body_top_gap_after, 2),
                },
            },
            "bodyCommandEnvelopePt": {
                "left": rounded(body_command_left, 6),
                "right": rounded(body_command_right, 6),
                "calibratedLeft": rounded(body_frame_left, 6),
                "calibratedRight": rounded(body_frame_right, 6),
                "horizontalOverflowPt": rounded(
                    max(0.0, body_command_right - body_frame_right), 6
                ),
            },
            "semanticComposition": {
                "spacingProfileId": capacity["spacingProfile"]["profileId"],
                "readerLabelCount": category_counts["reader-label"],
                "readerSummaryCount": category_counts["reader-summary"],
                "rules": semantic_rules,
            },
            "sourceBackedBody": {
                "pageCount": bundle["summary"]["pageCount"],
                "bodyEntryCount": bundle["summary"]["bodyEntryCount"],
                "sourceBodyPlacementCount": bundle["summary"][
                    "sourceBodyPlacementCount"
                ],
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
                    "The accepted R2C-O role-weight calibration remains within "
                    "eight percentage points of the reference Bold share."
                ),
            })
        elif region["region"] == "static-zones":
            region.update({
                "classification": "calibrated-near-reference",
                "evidence": (
                    "Header ink matches the reference top and footer ink is within "
                    f"{rounded(static_bottom_gap_after, 2)}pt of its bottom envelope."
                ),
            })
        elif region["region"] == "semantic-composition":
            region.update({
                "classification": "semantic-boundaries-calibrated-not-parity",
                "evidence": (
                    "Reader labels and summaries use explicit semantic roles and "
                    "measured adjacency spacing while source-backed section density differs."
                ),
            })
        elif region["region"] == "pagination":
            region.update({
                "classification": "content-driven-extra-page",
                "evidence": (
                    f"The final {rounded(terminal_span, 0)}pt table continuation is "
                    "retained on page 13."
                ),
            })

    comparison["decision"].update({
        "measuredStaticZoneCalibrationAccepted": True,
        "semanticSectionCompositionAccepted": True,
        "bodyWidthBoundaryAccepted": True,
        "informationHierarchyAccepted": True,
        "visualFidelityAccepted": False,
        "reasonCodes": [
            "static-envelope-aligned-to-pinned-reference",
            "body-frame-aligned-through-measured-layout-inputs",
            "reader-summary-boundaries-use-semantic-spacing",
            "source-backed-density-preserved",
            "callout-treatment-and-region-parity-remain-open",
        ],
        "allowedNextChanges": [
            "calibrate reader-summary callout treatment through document semantics",
            "define region-aware visual thresholds without pixel-parity claims",
            "repaginate through the existing measured Core boundary",
        ],
        "prohibitedShortcuts": [
            "translate rendered commands after layout",
            "delete source-backed rows to imitate the reference",
            "hard-code a twelve-page renderer layout",
        ],
    })
    comparison["nextPhase"] = (
        "PDF-PILOT-08B-R2C-Q measured callout treatment and region-aware visual thresholds"
    )

if args.phase_id == "PDF-PILOT-08B-R2C-Q":
    baseline_path = repo_path(
        args.baseline_comparison
        or (
            "packages/pdf-renderer-pilot/fixtures/"
            "canonical-full-document-static-section-calibration.v1.json"
        )
    )
    baseline = read_json(baseline_path)
    if baseline["phaseId"] != "PDF-PILOT-08B-R2C-P":
        raise RuntimeError("R2C-Q baseline must be the accepted R2C-P calibration")
    if baseline["inputs"]["reference"]["sha256"] != reference["sha256"]:
        raise RuntimeError("R2C-Q and R2C-P must use the same pinned reference")

    expected_fill = [234 / 255, 241 / 255, 1.0]

    def color_gap(rectangle: dict) -> float:
        return max(
            abs(float(actual) - expected)
            for actual, expected in zip(rectangle["fillRgb"], expected_fill)
        )

    reference_callout_rectangles = [
        rectangle
        for rectangle in reference["wideFilledRectangles"]
        if float(rectangle["widthPt"]) >= 460.0 and color_gap(rectangle) <= 0.001
    ]
    candidate_callout_rectangles = [
        rectangle
        for rectangle in candidate["wideFilledRectangles"]
        if float(rectangle["widthPt"]) >= 460.0 and color_gap(rectangle) <= 0.001
    ]
    if not reference_callout_rectangles or not candidate_callout_rectangles:
        raise RuntimeError("R2C-Q requires rendered blue callout rectangles")

    contract_commands = [
        command
        for page in bundle["rendererHandoff"]["measuredDrawContract"]["pages"]
        for command in page["commands"]
    ]
    command_by_id = {command["id"]: command for command in contract_commands}
    entry_by_root = {entry["rootNodeId"]: entry for entry in bundle["entries"]}
    group_metrics = []
    for group in bundle["calloutGroups"]:
        node_ids = [group["labelNodeId"], *group["summaryNodeIds"]]
        paint_ids = {
            paint_id
            for node_id in node_ids
            for paint_id in entry_by_root[node_id]["paintCommandIds"]
        }
        text_commands = [
            command_by_id[paint_id]
            for paint_id in paint_ids
            if command_by_id[paint_id]["kind"] == "glyph-run"
        ]
        page_insets = []
        for fragment in group["fragments"]:
            page_text = [
                command
                for command in text_commands
                if command["pageIndex"] == fragment["pageIndex"]
            ]
            if not page_text:
                raise RuntimeError(
                    f"R2C-Q callout fragment has no measured text: {fragment['fragmentId']}"
                )
            page_insets.append(rounded(
                min(float(command["bounds"]["xPt"]) for command in page_text)
                - float(fragment["bounds"]["xPt"]),
                6,
            ))
        group_metrics.append({
            "groupId": group["groupId"],
            "sourceFieldBindingCount": len(group["sourceFieldBindingInlineIds"]),
            "fragmentCount": len(group["fragments"]),
            "pageNumbers": [fragment["pageNumber"] for fragment in group["fragments"]],
            "paddingPt": group["paddingPt"],
            "measuredTextLeftInsetsPt": page_insets,
        })

    rendered_geometry_matches_contract = True
    for group in bundle["calloutGroups"]:
        for fragment in group["fragments"]:
            matches = [
                rectangle
                for rectangle in candidate_callout_rectangles
                if rectangle["pageNumber"] == fragment["pageNumber"]
            ]
            if len(matches) != 1:
                rendered_geometry_matches_contract = False
                continue
            rectangle = matches[0]
            bounds = fragment["bounds"]
            rendered_geometry_matches_contract = (
                rendered_geometry_matches_contract
                and abs(float(rectangle["x0Pt"]) - float(bounds["xPt"])) <= 0.001
                and abs(float(rectangle["topPt"]) - float(bounds["yPt"])) <= 0.001
                and abs(float(rectangle["widthPt"]) - float(bounds["widthPt"])) <= 0.001
                and abs(
                    float(rectangle["heightPt"]) - float(bounds["heightPt"])
                ) <= 0.001
            )

    reference_width = mean(
        float(rectangle["widthPt"]) for rectangle in reference_callout_rectangles
    )
    candidate_width = mean(
        float(rectangle["widthPt"]) for rectangle in candidate_callout_rectangles
    )
    reference_left = mean(
        float(rectangle["x0Pt"]) for rectangle in reference_callout_rectangles
    )
    candidate_left = mean(
        float(rectangle["x0Pt"]) for rectangle in candidate_callout_rectangles
    )
    reference_right = mean(
        float(rectangle["x1Pt"]) for rectangle in reference_callout_rectangles
    )
    candidate_right = mean(
        float(rectangle["x1Pt"]) for rectangle in candidate_callout_rectangles
    )
    measured_insets = [
        inset
        for group in group_metrics
        for inset in group["measuredTextLeftInsetsPt"]
    ]
    reference_inset_pt = 9.0

    reference_static = reference["observedStaticEnvelope"]
    current_static = candidate["observedStaticEnvelope"]
    reference_body = reference["observedBodyBounds"]
    current_body = candidate["observedBodyBounds"]
    body_frame_left = float(candidate_geometry["bodyOriginXPt"])
    body_frame_right = body_frame_left + float(candidate_geometry["bodyWidthPt"])
    role_weight_gap = abs(
        candidate["boldCharacterShare"] - reference["boldCharacterShare"]
    )

    callout_thresholds = {
        "semanticGroupCount": 2,
        "renderedFragmentCount": 3,
        "sourceFieldBindingCount": 22,
        "maximumFillChannelGap": 0.001,
        "maximumWidthGapPt": 0.25,
        "maximumLeftEdgeGapPt": 3.1,
        "maximumRightEdgeGapPt": 3.1,
        "maximumTextInsetGapPt": 0.1,
        "authoredHorizontalPaddingPt": 9.0,
        "authoredVerticalPaddingPt": 7.0,
    }
    callout_observed = {
        "referenceSemanticGroupProxyCount": len(reference_callout_rectangles),
        "candidateSemanticGroupCount": bundle["summary"]["calloutGroupCount"],
        "candidateRenderedFragmentCount": bundle["summary"]["calloutFragmentCount"],
        "candidateSourceFieldBindingCount": bundle["summary"][
            "calloutSourceFieldBindingCount"
        ],
        "referenceOuterWidthPt": rounded(reference_width, 6),
        "candidateOuterWidthPt": rounded(candidate_width, 6),
        "outerWidthGapPt": rounded(abs(candidate_width - reference_width), 6),
        "leftEdgeGapPt": rounded(abs(candidate_left - reference_left), 6),
        "rightEdgeGapPt": rounded(abs(candidate_right - reference_right), 6),
        "referenceTextLeftInsetPt": reference_inset_pt,
        "candidateMeasuredTextLeftInsetsPt": measured_insets,
        "maximumTextInsetGapPt": rounded(
            max(abs(inset - reference_inset_pt) for inset in measured_insets), 6
        ),
        "referenceMaximumFillChannelGap": rounded(
            max(color_gap(rectangle) for rectangle in reference_callout_rectangles),
            6,
        ),
        "candidateMaximumFillChannelGap": rounded(
            max(color_gap(rectangle) for rectangle in candidate_callout_rectangles),
            6,
        ),
        "renderedGeometryMatchesMeasuredContract": rendered_geometry_matches_contract,
        "groups": group_metrics,
    }
    callout_accepted = (
        callout_observed["referenceSemanticGroupProxyCount"]
        == callout_thresholds["semanticGroupCount"]
        and callout_observed["candidateSemanticGroupCount"]
        == callout_thresholds["semanticGroupCount"]
        and callout_observed["candidateRenderedFragmentCount"]
        == callout_thresholds["renderedFragmentCount"]
        and callout_observed["candidateSourceFieldBindingCount"]
        == callout_thresholds["sourceFieldBindingCount"]
        and callout_observed["referenceMaximumFillChannelGap"]
        <= callout_thresholds["maximumFillChannelGap"]
        and callout_observed["candidateMaximumFillChannelGap"]
        <= callout_thresholds["maximumFillChannelGap"]
        and callout_observed["outerWidthGapPt"]
        <= callout_thresholds["maximumWidthGapPt"]
        and callout_observed["leftEdgeGapPt"]
        <= callout_thresholds["maximumLeftEdgeGapPt"]
        and callout_observed["rightEdgeGapPt"]
        <= callout_thresholds["maximumRightEdgeGapPt"]
        and callout_observed["maximumTextInsetGapPt"]
        <= callout_thresholds["maximumTextInsetGapPt"]
        and all(
            group["paddingPt"] == {"top": 7, "right": 9, "bottom": 7, "left": 9}
            for group in bundle["calloutGroups"]
        )
        and rendered_geometry_matches_contract
    )

    region_thresholds = [
        {
            "region": "page-box",
            "thresholds": {"requiredSizePt": [612.0, 792.0]},
            "observed": {
                "referenceAllLetter": reference["allLetter612x792Pt"],
                "candidateAllLetter": candidate["allLetter612x792Pt"],
            },
            "accepted": (
                reference["allLetter612x792Pt"]
                and candidate["allLetter612x792Pt"]
            ),
        },
        {
            "region": "static-zones",
            "thresholds": {"maximumTopGapPt": 1.0, "maximumBottomGapPt": 1.0},
            "observed": {
                "topGapPt": rounded(
                    abs(current_static["topPt"] - reference_static["topPt"]), 6
                ),
                "bottomGapPt": rounded(
                    abs(current_static["bottomPt"] - reference_static["bottomPt"]),
                    6,
                ),
            },
            "accepted": (
                abs(current_static["topPt"] - reference_static["topPt"]) <= 1.0
                and abs(current_static["bottomPt"] - reference_static["bottomPt"])
                <= 1.0
            ),
        },
        {
            "region": "body-frame",
            "thresholds": {
                "maximumObservedLeftGapPt": 0.1,
                "maximumObservedTopGapPt": 2.0,
                "maximumCommandOverflowPt": 0.001,
            },
            "observed": {
                "leftGapPt": rounded(
                    abs(current_body["x0Pt"] - reference_body["x0Pt"]), 6
                ),
                "topGapPt": rounded(
                    abs(current_body["topPt"] - reference_body["topPt"]), 6
                ),
                "leftCommandOverflowPt": rounded(
                    max(0.0, body_frame_left - body_command_left), 6
                ),
                "rightCommandOverflowPt": rounded(
                    max(0.0, body_command_right - body_frame_right), 6
                ),
            },
            "accepted": (
                abs(current_body["x0Pt"] - reference_body["x0Pt"]) <= 0.1
                and abs(current_body["topPt"] - reference_body["topPt"]) <= 2.0
                and body_command_left >= body_frame_left - 0.001
                and body_command_right <= body_frame_right + 0.001
            ),
        },
        {
            "region": "typography",
            "thresholds": {
                "maximumDominantScaleGapPt": 0.1,
                "maximumBoldShareGap": 0.08,
            },
            "observed": {
                "dominantScaleGapPt": rounded(
                    abs(candidate["dominantFontSizePt"] - reference["dominantFontSizePt"]),
                    6,
                ),
                "boldShareGap": rounded(role_weight_gap, 6),
            },
            "accepted": (
                abs(candidate["dominantFontSizePt"] - reference["dominantFontSizePt"])
                <= 0.1
                and role_weight_gap <= 0.08
            ),
        },
        {
            "region": "callout-treatment",
            "thresholds": callout_thresholds,
            "observed": callout_observed,
            "accepted": callout_accepted,
        },
        {
            "region": "source-density",
            "thresholds": {
                "minimumBaselineRetentionRatio": 1.0,
                "requiredPageCountPolicy": "content-driven",
            },
            "observed": {
                "baselineCharacterCount": baseline["candidate"][
                    "extractedNonWhitespaceCharacterCount"
                ],
                "candidateCharacterCount": candidate[
                    "extractedNonWhitespaceCharacterCount"
                ],
                "baselinePageCount": baseline["candidate"]["pageCount"],
                "candidatePageCount": candidate["pageCount"],
            },
            "accepted": (
                candidate["extractedNonWhitespaceCharacterCount"]
                >= baseline["candidate"]["extractedNonWhitespaceCharacterCount"]
                and candidate["pageCount"] == baseline["candidate"]["pageCount"]
            ),
        },
    ]
    all_region_thresholds_accepted = all(
        region["accepted"] for region in region_thresholds
    )
    acceptance = {
        "referenceIdentityPreserved": True,
        "baselineStaticSectionCalibrationAccepted": (
            baseline["decision"]["measuredStaticZoneCalibrationAccepted"]
            and baseline["decision"]["semanticSectionCompositionAccepted"]
        ),
        "candidateStructuralIdentityAligned": (
            candidate["sha256"] == summary["artifact"]["sha256"]
            and bundle["bundleFingerprint"] == summary["sourceBundleFingerprint"]
        ),
        "regionThresholdsAccepted": all_region_thresholds_accepted,
        "measuredCalloutTreatmentAccepted": callout_accepted,
        "sourceFieldBindingsPreserved": (
            bundle["summary"]["calloutSourceFieldBindingCount"] == 22
        ),
        "missingGlyphCountIsZero": bundle["summary"]["missingGlyphCount"] == 0,
        "visualFidelityAccepted": False,
    }
    if not all(
        value for key, value in acceptance.items() if key != "visualFidelityAccepted"
    ):
        region_status = {
            region["region"]: region["accepted"] for region in region_thresholds
        }
        rejected_regions = [
            region for region in region_thresholds if not region["accepted"]
        ]
        raise RuntimeError(
            f"R2C-Q region-aware acceptance failed: {acceptance}; "
            f"regions={region_status}; rejected={rejected_regions}"
        )

    comparison.update({
        "comparisonId": (
            "pdf-pilot-08b-r2c-q-canonical-full-document-callout-regions-v1"
        ),
        "phaseId": "PDF-PILOT-08B-R2C-Q",
        "status": (
            "accepted-callout-region-thresholds-visual-fidelity-still-rejected"
        ),
        "baseline": {
            "comparisonId": baseline["comparisonId"],
            "phaseId": baseline["phaseId"],
            "pointer": (
                "packages/pdf-renderer-pilot/fixtures/"
                "canonical-full-document-static-section-calibration.v1.json"
            ),
            "sha256": sha256(baseline_path),
            "candidateSha256": baseline["candidate"]["sha256"],
        },
        "calibration": {
            "calloutTreatment": callout_observed,
            "regionThresholdContract": {
                "contractId": (
                    "pdf-pilot-08b-r2c-q-region-aware-visual-thresholds-v1"
                ),
                "comparisonModel": "region-aware-non-pixel-parity",
                "regions": region_thresholds,
                "allRegionThresholdsAccepted": all_region_thresholds_accepted,
            },
            "acceptance": acceptance,
        },
    })

    for region in comparison["comparison"]["regionClassifications"]:
        if region["region"] == "semantic-composition":
            region.update({
                "classification": "source-backed-callouts-accepted-not-parity",
                "evidence": (
                    "Two authored semantic groups preserve 22 source field bindings "
                    "and project to three measured page fragments."
                ),
            })
    comparison["comparison"]["regionClassifications"].append({
        "region": "callout-treatment",
        "classification": "calibrated-near-reference",
        "evidence": (
            "Rendered EAF1FF groups match the authored 9pt horizontal and 7pt "
            "vertical padding; outer width differs from the reference by "
            f"{callout_observed['outerWidthGapPt']}pt."
        ),
    })
    comparison["comparison"]["regionThresholdContract"] = comparison[
        "calibration"
    ]["regionThresholdContract"]
    comparison["decision"].update({
        "measuredCalloutTreatmentAccepted": True,
        "regionAwareVisualThresholdsAccepted": True,
        "sourceFieldLineagePreserved": True,
        "measuredStaticZoneCalibrationAccepted": True,
        "semanticSectionCompositionAccepted": True,
        "informationHierarchyAccepted": True,
        "visualFidelityAccepted": False,
        "pixelParityApplicable": False,
        "reasonCodes": [
            "authored-box-style-drives-measured-text-width",
            "callout-fragments-follow-authoritative-pagination",
            "twenty-two-source-field-bindings-preserved",
            "all-region-thresholds-accepted",
            "source-backed-content-still-precludes-page-parity",
        ],
        "allowedNextChanges": [
            "audit generic box treatment outside the canonical pilot",
            "validate PDF behavior across independent readers",
            "retain region-specific thresholds for later fidelity work",
        ],
        "prohibitedShortcuts": [
            "paint callout rectangles without measured semantic ownership",
            "collapse region thresholds into an unsupported pixel-parity score",
            "delete source-backed rows to imitate the reference",
        ],
    })
    comparison["nextPhase"] = (
        "PDF-PILOT-08B-R2C-R generic box-boundary and cross-reader compatibility audit"
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
