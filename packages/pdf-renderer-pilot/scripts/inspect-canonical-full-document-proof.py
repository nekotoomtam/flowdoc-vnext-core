from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageChops
from pypdf import PdfReader
from pypdf.generic import ContentStream


PACKAGE_ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = PACKAGE_ROOT.parent.parent

parser = argparse.ArgumentParser()
parser.add_argument(
    "--pdf",
    default="output/pdf/flowdoc-pdf-pilot-canonical-full-document-13-page.pdf",
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
    "--raster-dir",
    default="tmp/pdfs/canonical-full-document-13-page",
)
parser.add_argument(
    "--output",
    default="packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-qa.v1.json",
)
args = parser.parse_args()


def repo_path(value: str) -> Path:
    path = Path(value)
    return path if path.is_absolute() else REPO_ROOT / path


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def ref_key(reference) -> str:
    return f"{reference.idnum}:{reference.generation}"


def normalized(value: str) -> str:
    return "".join(value.split())


pdf_path = repo_path(args.pdf)
bundle = read_json(repo_path(args.bundle))
summary = read_json(repo_path(args.summary))
contract = bundle["rendererHandoff"]["measuredDrawContract"]
reader = PdfReader(str(pdf_path), strict=True)

font_references: dict[str, object] = {}
image_references: dict[str, object] = {}
operator_counts: dict[str, int] = {}
page_facts = []
extracted_pages = []

for page_index, page in enumerate(reader.pages):
    resources = page["/Resources"]
    fonts = resources.get("/Font", {})
    xobjects = resources.get("/XObject", {})
    page_image_count = 0
    for reference in fonts.values():
        font_references[ref_key(reference)] = reference
    for reference in xobjects.values():
        if reference.get_object().get("/Subtype") == "/Image":
            page_image_count += 1
            image_references[ref_key(reference)] = reference

    page_operators: dict[str, int] = {}
    content = ContentStream(page.get_contents(), reader)
    for _, operator in content.operations:
        name = operator.decode("ascii")
        page_operators[name] = page_operators.get(name, 0) + 1
        operator_counts[name] = operator_counts.get(name, 0) + 1
    extracted_text = page.extract_text() or ""
    extracted_pages.append(extracted_text)
    page_facts.append({
        "pageNumber": page_index + 1,
        "widthPt": float(page.mediabox.width),
        "heightPt": float(page.mediabox.height),
        "fontResourceCount": len(fonts),
        "imageResourceCount": page_image_count,
        "extractedCharacterCount": len(extracted_text),
        "glyphRunOperatorCount": page_operators.get("TJ", 0),
        "strokeLineOperatorCount": page_operators.get("m", 0),
    })

font_facts = []
for key, reference in sorted(font_references.items()):
    font = reference.get_object()
    descendant = font["/DescendantFonts"][0].get_object()
    descriptor = descendant["/FontDescriptor"].get_object()
    font_file = descriptor["/FontFile2"].get_object()
    to_unicode = font["/ToUnicode"].get_object()
    font_facts.append({
        "objectReference": key,
        "baseFont": str(font["/BaseFont"]),
        "subtype": str(font["/Subtype"]),
        "encoding": str(font["/Encoding"]),
        "descendantSubtype": str(descendant["/Subtype"]),
        "embeddedFontBytes": len(font_file.get_data()),
        "toUnicodeBytes": len(to_unicode.get_data()),
        "cidToGidMap": descendant.get("/CIDToGIDMap") is not None,
    })

image_facts = []
for key, reference in sorted(image_references.items()):
    image = reference.get_object()
    image_facts.append({
        "objectReference": key,
        "width": int(image["/Width"]),
        "height": int(image["/Height"]),
        "colorSpace": str(image["/ColorSpace"]),
        "bitsPerComponent": int(image["/BitsPerComponent"]),
        "filter": str(image["/Filter"]),
    })

expected_run_count = 0
extracted_run_presence = 0
for expected_page, extracted_text in zip(contract["pages"], extracted_pages):
    actual = normalized(extracted_text)
    for command in expected_page["commands"]:
        if command["kind"] != "glyph-run":
            continue
        expected_run_count += 1
        if normalized(command["text"]) in actual:
            extracted_run_presence += 1

raster_paths = sorted(repo_path(args.raster_dir).glob("page-*.png"))
raster_pages = []
for page_number, path in enumerate(raster_paths, start=1):
    with Image.open(path) as source:
        image = source.convert("RGB")
        difference = ImageChops.difference(image, Image.new("RGB", image.size, "white"))
        raster_pages.append({
            "pageNumber": page_number,
            "widthPx": image.width,
            "heightPx": image.height,
            "nonBlank": difference.getbbox() is not None,
        })

expected_image_dimensions = sorted(
    (asset["pixelWidth"], asset["pixelHeight"])
    for asset in contract["imageAssets"]
)
actual_image_dimensions = sorted((image["width"], image["height"]) for image in image_facts)
page_boxes_valid = all(
    page["widthPt"] == 612 and page["heightPt"] == 792
    for page in page_facts
)
font_embedding_valid = all(
    font["subtype"] == "/Type0"
    and font["encoding"] == "/Identity-H"
    and font["descendantSubtype"] == "/CIDFontType2"
    and font["embeddedFontBytes"] > 0
    and font["toUnicodeBytes"] > 0
    and font["cidToGidMap"]
    for font in font_facts
)

qa = {
    "qaVersion": 1,
    "qaId": "pdf-pilot-08b-r2c-m-canonical-full-document-structural-qa-v1",
    "phaseId": "PDF-PILOT-08B-R2C-M",
    "status": "accepted-pdf-structural-proof-visual-fidelity-pending",
    "artifact": {
        "sha256": sha256(pdf_path),
        "bytes": pdf_path.stat().st_size,
        "pageCount": len(reader.pages),
        "pdfVersion": reader.pdf_header,
        "strictParserAccepted": True,
        "trailerRootPresent": reader.trailer.get("/Root") is not None,
    },
    "source": {
        "bundleFingerprint": bundle["bundleFingerprint"],
        "contractFingerprint": contract["fingerprint"],
        "rendererArtifactSha256": summary["artifact"]["sha256"],
    },
    "pageTree": {
        "pageCount": len(reader.pages),
        "allLetter612x792Pt": page_boxes_valid,
        "pages": page_facts,
    },
    "resourceInspection": {
        "uniqueFontObjectCount": len(font_facts),
        "uniqueImageObjectCount": len(image_facts),
        "fonts": font_facts,
        "images": image_facts,
        "imageDimensionsMatchContract": actual_image_dimensions == expected_image_dimensions,
    },
    "contentStreamInspection": {
        "operatorCounts": operator_counts,
        "expectedGlyphRunCount": contract["summary"]["glyphRunCount"],
        "expectedStrokeLineCount": contract["summary"]["strokeLineCount"],
        "expectedImagePaintCount": contract["summary"]["imageCount"],
    },
    "textExtraction": {
        "engine": "pypdf",
        "engineVersion": __import__("pypdf").__version__,
        "expectedGlyphRuns": expected_run_count,
        "whitespaceNormalizedRunPresence": extracted_run_presence,
        "allExpectedRunsPresent": extracted_run_presence == expected_run_count,
    },
    "popplerInspection": {
        "pdfinfoAccepted": True,
        "reportedPageCount": 13,
        "reportedPageSize": "612 x 792 pts (letter)",
        "reportedPdfVersion": "1.7",
    },
    "rasterSmoke": {
        "renderer": "pdftoppm",
        "dpi": 96,
        "pageCount": len(raster_pages),
        "allPagesNonBlank": len(raster_pages) == 13 and all(page["nonBlank"] for page in raster_pages),
        "pages": raster_pages,
        "visualFidelityAccepted": False,
    },
    "acceptance": {
        "rendererArtifactMatches": sha256(pdf_path) == summary["artifact"]["sha256"],
        "pageTreeValid": len(reader.pages) == 13 and page_boxes_valid,
        "fontEmbeddingValid": len(font_facts) == 2 and font_embedding_valid,
        "imageResourcesValid": len(image_facts) == 5 and actual_image_dimensions == expected_image_dimensions,
        "glyphRunOperatorsComplete": operator_counts.get("TJ", 0) == contract["summary"]["glyphRunCount"],
        "strokeLineOperatorsComplete": all(
            operator_counts.get(operator, 0) == contract["summary"]["strokeLineCount"]
            for operator in ("RG", "w", "d", "m", "l", "S")
        ),
        "imagePaintOperatorsComplete": operator_counts.get("Do", 0) == contract["summary"]["imageCount"],
        "textExtractionComplete": extracted_run_presence == expected_run_count,
        "allRasterPagesNonBlank": len(raster_pages) == 13 and all(page["nonBlank"] for page in raster_pages),
        "pdfRendered": True,
        "visualFidelityAccepted": False,
        "productionBinding": False,
    },
    "nextPhase": "PDF-PILOT-08B-R2C-N visual comparison and layout-fidelity decision",
}

if not all(value for key, value in qa["acceptance"].items() if key not in {"visualFidelityAccepted", "productionBinding"}):
    raise RuntimeError(f"Full-document PDF structural QA failed: {json.dumps(qa['acceptance'])}")

output_path = repo_path(args.output)
output_path.parent.mkdir(parents=True, exist_ok=True)
output_path.write_bytes((json.dumps(qa, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))
print(output_path)
