"""Independent offline fontTools contours and Pillow/FreeType raster reference.
No Python library is added to Core's runtime or dependency manifests.
Run from Core root, passing an external evidence output directory.
"""
import json, sys, hashlib, math
from pathlib import Path
import fontTools
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from PIL import Image, ImageDraw, ImageFont, __version__ as pillow_version

font_path = Path('assets/fonts/Sarabun/Sarabun-Regular.ttf')
asset_path = Path('packages/text-engine-rust-wasm/assets/creator-sarabun-outlines.v1.json')
font = TTFont(font_path)
glyph_set = font.getGlyphSet()
asset = json.loads(asset_path.read_text())
out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)

class Pen(BasePen):
    def __init__(self):
        super().__init__(glyph_set); self.commands = []
    def _moveTo(self, p): self.commands.append(['M', *p])
    def _lineTo(self, p): self.commands.append(['L', *p])
    def _qCurveToOne(self, p1, p2): self.commands.append(['Q', *p1, *p2])
    def _curveToOne(self, p1, p2, p3): self.commands.append(['C', *p1, *p2, *p3])
    def _closePath(self): self.commands.append(['Z'])

def contours(commands):
    """Compare oriented segments, allowing a cyclic change of contour start."""
    result = []; current = []; start = None; previous = None
    for command in commands:
        if command[0] == 'M': start = previous = command[1:]
        elif command[0] == 'Z':
            if previous != start: current.append(('L', *previous, *start))
            rotations = [current[i:] + current[:i] for i in range(len(current))]
            result.append(min(rotations) if rotations else []); current = []
        else:
            current.append((command[0], *previous, *command[1:])); previous = command[-2:]
    assert not current
    return result

reference = []
for gid, name in enumerate(font.getGlyphOrder()):
    pen = Pen(); glyph_set[name].draw(pen); reference.append(pen.commands)
    actual = contours(asset['glyphs'][gid]); expected = contours(pen.commands)
    assert actual == expected, f'Contour mismatch glyph {gid} {name}: {actual[:1]} != {expected[:1]}'

def raster(commands, size=1000):
    # Independent polygon sampling of generated curves; nonzero winding is
    # preserved by accumulating signed contour coverage instead of painting holes.
    polygons = []; points = []; start = None
    for c in commands:
        op = c[0]
        if op == 'M': points = [tuple(c[1:])]; start = points[0]
        elif op == 'L': points.append(tuple(c[1:]))
        elif op in ('Q', 'C'):
            p0 = points[-1]; controls = [p0] + [tuple(c[i:i+2]) for i in range(1, len(c), 2)]
            for step in range(1, 65):
                t = step / 64; work = controls
                while len(work) > 1: work = [((1-t)*a[0]+t*b[0], (1-t)*a[1]+t*b[1]) for a,b in zip(work,work[1:])]
                points.append(work[0])
        elif op == 'Z': polygons.append(points); points = []
    # Sarabun outlines use opposite contour orientation for counters. Draw large
    # contours first so contained counters erase only their containing outline.
    area = lambda p: sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(p,p[1:]+p[:1]))
    polygons.sort(key=lambda p: abs(area(p)), reverse=True)
    image = Image.new('L',(1800,1800)); draw = ImageDraw.Draw(image)
    if polygons:
        outer = 1 if area(polygons[0]) > 0 else -1
        for p in polygons: draw.polygon([(x+400,1300-y) for x,y in p], fill=255 if area(p)*outer > 0 else 0)
    return image

cmap = font.getBestCmap(); samples = []
pil_font = ImageFont.truetype(str(font_path),1000,layout_engine=ImageFont.Layout.BASIC)
for char in ['A', 'é', 'Å', 'ก', 'ิ', '้']:
    gid = font.getGlyphID(cmap[ord(char)])
    actual = raster(asset['glyphs'][gid])
    # FreeType directly rasterizes the original font; no generated paths used.
    expected = Image.new('L',actual.size)
    ImageDraw.Draw(expected).text((400,1300),char,font=pil_font,fill=255,anchor='ls',stroke_width=0)
    a = actual.tobytes(); b = expected.tobytes()
    union = sum(x>127 or y>127 for x,y in zip(a,b)); differing = sum((x>127)!=(y>127) for x,y in zip(a,b))
    error = differing / max(union,1)
    assert union > 0 and error < 0.06, f'Raster mismatch {char}: {error}'
    actual.save(out/f'glyph-{gid}-outline.png'); expected.save(out/f'glyph-{gid}-freetype.png')
    samples.append({'char':char,'glyphId':gid,'binaryXorOverUnion':error})
report = {'fontTools':fontTools.__version__,'pillow':pillow_version,'fontSha256':hashlib.sha256(font_path.read_bytes()).hexdigest(),'outlineSha256':hashlib.sha256(asset_path.read_bytes()).hexdigest(),'glyphCount':len(reference),'exactContours':True,'compoundGlyphCount':sum(font['glyf'][n].isComposite() for n in font.getGlyphOrder()),'rasterSamples':samples,'rasterBoundary':'1000px FreeType reference, threshold0.06; polygon sampling/hinting edge differences allowed; not browser/IME evidence'}
(out/'reference.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report,ensure_ascii=True,indent=2))
