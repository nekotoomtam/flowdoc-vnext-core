# Structure Authoring V4 Transport Close Audit

Status: Phase 281 cross-repo close audit.

## Outcome

The bounded single-user `text-block.rich-inline.replace` contract now crosses
the intended repository path: editor intent, backend transport and revision
gate, core semantics, backend persistence receipt, and editor stale-gated
apply. This closes transport integration for Structure Definition draft text;
it does not make document v4, the WYSIWYG editor, mixed pagination, or artifact
output product-ready.

## PASS

- Backend request parsing accepts only a text-block id and strict v4 inline
  children; clients do not submit Structure Policy or session permissions.
- Backend checks request id replay and base revision before calling core.
- Migrating to package 3/document 4 creates backend-owned draft identity,
  draft field contract, and Structure Policy context.
- Accepted v4 writes advance package and draft-context revision together in
  the in-memory repository.
- Mutation receipts return exact replay without another core call or revision
  advance and reject request-id reuse with a different payload.
- Editor capability reporting distinguishes backend contract version 4 from
  the independent core capability contract version.
- Editor inline children cross the core package boundary only through
  `src/core/coreAdapter.ts` grammar validation.
- Editor can build v4 rich-inline intent and stale-apply accepted/replayed
  mutation envelopes while preserving selection on the text block.
- `canOpenTextDraft` remains false; no incomplete WYSIWYG surface was enabled.

## FAIL / BLOCKER

- No editor-local text draft, DOM/IME, clipboard, composition, or cross-page
  selection runtime exists.
- No concrete v4 measurement engine executes measurement packets.
- No columns parallel-flow or table row/cell split composer consumes retained
  text fragments.
- No mixed-node paginator, v4 renderer/export adapter, or artifact workflow is
  complete.
- Backend authoring context and mutation receipts are not durable production
  storage.

## RISK

- Complete rich-inline replacement remains single-user v1 behavior and is not
  safe evidence for collaboration or offline merge.
- Backend session actions are currently a service-owned permissive draft-author
  set; real authorization must derive them from authenticated product policy.
- In-memory atomicity proves ordering but not a production database
  transaction across package, context, and receipt.
- Capability operation lists are exact compatibility gates; adding another v4
  operation requires coordinated backend/editor contract changes.
- Isolated 250-page text evidence does not bound columns, tables, media,
  generated content, or renderer memory.

## UNKNOWN

- Production identity/permission source and audit actor model.
- Durable authoring-context schema, transaction strategy, and receipt
  retention policy.
- Browser draft reconciliation after reconnect or a concurrent stale result.
- Columns/table split policy and mixed 200-300 page performance thresholds.

## Cross-repo Evidence

- core rich replacement: `src/authoring/textBlockV4RichInlineReplace.ts`;
- core text readiness: `docs/TEXT_BLOCK_V4_READINESS_CLOSE_AUDIT.md`;
- backend integration: `flowdoc-vnext-backend@0f17be1`;
- backend service/storage tests: `src/tests/mutationService.test.ts` and
  `src/tests/migrationHttp.test.ts` in the backend repository;
- editor integration: `flowdoc-vnext-editor@24cf0d5`; and
- editor boundary/integration tests: `src/tests/boundary.test.ts`,
  `src/tests/versionCapability.test.ts`, and `src/tests/v4ReadOnly.test.ts` in
  the editor repository.

## Intentionally Not Changed

- core package v2/document v3 active behavior;
- core v4 authored schema or rich replacement semantics;
- visible editor text controls or `contenteditable`;
- auth, tenancy, production database, deployment, or collaboration;
- columns/table semantics, mixed pagination, renderer, and export.

## Next Recommended Direction

Define columns parallel child cursors and height reconciliation over retained
text fragments, then define table cell/row split policy. Keep editor DOM/IME
activation and concrete measurement execution as separate gated workstreams.
