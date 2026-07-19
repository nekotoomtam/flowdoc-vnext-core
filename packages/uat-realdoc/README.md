# @flowdoc/uat-realdoc

This isolated package owns the source-specific `uat_semantic_no_pages_v1`
adapter and the source-neutral UAT Structure Definition evidence used by the
real-document local lane.

It deliberately does not add UAT schemas or node types to canonical Core. The
Structure Definition is composed from existing document v4, lifecycle, field,
style, media, collection, and table contracts. The adapter validates external
source shape and projects caller-pinned instance data, collection, media, and
provenance inputs. It does not allocate an instance, decide screenshot
placement, measure text, paginate, render, retain source bytes, or activate a
production path.

The external 69C section 2.1 evidence can be rechecked from the repository
root:

```text
npm run verify:uat-69c-section-2-1-adapter -- --semantic-dir <semantic-directory>
```

REALDOC-C adds deterministic revision-zero instance and table-content
resolution without changing canonical Core APIs. Its exact external evidence
can be rechecked with:

```text
npm run verify:uat-69c-section-2-1-resolution -- --semantic-dir <semantic-directory>
```

Screenshot placement is explicitly section-level: after the complete
requirement table and in semantic source order. Measurement, pagination,
rendering, persistence, Editor/Backend integration, and production remain out
of scope.
