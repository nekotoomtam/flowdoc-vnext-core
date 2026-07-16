# FlowDoc PDF Renderer Pilot

This private external package executes bounded PDF fidelity proofs from public
`@flowdoc/vnext-core` measured draw contracts. It is not the production PDF
renderer and Core does not import it.

## PDF-PILOT-03 Profile

The first profile accepts exactly one page containing opaque glyph runs, fills,
and strokes. It embeds a caller-supplied GID-retaining TrueType subset as a
Type0/CIDFontType2 font, uses contract advances and offsets without reshaping,
and writes both ToUnicode and ActualText extraction data.

Image commands, vertical glyph offsets, transparency, storage, routes, and
production binding fail closed.

## PDF-PILOT-04 Profile

The second profile executes all four one-page paint-command kinds. Caller-owned
8-bit grayscale/RGB PNG bytes are checked against contract digest and dimensions
before their IDAT stream is embedded as a PDF Image XObject. Contain, cover,
and normalized crop use explicit clipping matrices; alpha, palette, JPEG,
transparency, and production binding fail closed.

## Reproduction

Build actual Rustybuzz glyph facts:

```text
npm --prefix packages/pdf-renderer-pilot run build:request
npm --prefix packages/pdf-renderer-pilot run build:image-request
```

Build the retained subset with Python FontTools:

```text
npm --prefix packages/pdf-renderer-pilot run build:subset
```

Build the local proof artifact:

```text
npm --prefix packages/pdf-renderer-pilot run build:proof
npm --prefix packages/pdf-renderer-pilot run build:image-proof
```

The proof PDF is written to
`output/pdf/flowdoc-pdf-pilot-thai-one-page.pdf`. It is local evidence and is
not a stored FlowDoc artifact.

The image proof is written to
`output/pdf/flowdoc-pdf-pilot-image-one-page.pdf`. The external source image is
not copied into the repository.
