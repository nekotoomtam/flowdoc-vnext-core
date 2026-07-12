# V4 Integrated Document Stress Scale Matrix

Status: Phase 361 medium/large retained-work evidence.

## Outcome

The integrated stress matrix executes real medium and large workloads across
Text-block pagination, depth-three Columns pagination, synchronized Table
pagination, Table renderer-neutral projection, and the complete pure TOC lane.
It retains exact local page/work facts per lane, six expected blockers, source
immutability, and `integratedPageCount=null`.

The matrix exposed and fixed a retained-output amplification problem in final
TOC resolution. Content-sized JSON fingerprints were repeated per entry and
then nested again in result fingerprints. A real 1,000-heading pipeline took
longer than three minutes and produced about 175 MB of serialized resolution
output even though algorithmic visit counts were linear.

Final TOC resolution now validates exact raw ownership before projection, keeps
browser-safe SHA-256 digests once in top-level pins, omits repeated owner
fingerprints from entries, and emits a compact final SHA-256 fingerprint. The
same combined scale test now completes within the required gate and keeps
serialized resolution below 10 KB per heading.

## Profiles

| Lane | Medium | Large |
|---|---:|---:|
| Text-block lines | 600 | 6,000 |
| Text-block local pages | 25 | 250 |
| Columns depth-three fragments | 600 | 6,000 |
| Columns local pages | 25 | 250 |
| Table body rows | 100 | 1,000 |
| Table local pages | 25 | 250 |
| TOC headings | 100 | 1,000 |
| TOC local pages | 15 | 143 |

These are independent local page counts. They are never summed or presented as
an integrated document page count.

## Exact Large Work

- Text-block: 6,000 lines and 250 retained local fragments/pages.
- Columns: 250 page attempts, 750 lane plans, 500 nested plans, 250 checkpoint
  lookups, 6,000 consumed fragments, and observed depth three.
- Table: 250 page attempts, 1,250 row/cell/candidate plans, 249 repeated-header
  plans, 1,000 body rows, and 250 local pages.
- Table renderer-neutral projection: 250 page visits and 1,250 row, cell, and
  candidate visits.
- TOC semantic: 1,002 node visits and 1,000 entry builds.
- TOC measurement: 1,002 text measurements.
- TOC pagination: 143 local pages with complete ordered row coverage.
- TOC resolution: 1,000 entry resolutions, placement indexes, and destination
  indexes against an explicitly synthetic heading-page map.

## Determinism Policy

The medium integrated matrix runs twice to prove byte-identical combined
ledger output. The large matrix runs once with exact expected counts because
each owner lane already has repeated large determinism tests at the same
accepted maxima. This avoids multiplying all maxima inside one serial CI test
while still executing the real combined large workload.

## Fingerprint Boundary

`createVNextCompactFingerprint(...)` is an internal browser-safe SHA-256
implementation validated against published known vectors. Final TOC resolver
pins record `algorithm="sha256"`; raw upstream fingerprints are still compared
for exact ownership before compact output is produced.

The compact helper does not silently rewrite fingerprints across unrelated
core contracts. Broader fingerprint normalization requires a separate design
gate if future stress evidence shows the same amplification elsewhere.

## PASS

- Medium and large workloads execute through real public lane APIs.
- Exact structural work remains linear at accepted maxima.
- Inputs remain immutable and outputs remain JSON-safe.
- Medium combined output is byte-identical across repeated execution.
- Large local page/work results match owner-lane scale evidence.
- Final TOC resolution no longer repeats content-sized fingerprints per entry.
- Six expected integration blockers remain present.
- No integrated page count, composer, production heading map, renderer
  artifact, persistence, or editor state is synthesized.

## RISK

- Upstream TOC semantic, measurement, cursor, and manifest fingerprints remain
  content-sized JSON strings internally; compacting the final boundary reduces
  retained output but not every temporary allocation.
- Pure TypeScript SHA-256 is portable and deterministic but is not intended as
  a high-throughput artifact-byte hashing engine.
- Large matrix timing depends on the test environment and is diagnostic, not a
  production SLA.

## UNKNOWN

- Whether other integrated lanes contain nested JSON fingerprints with similar
  retained-size amplification.
- Production memory ceilings for 200-300 page jobs.
- Whether whole-document composition should require compact fingerprints at
  every cursor/artifact boundary from its first version.

## Intentionally Not Changed

- canonical schemas and version activation;
- local Text-block, Columns, Table, and TOC layout semantics;
- whole-document composition or integrated page numbering;
- production renderer/export, backend persistence, and editor UI.

## Next Direction

Stress localized mutation and invalidation. Change one heading, text source,
Columns lane, and Table row/cell fact at a time; prove exact dependent
fingerprint changes while unrelated lane evidence remains stable.
