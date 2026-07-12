# V4 Integrated Document Stress Readiness Close Audit

Status: Phase 365 close audit.

## Outcome

The bounded v4 integrated document stress gate is ready. One test-only evidence
bundle exercises real document structure, Text-block, depth-three Columns,
synchronized Table, Table renderer-neutral, and complete pure TOC contracts
without inventing a whole-document composer, integrated page count, production
heading map, artifact, persistence result, or editor state.

Smoke, medium/large scale, localized invalidation, failure/recovery, and all
three repository gates pass. This is strong contract-composition evidence, not
production document-generation readiness.

## PASS

- The capability matrix distinguishes `executable`, `contract-only`, and
  `expected-blocked` lanes and no unavailable producer is mocked as ready.
- The shared `integrated-v4-stress-v1` document is structure-valid and reuses
  exact identities across independently executable lanes.
- Text-block, nested Columns, synchronized Table, Table renderer-neutral facts,
  and TOC semantic/measurement/pagination/resolution execute through public core
  APIs.
- Synthetic Table materialization and heading-page-map evidence is labeled and
  never treated as production provenance.
- Smoke output is byte-stable, source-immutable, retains six blockers, and keeps
  `integratedPageCount=null`.
- Medium and large workloads retain exact local page/work facts without adding
  unrelated local page counts together.
- The large matrix executes 6,000 Text-block lines, 6,000 depth-three Columns
  fragments, 1,000 Table rows, and 1,000 TOC headings.
- Large local evidence includes 250 Text-block pages, 250 Columns pages, 250
  Table pages, and 143 TOC pages, all explicitly lane-local.
- Exact large work remains linear: Columns performs 750 lane/500 nested plans;
  Table performs 1,250 row/cell/candidate plans; TOC performs 1,002 semantic/
  measurement visits and 1,000 resolution joins.
- Real combined scale exposed final TOC retained-output amplification that
  isolated short-fingerprint fixtures had hidden.
- Final TOC resolution now validates raw ownership, retains browser-safe SHA-256
  top-level pins, omits repeated per-entry owner strings, and uses a compact
  final fingerprint.
- The same large matrix fell from more than three minutes/about 175 MB of final
  TOC resolution output to a bounded required-gate run below 10 KB per heading.
- Four localized mutations change only expected Text-block, Columns, Table/
  renderer, or TOC evidence; unrelated lane fingerprints remain byte-identical.
- TOC and Table owner impact contracts agree with observed reruns.
- Oversized text, stale cursors, missing media, capacity overflow, and stale map
  ownership fail or block readiness according to their owning contracts.
- TOC partial pagination resumes from the exact cursor to one-shot-equivalent
  pages and final cursor.
- Columns/Table recovery remains honestly all-or-blocked and accepted reruns are
  deterministic.
- Core, editor, and backend package boundaries remain intact and all full gates
  pass with clean worktrees.

## FAIL / BLOCKER

None for the bounded integrated core-contract stress gate.

Production integrated document output remains blocked by:

1. `mixed-body-composition`;
2. `whole-document-heading-page-map-production`;
3. `field-backed-toc-label-materialization`;
4. `integrated-renderer-artifact`;
5. `backend-stress-orchestration-persistence`; and
6. `editor-integrated-stress-ui`.

## Why Composition Is Next

Whole-document v4 composition is the first blocker in dependency order. It can
consume already accepted family-owned fragments without taking over
measurement, Table/Columns split semantics, field resolution, rendering,
persistence, or editor policy.

A composition contract would unlock three currently impossible evidence axes:

- one authoritative document page count instead of separate local counts;
- one first-fragment heading-page map for final TOC resolution; and
- one ordered renderer-neutral page plan across Text-block, Columns, Table,
  TOC, media, and utility families.

Field-backed TOC materialization can then feed accepted composed inputs and
bounded invalidation. Renderer, backend, and editor lanes can consume the
retained composition artifact later without moving their responsibilities into
core.

## Composition Requirements From Stress Evidence

- Accept only family-owned measured/paginated fragments and exact compact owner
  pins; never remeasure or relayout inside the composer.
- Preserve canonical body order, section/zone ownership, heading first-fragment
  identity, family continuation, and page remainder.
- Expose a bounded, fingerprint-pinned cursor with partial progress and exact
  one-shot/resume equivalence from its first version.
- Produce a compact fingerprinted document page plan and authoritative heading-
  page map together so they cannot drift.
- Keep local family pages as evidence inputs, not as document page indexes.
- Make forced overflow, missing media, unsupported family, and no-progress
  states explicit and atomic.
- Retain exact work counters and avoid nested content-sized fingerprints.
- Support localized invalidation/page-tail reuse without pretending unchanged
  pages are valid after owner drift.
- Remain renderer-neutral and leave scheduling, persistence, retries, UI, and
  artifact bytes external.

## RISK

- Upstream semantic, measurement, cursor, and manifest contracts still contain
  content-sized JSON fingerprints internally; final TOC compaction solved the
  observed output amplification but not every temporary allocation.
- Test-local synthetic maps/media prove contract behavior, not production
  provenance, storage, decode, or visual fidelity.
- Whole-result evidence fingerprints identify lane change but not the smallest
  reusable fragment.
- Columns and Table lack bounded partial-output orchestration despite correct
  all-or-blocked local behavior.
- Local file dependencies do not prove packed/published package parity.

## UNKNOWN

- Production memory/time ceilings for real 200-300 page mixed documents.
- Exact mixed-composer family adapter and scheduling boundary.
- Page-tail reuse thresholds after local mutation.
- Field-backed heading materialization/second-cycle policy.
- Production font shaping, media decoding, renderer streaming, durable cursor
  expiry, worker recovery, and artifact storage profiles.

## Files Changed

- Architecture, smoke, scale, invalidation, failure/recovery, cross-repo, and
  close-audit documents/tests.
- Shared test-only smoke and scale helpers.
- Internal browser-safe compact SHA-256 helper.
- Final TOC resolution entry references, top-level pins, and final fingerprint.
- README, phase ledger, and cross-repo operating map.

## Behavior Changed

- Final TOC retained output uses compact SHA-256 top-level ownership pins and no
  longer repeats content-sized fingerprints per entry.
- All other integrated stress behavior is test evidence only; existing family
  layout, authoring, backend, and editor runtime behavior remains unchanged.

## Tests Run

- Final core: type-check and 291 test files / 1,462 tests.
- Editor: type-check, 27 test files / 157 tests, and production build.
- Backend: type-check, 13 test files / 45 tests, and TypeScript build.

## Risks Left

- No real integrated page count or authoritative production heading-page map.
- No field-materialized final TOC artifact path.
- No mixed renderer/export artifact or production visual fidelity evidence.
- No backend composition job/storage/resume or editor integrated progress/UI.
- No packed-package or production resource-profile evidence.

## Intentionally Not Changed

- canonical package/document schemas and version activation;
- family-owned Text-block, Columns, Table, TOC, and media semantics;
- document v3 pagination/renderer paths;
- field resolution/materialization policy;
- PDF/DOCX/preview artifact production;
- backend routes/storage/workers/auth/tenancy;
- editor canvas/viewport/selection/WYSIWYG/undo UI.

## Next Recommended Direction

Open the Whole-Document V4 Composition Architecture Lock. Define ordered
family-fragment inputs, compact ownership pins, bounded cursor/resume, page
remainder/section policy, document page-plan output, and authoritative heading-
page-map production before implementing a renderer or product workflow.
