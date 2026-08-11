# Risk register

## RISK-CORE-DOCUMENTATION-STALE-SOURCE-001 — Stale source evidence
<!-- FLOWDOC-RECORD
{"recordId":"RISK-CORE-DOCUMENTATION-STALE-SOURCE-001","recordKind":"risk","lifecycle":"active","affects":["DOC-CORE-PROJECT-CURRENT-STATE"]}
-->

### Adverse event

Project decisions rely on evidence that no longer describes the inspected source.

### Trigger

An implementation change lands without a corresponding current-state review.

### Affected IDs

- [DOC-CORE-PROJECT-CURRENT-STATE](CURRENT_STATE.md)

### Mitigation

Require an evidence review whenever the canonical source changes.

### Evidence

The current-state record identifies the selected source and its limits.

### Lifecycle

`active`

## RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001 — Dual authoritative prose
<!-- FLOWDOC-RECORD
{"recordId":"RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001","recordKind":"risk","lifecycle":"active","affects":["DOC-CORE-NAVIGATION-MANIFEST"]}
-->

### Adverse event

Conflicting documents direct readers to different canonical sources.

### Trigger

An unregistered document is treated as authoritative.

### Affected IDs

- [DOC-CORE-NAVIGATION-MANIFEST](../manifest.json)

### Mitigation

Keep ownership in the manifest and validate authored references.

### Evidence

The documentation checker closes registered identities and paths.

### Lifecycle

`active`

## RISK-CORE-DOCUMENTATION-TEST-COUPLING-001 — Coupled validation evidence
<!-- FLOWDOC-RECORD
{"recordId":"RISK-CORE-DOCUMENTATION-TEST-COUPLING-001","recordKind":"risk","lifecycle":"active","affects":["DOC-CORE-NAVIGATION-DOCUMENT-MAP"]}
-->

### Adverse event

Validation evidence drifts from the generated navigation view.

### Trigger

An authored identity changes without the focused checker coverage changing.

### Affected IDs

- [DOC-CORE-NAVIGATION-DOCUMENT-MAP](../DOCUMENT_MAP.md)

### Mitigation

Exercise the production documentation commands from focused fixtures.

### Evidence

The spine test invokes generation and checking through their entrypoints.

### Lifecycle

`active`

## RISK-CORE-DOCUMENTATION-PACKAGE-SURFACE-001 — Broad package boundary
<!-- FLOWDOC-RECORD
{"recordId":"RISK-CORE-DOCUMENTATION-PACKAGE-SURFACE-001","recordKind":"risk","lifecycle":"active","affects":["DOC-CORE-VERSION-0-1-RELEASE-COMPOSITION"]}
-->

### Adverse event

Release composition is inferred from a broader package surface than the approved boundary.

### Trigger

Public package documentation remains incomplete while release claims expand.

### Affected IDs

- [DOC-CORE-VERSION-0-1-RELEASE-COMPOSITION](../versions/0_1/release.json)

### Mitigation

Keep release selectors empty until the package release boundary is closed.

### Evidence

The current release composition has no capability, contract, or gate selectors.

### Lifecycle

`active`

## RISK-FLOWDOC-COORDINATION-DUAL-OWNER-001 — Dual coordination ownership
<!-- FLOWDOC-RECORD
{"recordId":"RISK-FLOWDOC-COORDINATION-DUAL-OWNER-001","recordKind":"risk","lifecycle":"active","affects":["DOC-FLOWDOC-COORDINATION-BOUNDARY"]}
-->

### Adverse event

Core and a future coordination repository claim the same coordination authority.

### Trigger

A transfer leaves two concurrent owners for one record.

### Affected IDs

- [DOC-FLOWDOC-COORDINATION-BOUNDARY](../coordination/BOUNDARY.md)

### Mitigation

Require one-owner atomic relocation for any coordination transfer.

### Evidence

The boundary document forbids `dual-active` copies.

### Lifecycle

`active`

## RISK-FLOWDOC-COORDINATION-BASELINE-GHOST-001 — Ghost prerelease input
<!-- FLOWDOC-RECORD
{"recordId":"RISK-FLOWDOC-COORDINATION-BASELINE-GHOST-001","recordKind":"risk","lifecycle":"active","affects":["DOC-CORE-VERSION-0-1-RELEASE-COMPOSITION"]}
-->

### Adverse event

An unpublished `baseline` is mistaken for an approved package release input.

### Trigger

`pending-baseline` evidence is copied into release composition without its gate.

### Affected IDs

- [DOC-CORE-VERSION-0-1-RELEASE-COMPOSITION](../versions/0_1/release.json)

### Mitigation

Retain explicit `pending-baseline` handling and deny automatic release promotion.

### Evidence

Release composition remains planned, unversioned, and not releaseable.

### Lifecycle

`active`
