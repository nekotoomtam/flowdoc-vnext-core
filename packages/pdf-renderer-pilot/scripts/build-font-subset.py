from __future__ import annotations

import hashlib
import json
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


PACKAGE_ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = PACKAGE_ROOT.parent.parent
REQUEST_PATH = REPO_ROOT / "fixtures" / "pdf-pilot-thai-one-page-request.v1.json"
SOURCE_PATH = REPO_ROOT / "assets" / "fonts" / "IBM_Plex_Sans_Thai" / "IBMPlexSansThai-Regular.ttf"
SUBSET_PATH = PACKAGE_ROOT / "fixtures" / "fonts" / "FlowDocThaiPilotSubset-Regular.ttf"
MANIFEST_PATH = PACKAGE_ROOT / "fixtures" / "font-subset-manifest.v1.json"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


request = json.loads(REQUEST_PATH.read_text(encoding="utf-8"))
font_asset = request["fontAssets"][0]
if sha256(SOURCE_PATH) != font_asset["sha256"]:
    raise RuntimeError("registered source font hash mismatch")

glyph_ids = sorted({
    glyph["glyphId"]
    for command in request["paintCommands"]
    if command["kind"] == "glyph-run"
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
    1: "FlowDoc Thai Pilot Subset",
    2: "Regular",
    3: "FlowDoc Thai Pilot Subset Regular; PDF-PILOT-03",
    4: "FlowDoc Thai Pilot Subset Regular",
    6: "FlowDocThaiPilotSubset-Regular",
    16: "FlowDoc Thai Pilot Subset",
    17: "Regular",
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
    "subsetId": "pdf-pilot-03-ibm-plex-regular-thai-one-page",
    "pilotId": request["pilotId"],
    "fontId": font_asset["fontId"],
    "postScriptName": "FlowDocThaiPilotSubset-Regular",
    "subsetPrefix": "FDPLTA",
    "source": {
        "path": "assets/fonts/IBM_Plex_Sans_Thai/IBMPlexSansThai-Regular.ttf",
        "sha256": font_asset["sha256"],
        "bytes": SOURCE_PATH.stat().st_size,
    },
    "subset": {
        "path": "packages/pdf-renderer-pilot/fixtures/fonts/FlowDocThaiPilotSubset-Regular.ttf",
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
