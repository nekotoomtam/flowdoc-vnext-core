# PDF Export Real Document UAT Structure And Adapter

Status: `PDF-EXPORT-REALDOC-B` accepted for UAT Structure Definition and
section 2.1 source-adapter scope. Materialization, resolution, pagination,
rendering, product eligibility, and production remain closed.

## Decision

The UAT document concept is represented as a Structure Definition assembled
from existing Core contracts, not as a new canonical UAT document kind or UAT
node family. The source-specific `uat_semantic_no_pages_v1` parser remains in
the isolated `@flowdoc/uat-realdoc` package.

This keeps three boundaries distinct:

- Core owns reusable document, lifecycle, field, table, media, policy,
  resolution, pagination, and export semantics.
- The UAT package owns strict source-shape validation, data projection, and
  source provenance.
- A later Backend/local resolver supplies trusted bytes and an allocated
  instance identity before materialization or export.

## UAT Structure Definition V1

The accepted Structure Version is:

```text
structure-uat-record-v1
```

Its fingerprint is:

```text
sha256:3c7a6f62837994db864f4d91a4b4cb746825ec4cff7529b84ff28166192345f4
```

The starter graph contains one A4 section and 41 canonical v4 nodes. It uses:

- fixed header and generated page-number footer regions;
- data-bound module and section headings;
- a repeated four-column requirement table with leading header repetition;
- a repeated screenshot table with caption, contained image, and description;
- an instance-editable approval region; and
- four editable bindings: requirement Accept, requirement Remark, approver,
  and approval date.

The published contracts contain 17 document fields, two collection shapes,
two Table Definitions, two table content-binding contracts, eight text styles,
an empty published static-media registry, and a governed Structure Policy.
No source-specific node or source file shape is added to Core.

## Adapter Contract

`adaptFlowDocUatSemanticNoPagesSectionV1(...)` accepts:

- one exact source-set and semantic-map identity;
- one strict page-free semantic document;
- one selected section number;
- one caller-provided Document Instance identity pinned to the UAT Structure
  Version; and
- exact trusted image resource facts for that selected section.

It validates strict source shape, global requirement/screenshot identity,
section selection, screenshot order, reciprocal links, exact resource
membership, and pixel-dimension agreement. Unknown legacy page fields,
missing/extra resources, dimension drift, duplicate ids, non-reciprocal links,
or a mismatched Structure Version block before output.

Ready output includes canonical instance data, table collection, and instance
media snapshots plus structured semantic relations and source provenance. The
adapter does not allocate the supplied instance identity.

## Exact 69C Evidence

The external REALDOC-A baseline reproduces:

- 15 scalar values;
- 10 requirement items;
- 7 screenshot items;
- 17 collection items total;
- 7 digest-bound media assets;
- 4,833 feature-text characters;
- 1,117,389 source image bytes; and
- 3,494,022 source image pixels.

The content-sensitive adapter bundle fingerprint is:

```text
sha256:d348842d94f31a60240ee668c77f3d9775c5d2bb6eb4b38fed5dc2eea91e7fe9
```

Repository evidence retains only identities, counts, warnings, and
fingerprints. It does not retain Requirement text, semantic source content,
image bytes, or user-specific paths.

## Preserved Warnings

- `page-geometry-unavailable`: the source deliberately removed authored page
  and placement geometry.
- `screenshot-placement-unresolved`: source screenshot order is retained, but
  exact insertion points are unavailable.
- `section-all-to-all-links`: every selected requirement links all seven
  selected screenshots, so the relation is section-level evidence only.

REALDOC-C must make a separate placement decision during resolved projection;
the adapter cannot infer it.

## PASS

- The starter graph passes canonical document v4 structure validation.
- Both UAT tables pass the existing collection/table contract validator.
- Synthetic source tests prove deterministic projection, caller immutability,
  strict rejection, canonical snapshots, media identity, and provenance.
- The exact external 69C section 2.1 source reproduces the retained structure
  and adapter evidence.
- No package/document schema change or production activation occurs.

## FAIL / BLOCKER

None for REALDOC-B scope.

Export remains blocked because Document Instance materialization, collection
row materialization, resolved field/image bindings, screenshot placement,
measurement, pagination, and renderer handoff have not run.

## RISK

- Requirement feature text contains retained newline characters; later text
  preparation must preserve intended breaks without creating invalid authored
  text leaves.
- Screenshot rows combine caption, image, and description; REALDOC-D must
  measure whether `prefer-keep` remains feasible within the available page
  body.
- The current screenshot relation cannot support requirement-level automatic
  placement.

## UNKNOWN

- Final source-to-instance identity assignments for generated requirement and
  screenshot rows.
- Whether screenshot rows need a different frame/pagination policy after the
  first measured section output.
- Actual paint-command, glyph, page, output-byte, CPU, and memory facts.

## Behavior Changed

An isolated package can now create the UAT Structure Definition and adapt a
strict caller-supplied UAT section into canonical pinned snapshot inputs. No
existing Core runtime entrypoint, Backend route, or Editor behavior changed.

## Tests Run

- external `verify:uat-69c-section-2-1-adapter` against the pinned semantic
  folder and all 149 image identities;
- `npm.cmd test -- tests/pdfExportRealdocUatStructureAdapter.test.ts`;
- `npm.cmd run check` (`376` test files, `1,813` tests).

## Intentionally Not Changed

- canonical Core package/document schemas and node vocabulary;
- REALDOC-A source bytes and retention policy;
- LOCAL-G resolver, renderer, resource envelope, and eligibility;
- Backend and Editor repositories;
- production NO-GO decision.

Next phase: `PDF-EXPORT-REALDOC-C` section 2.1 materialization and resolved
projection.
