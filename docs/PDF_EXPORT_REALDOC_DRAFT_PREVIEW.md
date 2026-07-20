# PDF Export REALDOC Draft Preview

Status: `PDF-EXPORT-REALDOC-E.5.7` accepted for local development.
Production remains NO-GO.

## Decision

Draft Preview has its own immutable Core identity. It is not a Published
Structure Version and cannot be used as Published/API-parity evidence.

`VNextDraftStructurePreviewSnapshotV1` pins an exact draft identity, authoring
document/revision, source package identity, and canonical snapshot fingerprint.
Its contract fixes `localPreviewOnly`, `exactDraftRevision`, and
`immutableSnapshot` to true while `publishedStructureVersion`,
`publishedApiParity`, `businessValuesIncluded`, and `productionBinding` remain
false.

## Shared Runtime Boundary

Backend first authorizes and validates the trusted Draft snapshot through a
separate Draft context and admission route. Only after that boundary may a
trusted compatibility bridge reuse the accepted E.2 mapping/validation and
E.4 artifact lifecycle.

The bridge is an implementation reuse point, not a conversion of the Draft
snapshot into a Published Structure Version. A caller does not supply a
Published Structure identity to the Draft route, and the public Draft receipt
continues to state `publishedApiParity: false`.

## Editor Contract

Preview exposes explicit Draft and Published targets. Draft is the default
when a trusted Draft context is available. The same projected Form/JSON input
may remain visible across a compatible target change, but every admission,
operation, artifact, and download result is target-specific and is cleared
when the target changes.

Editor receives the immutable Draft snapshot identity and content-free result
facts. Raw imported JSON and mapped canonical business values do not return in
the receipt.

## Accepted Evidence

The retained local 69C evidence uses snapshot fingerprint
`sha256:563a023d6c25c04df1d55ccd7a3e2d0f905656c4bd50b8f29172553f44ef4a4f`.
The 749,929-byte adapted input maps as `executed`, validates as `run-valid`, and
reports 0 errors plus 3 warnings. The shared lifecycle completes a verified
10-page, 1,417,544-byte PDF with SHA-256
`1d5af8341ec7a7faf10b0af5d86b217405cdd458df1331277da2115cc95fe372`.

Desktop 1280 x 720 and mobile 390 x 844 Editor QA have no horizontal page
overflow. Switching Draft to Published and back removes the previous target's
artifact while retaining compatible temporary JSON input.

## Explicitly Not Changed

- no automatic compiler from an arbitrary live Editor draft package to the
  generation bundle used by the compatibility bridge;
- no durable Draft snapshot repository, reopen, retention, or publish policy;
- no Form-draft admission or mapped-value hydration;
- no claim that Draft and Published artifacts are byte-identical;
- no complete 200-page export, which remains `PDF-EXPORT-REALDOC-G`;
- no default Backend application-server mount; and
- no production route, provider, tenancy, deployment, or activation.

## Risks

The accepted 69C registry is trusted, local, and process-memory only. It proves
the identity and admission boundary plus shared generation/artifact reuse; it
does not yet prove arbitrary authored Structure compilation.

Draft and Published can legitimately produce different instance and canonical
identities even when they project the same fields and render the same page
count. UI and evidence must compare semantic pins before making any parity
claim.

## Next Phase

`PDF-EXPORT-REALDOC-E.5.8` now accepts loading, failure, cancellation, retry,
diagnostic navigation, bounded large-input interaction, and download lifecycle
UX. E.5.9 next owns Form/API parity evidence. Production remains NO-GO.
