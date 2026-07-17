from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


PACKAGE_ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = PACKAGE_ROOT.parent.parent


def repo_path(value: str) -> Path:
    path = Path(value)
    return path if path.is_absolute() else REPO_ROOT / path


parser = argparse.ArgumentParser()
parser.add_argument("--request", default="fixtures/pdf-pilot-canonical-report-twelve-page-request.v1.json")
parser.add_argument("--font-id", default="ibm-plex-sans-thai-regular")
parser.add_argument("--source", default="assets/fonts/IBM_Plex_Sans_Thai/IBMPlexSansThai-Regular.ttf")
parser.add_argument("--subset", default="packages/pdf-renderer-pilot/fixtures/fonts/FlowDocThaiCanonicalReportSubset-Regular.ttf")
parser.add_argument("--manifest", default="packages/pdf-renderer-pilot/fixtures/canonical-report-font-subset-manifest.v1.json")
parser.add_argument("--phase-id", default="PDF-PILOT-07")
parser.add_argument("--subset-id", default="pdf-pilot-07-ibm-plex-regular-canonical-report")
parser.add_argument("--family-name", default="FlowDoc Thai Canonical Report Subset")
parser.add_argument("--postscript-name", default="FlowDocThaiCanonicalReportSubset-Regular")
parser.add_argument("--subset-prefix", default="FDPCRP")
parser.add_argument("--style-name", default="Regular")
parser.add_argument("--font-specific-glyphs", action="store_true")
args = parser.parse_args()

REQUEST_PATH = repo_path(args.request)
SOURCE_PATH = repo_path(args.source)
SUBSET_PATH = repo_path(args.subset)
MANIFEST_PATH = repo_path(args.manifest)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


document = json.loads(REQUEST_PATH.read_text(encoding="utf-8"))
request = document.get("rendererHandoff", {}).get("measuredDrawContract", document)
font_asset = next(
    (asset for asset in request["fontAssets"] if asset["fontId"] == args.font_id),
    None,
)
if font_asset is None:
    raise RuntimeError(f"request does not declare font {args.font_id}")
if sha256(SOURCE_PATH) != font_asset["sha256"]:
    raise RuntimeError("registered source font hash mismatch")

paint_commands = request.get("paintCommands")
if paint_commands is None:
    paint_commands = [
        command
        for page in request["pages"]
        for command in page["commands"]
    ]

glyph_ids = sorted({
    glyph["glyphId"]
    for command in paint_commands
    if command["kind"] == "glyph-run"
    and (not args.font_specific_glyphs or command["fontId"] == args.font_id)
    for glyph in command["glyphs"]
} | {0})

font = TTFont(SOURCE_PATH, recalcTimestamp=False)
options = subset.Options()
options.retain_gids = True
options.hinting = False
options.notdef_glyph = True
options.notdef_outline = True
options.recommended_glyphs = True
options.glyph_names = True
options.layout_features = ["*"]
subsetter = subset.Subsetter(options=options)
subsetter.populate(gids=glyph_ids)
subsetter.subset(font)

name_values = {
    1: args.family_name,
    2: args.style_name,
    3: f"{args.family_name} {args.style_name}; {args.phase_id}",
    4: f"{args.family_name} {args.style_name}",
    6: args.postscript_name,
    16: args.family_name,
    17: args.style_name,
}
for record in font["name"].names:
    replacement = name_values.get(record.nameID)
    if replacement is not None:
        record.string = replacement.encode(record.getEncoding())

SUBSET_PATH.parent.mkdir(parents=True, exist_ok=True)
font.save(SUBSET_PATH, reorderTables=True)

subset_font = TTFont(SUBSET_PATH, recalcTimestamp=False)
manifest = {
    "manifestVersion": 1,
    "subsetId": args.subset_id,
    "pilotId": request["pilotId"],
    "fontId": font_asset["fontId"],
    "postScriptName": args.postscript_name,
    "subsetPrefix": args.subset_prefix,
    "source": {
        "path": SOURCE_PATH.relative_to(REPO_ROOT).as_posix(),
        "sha256": font_asset["sha256"],
        "bytes": SOURCE_PATH.stat().st_size,
    },
    "subset": {
        "path": SUBSET_PATH.relative_to(REPO_ROOT).as_posix(),
        "sha256": sha256(SUBSET_PATH),
        "bytes": SUBSET_PATH.stat().st_size,
        "sfntGlyphCount": subset_font["maxp"].numGlyphs,
        "retainedGlyphIds": glyph_ids,
        "retainGlyphIds": True,
        "hintingRetained": False,
    },
    "fontMetrics": {
        "unitsPerEm": subset_font["head"].unitsPerEm,
        "fontBBox": [
            subset_font["head"].xMin,
            subset_font["head"].yMin,
            subset_font["head"].xMax,
            subset_font["head"].yMax,
        ],
        "ascent": subset_font["hhea"].ascent,
        "descent": subset_font["hhea"].descent,
        "capHeight": getattr(subset_font["OS/2"], "sCapHeight", subset_font["hhea"].ascent),
    },
    "license": {
        "id": "OFL-1.1",
        "path": "assets/fonts/IBM_Plex_Sans_Thai/OFL.txt",
        "reservedNameRemovedFromDerivative": True,
    },
    "builder": {
        "fontToolsVersion": "4.58.2",
        "shaperRevision": "rustybuzz-0.20.1",
        "productionBinding": False,
    },
}
MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
MANIFEST_PATH.write_bytes((json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))
print(SUBSET_PATH)
print(MANIFEST_PATH)
