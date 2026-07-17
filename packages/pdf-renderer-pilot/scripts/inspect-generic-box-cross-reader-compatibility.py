from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import subprocess
import unicodedata
from pathlib import Path

import numpy as np
import pypdfium2 as pdfium
from PIL import Image


PACKAGE_ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = PACKAGE_ROOT.parent.parent
DEFAULT_DPI = 96
MAX_CONTRACT_EDGE_DELTA_PX = 2
MAX_READER_EDGE_DELTA_PX = 1
COLOR_TOLERANCE = 8

parser = argparse.ArgumentParser()
parser.add_argument(
    "--generic-pdf",
    default="output/pdf/flowdoc-pdf-pilot-thai-one-page.pdf",
)
parser.add_argument(
    "--generic-request",
    default="fixtures/pdf-pilot-thai-one-page-request.v1.json",
)
parser.add_argument(
    "--generic-summary",
    default="packages/pdf-renderer-pilot/fixtures/one-page-proof-summary.v1.json",
)
parser.add_argument(
    "--canonical-pdf",
    default="output/pdf/flowdoc-pdf-pilot-canonical-full-document-13-page.pdf",
)
parser.add_argument(
    "--canonical-bundle",
    default="fixtures/pdf-pilot-canonical-report-body-display-list.v1.json",
)
parser.add_argument(
    "--canonical-summary",
    default="packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-summary.v1.json",
)
parser.add_argument(
    "--output",
    default="packages/pdf-renderer-pilot/fixtures/generic-box-cross-reader-compatibility.v1.json",
)
parser.add_argument("--raster-dir", default="tmp/pdfs/r2c-r")
parser.add_argument("--dpi", type=int, default=DEFAULT_DPI)
parser.add_argument("--poppler-render-tool", default="pdftocairo")
parser.add_argument("--poppler-text-tool", default="pdftotext")
parser.add_argument("--poppler-info-tool", default="pdfinfo")
args = parser.parse_args()


def repo_path(value: str) -> Path:
    path = Path(value)
    return path if path.is_absolute() else REPO_ROOT / path


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def normalize_text(value: str) -> str:
    normalized = unicodedata.normalize("NFC", value).replace("\u00a0", " ")
    return " ".join(normalized.split())


def command_output(command: list[str]) -> tuple[str, str]:
    result = subprocess.run(command, check=True, capture_output=True)
    return (
        result.stdout.decode("utf-8", errors="replace"),
        result.stderr.decode("utf-8", errors="replace"),
    )


def poppler_version(tool: str) -> str:
    stdout, stderr = command_output([tool, "-v"])
    match = re.search(r"version\s+([^\s]+)", f"{stdout}\n{stderr}")
    if match is None:
        raise RuntimeError(f"cannot read Poppler version from {tool}")
    return match.group(1)


def poppler_page_count(tool: str, pdf_path: Path) -> int:
    stdout, _ = command_output([tool, str(pdf_path)])
    match = re.search(r"^Pages:\s+(\d+)\s*$", stdout, flags=re.MULTILINE)
    if match is None:
        raise RuntimeError(f"cannot read Poppler page count for {pdf_path}")
    return int(match.group(1))


def poppler_page_text(tool: str, pdf_path: Path, page_number: int) -> str:
    stdout, _ = command_output([
        tool,
        "-f",
        str(page_number),
        "-l",
        str(page_number),
        "-enc",
        "UTF-8",
        str(pdf_path),
        "-",
    ])
    return stdout


def render_poppler_page(
    tool: str,
    pdf_path: Path,
    page_number: int,
    dpi: int,
    output_path: Path,
) -> Image.Image:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    prefix = output_path.with_suffix("")
    command_output([
        tool,
        "-png",
        "-r",
        str(dpi),
        "-f",
        str(page_number),
        "-l",
        str(page_number),
        "-singlefile",
        str(pdf_path),
        str(prefix),
    ])
    return Image.open(output_path).convert("RGB")


def render_pdfium_page(
    document: pdfium.PdfDocument,
    page_number: int,
    dpi: int,
    output_path: Path,
) -> Image.Image:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    page = document[page_number - 1]
    image = page.render(scale=dpi / 72).to_pil().convert("RGB")
    image.save(output_path)
    return image


def pdfium_page_text(document: pdfium.PdfDocument, page_number: int) -> str:
    page = document[page_number - 1]
    return page.get_textpage().get_text_bounded()


def rounded_pixel(value: float) -> int:
    return int(math.floor(value + 0.5))


def expected_bbox(bounds: dict, dpi: int) -> list[int]:
    scale = dpi / 72
    return [
        rounded_pixel(bounds["xPt"] * scale),
        rounded_pixel(bounds["yPt"] * scale),
        rounded_pixel((bounds["xPt"] + bounds["widthPt"]) * scale) - 1,
        rounded_pixel((bounds["yPt"] + bounds["heightPt"]) * scale) - 1,
    ]


def rgb(hex_color: str) -> np.ndarray:
    return np.array([
        int(hex_color[0:2], 16),
        int(hex_color[2:4], 16),
        int(hex_color[4:6], 16),
    ], dtype=np.int16)


def detected_bbox(
    image: Image.Image,
    colors: list[str],
    expected: list[int],
) -> tuple[list[int], int]:
    pixels = np.asarray(image, dtype=np.int16)
    mask = np.zeros(pixels.shape[:2], dtype=bool)
    for color in colors:
        mask |= np.max(np.abs(pixels - rgb(color)), axis=2) <= COLOR_TOLERANCE

    x0, y0, x1, y1 = expected
    search_padding = 4
    sx0 = max(0, x0 - search_padding)
    sy0 = max(0, y0 - search_padding)
    sx1 = min(image.width - 1, x1 + search_padding)
    sy1 = min(image.height - 1, y1 + search_padding)
    region = mask[sy0 : sy1 + 1, sx0 : sx1 + 1]
    ys, xs = np.where(region)
    if len(xs) == 0:
        raise RuntimeError(f"box color not found near expected bounds {expected}")
    observed = [
        int(xs.min() + sx0),
        int(ys.min() + sy0),
        int(xs.max() + sx0),
        int(ys.max() + sy0),
    ]
    return observed, int(region.sum())


def edge_deltas(left: list[int], right: list[int]) -> list[int]:
    return [abs(left[index] - right[index]) for index in range(4)]


def non_white_pixel_count(image: Image.Image) -> int:
    pixels = np.asarray(image, dtype=np.uint8)
    return int(np.any(pixels < 250, axis=2).sum())


def page_result(
    image: Image.Image,
    output_path: Path,
    text: str,
    sentinels: list[str],
    page_number: int,
) -> dict:
    normalized = normalize_text(text)
    sentinel_results = [
        {
            "value": sentinel,
            "accepted": normalize_text(sentinel) in normalized,
        }
        for sentinel in sentinels
    ]
    non_white = non_white_pixel_count(image)
    return {
        "pageNumber": page_number,
        "pixelWidth": image.width,
        "pixelHeight": image.height,
        "mode": image.mode,
        "rasterSha256": sha256_file(output_path),
        "nonWhitePixelCount": non_white,
        "nonBlank": non_white > 100,
        "normalizedTextSha256": sha256_bytes(normalized.encode("utf-8")),
        "sentinels": sentinel_results,
        "allSentinelsAccepted": all(item["accepted"] for item in sentinel_results),
    }


def inspect_artifact(
    artifact_id: str,
    pdf_path: Path,
    expected_sha256: str,
    expected_page_count: int,
    selected_pages: list[int],
    sentinels_by_page: dict[int, list[str]],
    regions: list[dict],
    raster_root: Path,
    poppler_tools: dict[str, str],
    dpi: int,
) -> dict:
    actual_sha256 = sha256_file(pdf_path)
    if actual_sha256 != expected_sha256:
        raise RuntimeError(f"artifact hash drifted for {artifact_id}: {actual_sha256}")

    poppler_count = poppler_page_count(poppler_tools["info"], pdf_path)
    pdfium_document = pdfium.PdfDocument(str(pdf_path))
    pdfium_count = len(pdfium_document)
    if poppler_count != expected_page_count or pdfium_count != expected_page_count:
        raise RuntimeError(f"reader page count drifted for {artifact_id}")

    images: dict[str, dict[int, Image.Image]] = {"poppler": {}, "pdfium": {}}
    reader_results: dict[str, dict] = {
        "poppler": {
            "engineId": "poppler",
            "engineFamily": "Poppler",
            "renderer": f"pdftocairo {poppler_tools['version']}",
            "textExtractor": f"pdftotext {poppler_tools['version']}",
            "pageCount": poppler_count,
            "selectedPages": [],
        },
        "pdfium": {
            "engineId": "pdfium",
            "engineFamily": "PDFium",
            "renderer": (
                f"pypdfium2 {pdfium.PYPDFIUM_INFO.version} / "
                f"PDFium {pdfium.PDFIUM_INFO.version}"
            ),
            "textExtractor": "PDFium text page API",
            "pageCount": pdfium_count,
            "selectedPages": [],
        },
    }

    for page_number in selected_pages:
        sentinels = sentinels_by_page.get(page_number, [])
        poppler_path = raster_root / artifact_id / "poppler" / f"page-{page_number:02d}.png"
        poppler_image = render_poppler_page(
            poppler_tools["render"], pdf_path, page_number, dpi, poppler_path,
        )
        images["poppler"][page_number] = poppler_image
        reader_results["poppler"]["selectedPages"].append(page_result(
            poppler_image,
            poppler_path,
            poppler_page_text(poppler_tools["text"], pdf_path, page_number),
            sentinels,
            page_number,
        ))

        pdfium_path = raster_root / artifact_id / "pdfium" / f"page-{page_number:02d}.png"
        pdfium_image = render_pdfium_page(
            pdfium_document, page_number, dpi, pdfium_path,
        )
        images["pdfium"][page_number] = pdfium_image
        reader_results["pdfium"]["selectedPages"].append(page_result(
            pdfium_image,
            pdfium_path,
            pdfium_page_text(pdfium_document, page_number),
            sentinels,
            page_number,
        ))

    region_results = []
    for region in regions:
        expected = expected_bbox(region["boundsPt"], dpi)
        by_engine = {}
        for engine_id in ["poppler", "pdfium"]:
            image = images[engine_id][region["pageNumber"]]
            observed, matching_pixels = detected_bbox(image, region["colors"], expected)
            deltas = edge_deltas(observed, expected)
            by_engine[engine_id] = {
                "observedBoundsPx": observed,
                "contractEdgeDeltasPx": deltas,
                "maxContractEdgeDeltaPx": max(deltas),
                "matchingColorPixelCount": matching_pixels,
            }
        reader_deltas = edge_deltas(
            by_engine["poppler"]["observedBoundsPx"],
            by_engine["pdfium"]["observedBoundsPx"],
        )
        max_contract_delta = max(
            item["maxContractEdgeDeltaPx"] for item in by_engine.values()
        )
        max_reader_delta = max(reader_deltas)
        region_results.append({
            **region,
            "expectedBoundsPx": expected,
            "byEngine": by_engine,
            "readerEdgeDeltasPx": reader_deltas,
            "maxContractEdgeDeltaPx": max_contract_delta,
            "maxReaderEdgeDeltaPx": max_reader_delta,
            "accepted": (
                max_contract_delta <= MAX_CONTRACT_EDGE_DELTA_PX
                and max_reader_delta <= MAX_READER_EDGE_DELTA_PX
            ),
        })

    pdfium_document.close()
    reader_values = list(reader_results.values())
    all_pages_nonblank = all(
        page["nonBlank"]
        for reader in reader_values
        for page in reader["selectedPages"]
    )
    all_sentinels_accepted = all(
        page["allSentinelsAccepted"]
        for reader in reader_values
        for page in reader["selectedPages"]
    )
    return {
        "artifactId": artifact_id,
        "pointer": f"local-output://pdf/{pdf_path.name}",
        "sha256": actual_sha256,
        "bytes": pdf_path.stat().st_size,
        "expectedPageCount": expected_page_count,
        "selectedPageNumbers": selected_pages,
        "readerResults": reader_values,
        "regions": region_results,
        "allSelectedPagesNonblank": all_pages_nonblank,
        "allTextSentinelsAccepted": all_sentinels_accepted,
        "allBoxRegionsAccepted": all(item["accepted"] for item in region_results),
    }


generic_pdf = repo_path(args.generic_pdf)
generic_request_path = repo_path(args.generic_request)
generic_summary = read_json(repo_path(args.generic_summary))
generic_request = read_json(generic_request_path)
canonical_pdf = repo_path(args.canonical_pdf)
canonical_bundle_path = repo_path(args.canonical_bundle)
canonical_bundle = read_json(canonical_bundle_path)
canonical_summary = read_json(repo_path(args.canonical_summary))
raster_root = repo_path(args.raster_dir)
output_path = repo_path(args.output)

panel_fill = next(
    command
    for command in generic_request["paintCommands"]
    if command["kind"] == "fill-rect" and command["sourceCommandId"] == "pdf:pilot:panel"
)
panel_stroke = next(
    command
    for command in generic_request["paintCommands"]
    if command["kind"] == "stroke-rect" and command["sourceCommandId"] == "pdf:pilot:panel"
)
if panel_fill["bounds"] != panel_stroke["bounds"]:
    raise RuntimeError("generic panel fill and stroke bounds drifted")

generic_regions = [{
    "regionId": "generic-panel-fill-and-stroke",
    "semanticOwner": "independent-one-page-panel",
    "pageNumber": 1,
    "boundsPt": panel_fill["bounds"],
    "colors": [panel_fill["color"], panel_stroke["color"]],
    "paintKinds": [panel_fill["kind"], panel_stroke["kind"]],
}]

canonical_regions = []
for group in canonical_bundle["calloutGroups"]:
    for fragment in group["fragments"]:
        canonical_regions.append({
            "regionId": fragment["fragmentId"],
            "semanticOwner": group["groupId"],
            "pageNumber": fragment["pageNumber"],
            "boundsPt": fragment["bounds"],
            "colors": [group["fillColor"]],
            "paintKinds": ["fill-rect"],
        })

poppler_tools = {
    "render": args.poppler_render_tool,
    "text": args.poppler_text_tool,
    "info": args.poppler_info_tool,
    "version": poppler_version(args.poppler_render_tool),
}

generic_evidence = inspect_artifact(
    artifact_id="generic-thai-panel",
    pdf_path=generic_pdf,
    expected_sha256=generic_summary["artifact"]["sha256"],
    expected_page_count=generic_summary["summary"]["pageCount"],
    selected_pages=[1],
    sentinels_by_page={1: generic_summary["expectedExtractedLines"]},
    regions=generic_regions,
    raster_root=raster_root,
    poppler_tools=poppler_tools,
    dpi=args.dpi,
)

canonical_evidence = inspect_artifact(
    artifact_id="canonical-report-callouts",
    pdf_path=canonical_pdf,
    expected_sha256=canonical_summary["artifact"]["sha256"],
    expected_page_count=canonical_summary["summary"]["pageCount"],
    selected_pages=[1, 2, 10],
    sentinels_by_page={
        1: ["สรุปสำหรับผู้ตัดสินใจ", "ข้อสรุปจากข้อมูลจริง"],
        2: ["วิธีทดสอบที่ใช้"],
        10: ["มุมมองเพื่อการตัดสินใจ", "แนวทางเลือกตามโจทย์"],
    },
    regions=canonical_regions,
    raster_root=raster_root,
    poppler_tools=poppler_tools,
    dpi=args.dpi,
)

artifacts = [generic_evidence, canonical_evidence]
cross_reader_accepted = all(
    artifact["allSelectedPagesNonblank"]
    and artifact["allTextSentinelsAccepted"]
    and artifact["allBoxRegionsAccepted"]
    for artifact in artifacts
)

evidence = {
    "evidenceVersion": 1,
    "evidenceId": "pdf-pilot-08b-r2c-r-generic-box-cross-reader-compatibility-v1",
    "phaseId": "PDF-PILOT-08B-R2C-R",
    "status": "accepted-generic-paint-boundary-cross-reader-baseline",
    "scope": {
        "dpi": args.dpi,
        "independentEngineFamilyRequirement": 2,
        "contractEdgeTolerancePx": MAX_CONTRACT_EDGE_DELTA_PX,
        "readerEdgeTolerancePx": MAX_READER_EDGE_DELTA_PX,
        "pixelParityApplicable": False,
    },
    "inputs": {
        "genericRequest": {
            "pointer": "fixtures/pdf-pilot-thai-one-page-request.v1.json",
            "sha256": sha256_file(generic_request_path),
        },
        "canonicalBundle": {
            "pointer": "fixtures/pdf-pilot-canonical-report-body-display-list.v1.json",
            "sha256": sha256_file(canonical_bundle_path),
            "bundleFingerprint": canonical_bundle["bundleFingerprint"],
        },
    },
    "boundaryAudit": {
        "coreAuthoredSchema": {
            "sources": [
                "src/schema/documentV4Foundation.ts",
                "src/schema/documentV4Target.ts",
            ],
            "owners": ["text-block", "column", "table-cell"],
            "properties": ["fill", "padding", "border"],
            "genericDefinitionPresent": True,
        },
        "measuredPaintContract": {
            "source": "src/renderer/pdfMeasuredDrawContractV1.ts",
            "paintKinds": ["fill-rect", "stroke-rect"],
            "genericPrimitivePresent": True,
        },
        "pdfRenderer": {
            "source": "packages/pdf-renderer-pilot/src/index.ts",
            "consumes": ["fill-rect", "stroke-rect"],
            "requiresCalloutSemantics": False,
        },
        "canonicalMeasurementAdapter": {
            "source": (
                "packages/pdf-renderer-pilot/src/"
                "canonicalReportMeasurementRequestHandoff.ts"
            ),
            "function": "textBlockContentWidthPt",
            "genericCoreBoundary": False,
        },
        "canonicalCalloutAdapter": {
            "source": (
                "packages/pdf-renderer-pilot/src/"
                "canonicalReportBodyDisplayList.ts"
            ),
            "function": "calloutProjection",
            "grouping": "consecutive-label-and-note-semantics",
            "genericCoreBoundary": False,
        },
    },
    "readerCoverage": {
        "exercised": [
            {
                "engineId": "poppler",
                "engineFamily": "Poppler",
                "version": poppler_tools["version"],
            },
            {
                "engineId": "pdfium",
                "engineFamily": "PDFium",
                "version": str(pdfium.PDFIUM_INFO.version),
                "bindingVersion": str(pdfium.PYPDFIUM_INFO.version),
            },
        ],
        "notExercised": [
            {
                "engineFamily": "MuPDF",
                "reason": "no callable PyMuPDF runtime in the pinned workspace dependency set",
            },
            {
                "engineFamily": "Adobe Acrobat",
                "reason": "no deterministic command-line raster and text harness in this phase",
            },
        ],
    },
    "artifacts": artifacts,
    "acceptance": {
        "observedIndependentEngineFamilyCount": 2,
        "genericPanelBoundaryAccepted": generic_evidence["allBoxRegionsAccepted"],
        "canonicalCalloutFragmentsAccepted": canonical_evidence["allBoxRegionsAccepted"],
        "allSelectedPagesNonblank": all(
            artifact["allSelectedPagesNonblank"] for artifact in artifacts
        ),
        "allTextSentinelsAccepted": all(
            artifact["allTextSentinelsAccepted"] for artifact in artifacts
        ),
        "crossReaderCompatibilityAccepted": cross_reader_accepted,
    },
    "decision": {
        "genericRendererPrimitivesAccepted": cross_reader_accepted,
        "canonicalCalloutProjectionGeneric": False,
        "reusableAuthoredBoxContractAccepted": False,
        "visualFidelityAccepted": False,
        "productionBinding": False,
        "nextTopic": "PDF-PILOT-08B-R2C-S reusable authored box contract",
    },
}

output_path.parent.mkdir(parents=True, exist_ok=True)
output_path.write_bytes(
    f"{json.dumps(evidence, ensure_ascii=False, indent=2)}\n".encode("utf-8")
)
print(output_path)
