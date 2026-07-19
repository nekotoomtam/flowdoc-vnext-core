# PDF Export REALDOC Temporary Form Handoff

Status: `PDF-EXPORT-REALDOC-E.5.4` accepted in Editor over the E.5.3 Core
projection. Core runtime behavior and production remain unchanged. Production
remains NO-GO.

## Accepted Consumer Boundary

Editor creates a memory-only temporary Form session only from a ready
`VNextPublishedStructureTestInputProjectionV1`. It preserves one value identity
per document field key, projection grouping/order, explicit unplaced fields,
collection item contracts, image requirements, and all unavailable constraint
facts without extending or reinterpreting the Core contract.

Document values are unset initially. Collection absence is distinct from an
included empty collection. Collection item defaults are not promoted into
entered values. Document fallback text is not promoted into a generation
default.

## Identity And Staleness

The Editor state pins Published Structure owner, Structure fingerprint,
generation data-contract fingerprint, and projection fingerprint. Any pin
change resets the temporary Form session. E.5.4 does not claim compatible value
migration across Structure versions.

## Images And Bounds

The Editor keeps selected PNG/JPEG `File` objects in memory and stores only a
temporary descriptor in pure Form state. It does not create asset digests,
intrinsic dimensions, media snapshots, or authoritative asset references.

The 100-row collection bound and 10 MiB image-selection bound are local editing
limits. They are not written into the Structure, projection, generation data
contract, or canonical snapshot semantics.

## No Core Runtime Change

E.5.4 adds no Core schema, mapper, validator, snapshot, materializer, resolver,
measurement, pagination, renderer, operation, or artifact behavior. All Form
execution markers remain `not-run`. The Core E.5.3 projection remains pure and
UI-neutral.

Normal Editor documents still lack a trusted projection transport and remain
Preview unavailable. A development-only source-neutral fixture proves the
generated controls but is not canonical generation evidence.

## Next Phase

`PDF-EXPORT-REALDOC-E.5.5` now accepts Editor JSON selection, exact
mapping-profile selection, and content-free local preparation diagnostics. It
preserves the E.1/E.2 convergence boundary without browser mapping or Preview
execution. E.5.6 next binds Published Preview. Production remains NO-GO.
