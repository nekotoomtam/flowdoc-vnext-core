# PDF Export REALDOC Temporary JSON And Mapping Handoff

Status: `PDF-EXPORT-REALDOC-E.5.5` accepted in Editor over the E.1/E.2 adapted
input contracts. Core runtime behavior and production remain unchanged.
Production remains NO-GO.

## Accepted Consumer Boundary

Editor now owns one memory-only JSON preparation state beside the accepted Form
state. It retains exact UTF-8 JSON text and one mapping-profile id, version, and
profile fingerprint. It accepts profile options only from a supplied catalog of
Core `VNextPublishedStructureMappingProfileV1` facts.

The selected profile must own the exact Published Structure Version and target
the exact generation data-contract id and fingerprint pinned by the E.5.3
projection. Named-adapter and declarative-mapping execution identities remain
contract facts; no mapper implementation or executable mapping definition is
accepted from the browser.

## Preparation Diagnostics

Editor may parse JSON for safe local input feedback and applies the current
1 MiB Backend adapted-payload limit before future admission. Its diagnostics
contain generated codes, fixed structural paths, generated messages, counts,
and byte length. They do not retain supplied values, parser exception text,
canonical snapshots, item keys, or asset ids.

The successful local status is `ready-for-admission`. It is not E.1
`mapping-required`, E.2 runtime-ready, materialized, resolved, measured,
paginated, or artifact-ready truth. All mapping and downstream execution
markers remain `not-run`.

## Identity And Staleness

JSON state pins Published Structure owner, Structure fingerprint, generation
data-contract fingerprint, and projection fingerprint. Any pin change clears
the complete JSON state. A mapping-catalog change clears a selected profile when
its exact id, version, and fingerprint is no longer present.

Form and JSON state remain separate and survive mode switches independently.
Neither becomes authored Structure data or a Core generation request in E.5.5.

## No Core Runtime Change

E.5.5 adds no Core schema, profile registry, mapper, payload descriptor,
validator, snapshot, materializer, resolver, measurement, pagination, renderer,
operation, or artifact behavior. The authoritative E.1 descriptor remains
Backend-created from admitted bytes, and the authoritative E.2 mapper remains
Backend-selected from an allowlisted registry.

Normal Editor documents still lack trusted projection and profile-discovery
transport and remain Preview unavailable. Development-only source-neutral
fixtures prove UI behavior but are not canonical generation evidence.

## Next Phase

`PDF-EXPORT-REALDOC-E.5.6` binds Published Preview to E.3 admission and the E.4
artifact lifecycle. It must preserve exact Structure/profile/input identities,
return only content-free receipts and diagnostics to Editor state, and reuse the
same Core runtime used by API-shaped callers. Production remains NO-GO.
