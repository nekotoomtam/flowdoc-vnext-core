# PDF Export REALDOC Published Preview

Status: `PDF-EXPORT-REALDOC-E.5.6` accepted for local development. Production
remains NO-GO.

## Decision

Published Preview is a pre-test caller of the same Backend DocGen and PDF
artifact path used by an external API-shaped caller. It is not a second browser
mapper, resolver, paginator, or renderer.

```text
exact authoring document/revision
  -> value-free Published Preview context
  -> imported adapted JSON + exact mapping profile
  -> E.3 protected admission
  -> content-free receipt + revision-zero instance pin
  -> E.4 operation/status/download lifecycle
  -> exact PDF
```

The authored Structure Definition remains separate from all imported values.
The context carries an exact Published Structure Version, E.5.3 projection,
mapping-profile identities, admitted asset registry, and limits. It contains no
business values, raw payload, executable mapper, or production binding.

## Core Ownership

Core continues to own the source-neutral contracts and pure runtime:

- `VNextPublishedStructureTestInputProjectionV1` describes dynamic Form fields;
- `VNextPublishedStructureMappingProfileV1` pins source, target, and execution;
- adapted and direct inputs converge on the same canonical input validator; and
- diagnostics and receipts remain content-free.

The 69C helper now returns its ready projection, canonical mapping profile, and
adapted JSON text for local cross-repo evidence. The bounded
`map-docgen-local.mjs` process only lets the Backend execute the allowlisted UAT
adapter. These helpers are evidence adapters, not a fixed UAT field schema.

## Editor Contract

The Form and imported JSON states remain independent. `Form data JSON` is a
read-only, memory-only draft projection of current Form values. It has status
`draft-not-validated` and is not admitted as canonical input in E.5.6.

Imported JSON can be admitted only after local size/syntax/profile checks pass.
The Editor receives a sanitized content-free view of the E.3 receipt: mapping
status, validation status, warning count, canonical fingerprint, instance pin,
and public artifact lifecycle facts. It does not receive mapped canonical
business values.

Changing Structure context, payload revision, or mapping-profile fingerprint
marks the result stale and removes the exact PDF/download surface.

## Accepted Evidence

The retained 69C section 2.1 evidence uses the real semantic source and assets:

- adapted JSON: 749,929 UTF-8 bytes, below the 1 MiB limit;
- mapping: `executed`;
- runtime validation: `run-valid`;
- diagnostics: 0 errors and 3 warnings;
- exact PDF: 10 pages and 1,417,544 bytes;
- PDF SHA-256:
  `d8b3b45c4364639a8eb71fd13510fd1cbb8661d4a57ecc97d76aa23fb1688b61`;
- verified download: true; and
- mapped values returned to Editor: false.

Desktop 1280 x 720 and mobile 390 x 844 Editor QA have no horizontal page
overflow and no browser-console warning/error. A full 200-page export was not
run; that remains `PDF-EXPORT-REALDOC-G`.

## Explicitly Not Changed

- no production route, provider, deployment, credential, or activation;
- no default Backend application-server mount;
- no durable Published Structure or protected generation repository;
- no Draft Preview identity or admission path;
- no Form-draft-to-canonical admission contract;
- no mapped-value hydration back into generated Form controls; and
- no claim that the complete 200-page document is accepted.

## Risks

- The current E.5.6 runtime and context registry are local and process-memory
  only.
- The 732 KiB JSON editor proves the accepted bound but remains an expensive UI
  surface for repeated editing; lifecycle/performance hardening belongs to
  E.5.8 and full scale remains REALDOC-G.
- Form hydration from mapped values needs a separate protected preview contract
  so E.3 does not lose its non-exposure guarantee.

## Next Phase

`PDF-EXPORT-REALDOC-E.5.7` owns Draft Preview with an immutable local draft
identity that cannot masquerade as a Published Structure Version. E.5.8 then
completes lifecycle UX and performance hardening; E.5.9 owns Form/API parity.
Production remains NO-GO.
