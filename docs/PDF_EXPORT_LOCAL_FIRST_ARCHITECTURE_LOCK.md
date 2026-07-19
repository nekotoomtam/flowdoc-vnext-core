# PDF Export Local-First Runtime Architecture Lock

Status: `PDF-EXPORT-LOCAL-A` through `PDF-EXPORT-LOCAL-G` accepted for the
bounded canonical local-integration lane. This includes the controlled
renderer, PostgreSQL/S3-compatible providers, durable worker, separate
loopback HTTP process, development-only Editor workflow, and readiness audit.
No default application-server mount, product-document lane, deployment, or
production binding is activated.

## Decision

FlowDoc will qualify the accepted `PDF-EXPORT-V-A` through `V-G` contracts in
one local-only runtime before selecting paid or hosted production providers.
The local runtime must exercise the real request, lifecycle, renderer,
persistence, terminal replay, status, cancellation, and download boundaries.
It must not weaken those boundaries for convenience or claim that local
evidence proves production scale, security, availability, or operations.

The local lane has no recurring service cost. It consumes only developer
machine CPU, memory, disk, and local container runtime resources. Image tags,
schema versions, ports, and local credentials will be pinned in the owning
implementation phases rather than selected by this architecture-only phase.

## Runtime Profiles

| Profile | Purpose | Allowed providers | Network boundary | Production claim |
| --- | --- | --- | --- | --- |
| unit | deterministic contract and fault tests | in-memory, SQLite, temporary filesystem | no listener | none |
| local-integration | end-to-end developer qualification | local PostgreSQL and local S3-compatible object storage | loopback only | none |
| production | future hosted runtime | unselected | unselected | blocked |

The local-integration profile must fail closed when PostgreSQL, object storage,
the renderer resource resolver, or the worker is unavailable. It must not
silently fall back to in-memory, SQLite, temporary files, remote services, or
fixture substitution.

## Local Topology

```text
Editor on 127.0.0.1:4001
  -> same-origin development proxy
  -> local PDF HTTP process on 127.0.0.1
       -> credential-derived local identity and per-action authorization
       -> trusted source/admission resolver
       -> PostgreSQL metadata repositories

Local PDF worker process
  -> PostgreSQL due-work claim and lifecycle transitions
  -> eligible measured-contract/resource resolver
  -> qualified local renderer adapter
  -> S3-compatible local content-addressed byte store
  -> PostgreSQL artifact/job and terminal event transactions

Editor
  <- redacted status, cancellation result, or verified terminal download
```

The existing backend `src/server.ts` and `src/http/server.ts` remain unchanged
default product-server entry points. The local PDF HTTP process and worker use
dedicated opt-in entry points and commands. Importing a PDF module must never
start a listener, timer, poll loop, worker, database migration, or cleanup.

`LOCAL-E` must retain a separate local composition evidence record with at
least these facts:

- `runtimeProfile = local-integration`;
- `localServerMounted = true`;
- `defaultApplicationServerMounted = false`;
- `listenerScope = loopback-only`;
- `workerStart = dedicated-command`;
- `remoteProviderCallsAllowed = false`; and
- `productionBinding = false`.

The V-G response field `applicationServerMounted = false` continues to mean
that the route candidate is not wired into the default product application
server. The local evidence record proves its separate opt-in mount. Likewise,
the injected local test authenticator/authorizer does not select a concrete
production identity provider and cannot change V-G activation facts.

## Request And Execution Sequence

The V-A runtime sequence remains authoritative. The local runtime adds concrete
composition without changing its order:

1. Editor sends only `documentId` and exact `documentRevision`, plus a caller
   idempotency key, through the same-origin development proxy.
2. The local authenticator derives one local tenant/principal identity from an
   injected credential. Caller identity remains forbidden in the body.
3. The local authorizer evaluates request, read, cancel, and download actions
   independently.
4. A trusted resolver loads the exact source identity, measured draw contract,
   renderer resources, and bounded policy. Editor data cannot supply or repair
   these trusted facts.
5. The route admits or exactly replays one durable operation and returns
   without rendering inline.
6. The local worker discovers due work, owns one bounded claim, rechecks source
   and lifecycle state, and invokes only an eligible renderer adapter.
7. Verified bytes are published before artifact/job metadata. Terminal events
   and workflow completion follow the accepted V-E/V-F transaction rules.
8. Status remains redacted. Download requires the exact terminal completion,
   persistence receipt, operation, and physical byte length/SHA-256 agreement.

## Cross-Repo Ownership

### Core

Core remains the source of truth for document semantics, exact source/request/
measured-contract identity, admission, renderer handoff, receipt, render
completion, resource policy, commit-order rules, and activation blockers.

Core must not import HTTP, PostgreSQL, object-storage, queue, React, browser,
credential, filesystem execution, or process-hosting concerns.

### Backend

Backend owns local composition and all service execution:

- local profile configuration and fail-closed startup checks;
- authenticator, authorizer, and trusted admission/resource resolver adapters;
- PostgreSQL operation, lifecycle, queue, persistence, and observability
  repositories;
- S3-compatible content-addressed byte storage;
- renderer adapter qualification and worker hosting;
- local HTTP entry point, status/cancel/download behavior, and shutdown drain;
- versioned schema migrations and explicit local reset tooling.

Provider-specific clients must remain behind the existing provider-neutral
repository and content-store interfaces. Provider fields, SDK response shapes,
bucket names, database row ids, and local credentials must not enter Core or
public Editor contracts.

### Renderer

`FlowDocBackendPdfExportRendererV1` is the accepted generic renderer SPI. The
local adapter may reuse or extract implementation from
`packages/pdf-renderer-pilot`, but it must consume only the exact Core renderer
input and injected resource bytes. It may not remeasure, repaginate, relayout,
or regroup semantics.

The adapter must implement bounded asynchronous checkpoints over paint-command
progress. A wrapper that calls the current synchronous pilot once and checks
cancellation only before and after the call is not accepted. Local
qualification retains `concreteProductionRendererSelected = false` and
`productionBinding = false`.

### Editor

Editor owns export eligibility presentation, request intent, redacted status
polling, cancellation intent, terminal download, retry affordances, and stale
document-revision handling. It must use the Backend route and must not import
renderer, storage, queue, or backend implementation modules.

The development proxy keeps browser requests same-origin and injects only the
explicit local credential. The production build must not receive that proxy or
credential configuration.

## Eligibility Lanes

The first local renderer integration is an evidence lane, not arbitrary
document export:

1. `canonical-evidence` resolves the retained Phase T canonical source,
   measured contract, fonts, images, and policy by exact identity. This proves
   the full runtime composition using known deterministic PDF bytes.
2. `product-document` opens only when the requested document revision can
   produce a complete measured draw contract and all digest-bound resources
   through trusted resolvers. Missing measurement, unsupported paint commands,
   resource drift, or unsupported profiles return an explicit ineligible or
   rejected state before operation admission.

Editor controls must be disabled when the local capability/eligibility result
does not accept the current document and revision. Fixture substitution for an
ineligible product document is forbidden.

## Local Durability Lock

The local-integration profile uses PostgreSQL for durable metadata and a local
S3-compatible object store for PDF bytes. SQLite and filesystem adapters remain
unit/restart evidence and are not the local-integration provider lane.

The provider implementations must preserve:

- immutable scoped caller-key admission and exact replay;
- compare-and-swap lifecycle revisions and transition receipts;
- one due-work claim winner with bounded lease/reclaim behavior;
- byte publication under SHA-256 content identity before metadata;
- physical byte length/SHA-256 verification after write and before download;
- manifest-before-job ordering inside one metadata transaction;
- atomic terminal event batch and workflow completion;
- restart and competing-connection evidence at every commit boundary; and
- resumable bounded orphan enumeration, so later objects cannot starve behind
  one repeatedly scanned prefix.

Local data paths, database volumes, buckets, and credentials must be ignored by
Git. Reset is an explicit developer command and must refuse non-local targets.

## Local Worker Lock

The route never renders inline and never starts a worker. A dedicated local
worker command owns a bounded poll loop over durable due work. The first
accepted profile uses concurrency `1`; concurrency changes require new measured
evidence.

The worker must provide bounded polling/backoff, claim expiry/reclaim, attempt
limits, deadline checks, cooperative cancellation, terminal replay, and the V-C
shutdown-drain order. Process restart must not duplicate terminal persistence.
No external queue or paid broker is required for this local lane.

## Local Transport And Security Lock

- All listeners and provider ports bind to loopback only.
- The local profile requires an explicit local runtime mode and refuses an
  unspecified, production, or non-loopback host.
- The existing V-G closed request body, body-size cap, `no-store`, `nosniff`,
  authorization per action, scope concealment, and verified download rules
  remain unchanged.
- No permissive PDF-route CORS policy is added. Editor development uses a
  same-origin proxy.
- Local credentials are test credentials, never production secrets. They are
  not committed, logged, placed in request bodies, or embedded in artifacts.
- Source text, PDF bytes, raw tenant/principal values, credentials, and
  provider secrets remain forbidden from observability events.

## Phase Order

| Phase | Accepted outcome | Repositories | Still blocked |
| --- | --- | --- | --- |
| `LOCAL-A` | this architecture and profile lock | Core, referenced by Backend/Editor | all execution |
| `LOCAL-B` | generic SPI audit plus canonical local renderer adapter with cooperative checkpoints | Core pilot, Backend | storage, worker, route mount, Editor |
| `LOCAL-C` | PostgreSQL metadata and S3-compatible byte adapters with migration/restart/fault evidence | Backend | worker, route mount, Editor |
| `LOCAL-D` | durable due-work discovery and dedicated local worker lifecycle | Backend | route mount, Editor |
| `LOCAL-E` | loopback-only local PDF HTTP entry point and composition harness | Backend | Editor, readiness, production |
| `LOCAL-F` | Editor eligibility/request/status/cancel/download integration through development proxy | Editor, Backend contract tests | readiness, production |
| `LOCAL-G` | end-to-end restart, cancellation, corruption, fidelity, and bounded load audit | all three | production selection |

Each phase must retain focused failure/replay evidence and the full owning-repo
gate. A later local phase cannot silently repair an earlier failed boundary.

## LOCAL-B Follow-Up

The V-D generic renderer SPI is sufficient and remains unchanged. LOCAL-B adds
controlled one-page and canonical full-document execution to the private pilot,
separates its renderer-only package surface from canonical preparation tools,
and adds a Backend local adapter with injected trusted resource resolution.

Portable tests prove byte parity, bounded checkpoints, cancellation without
partial output, resource failure, and V-D receipt/completion integration. The
canonical 13-page workload retains its exact `1212656` bytes and SHA-256 while
checking 30 times with a maximum 64-command gap. Storage, worker hosting, route
mounting, Editor integration, and production renderer selection remain closed.

Primary follow-up evidence is retained in
`../flowdoc-vnext-backend/docs/PDF_EXPORT_LOCAL_RENDERER_ADAPTER.md`.

## LOCAL-C Follow-Up

Backend now implements the V-B through V-F metadata interfaces with
loopback-only PostgreSQL and the byte-store interface with a loopback-only
S3-compatible provider. Schema migration and bucket setup are explicit;
importing or opening provider modules never starts migration, cleanup, a
listener, or a worker.

Real PostgreSQL/MinIO evidence proves restart replay, one caller-key owner, one
lifecycle claim owner across competing pools, transaction fault recovery,
physical byte verification, and bounded resumable orphan enumeration. Pinned
Compose and portable actual-provider harnesses are available; neither permits
remote targets or changes `productionBinding = false`.

Primary follow-up evidence is retained in
`../flowdoc-vnext-backend/docs/PDF_EXPORT_LOCAL_POSTGRES_S3_ADAPTERS.md`.

## LOCAL-D Follow-Up

Backend now exposes bounded read-only PostgreSQL due-work discovery for
pending, expired-claim, and stopped-without-terminal lanes. A concurrency-one
runner rechecks terminal and immutable operation evidence, owns work through
the accepted lifecycle CAS, reconciles uncertain claim/release outcomes, and
finalizes stopped lifecycle evidence after restart without rendering.

The worker host starts only through an explicit call, uses fresh bounded scans,
bounded poll/backoff, graceful drain, durable force shutdown, and one resumable
orphan-maintenance page after due work. A dedicated command boundary exists but
fails closed until LOCAL-E supplies its concrete trusted composition factory.
No route, default server, Editor, external queue, or production binding opens.

Real PostgreSQL/MinIO evidence retains one execution owner after two pools
observe the same due page, reclaims an expired claim after provider restart,
and finishes stopped terminal evidence without duplicate render/persistence.

Primary follow-up evidence is retained in
`../flowdoc-vnext-backend/docs/PDF_EXPORT_LOCAL_DURABLE_WORKER.md`.

## LOCAL-E Follow-Up

Backend now supplies a concrete local composition over the accepted
PostgreSQL, S3-compatible store, canonical renderer, and durable worker
boundaries. The trusted resolver accepts only the retained canonical document
revision and verifies the Core bundle, font manifests, font source/subset
bytes, and five image digests before startup succeeds. Product-document and
fixture-substitution lanes remain closed.

The dedicated HTTP process starts only through an explicit call and binds to
IPv4 loopback. Its evidence records the local profile, separate server mount,
default-server exclusion, dedicated worker command, remote-provider denial,
no CORS, and non-production binding. The existing default Backend server is
unchanged.

Actual PostgreSQL 17.10 and pinned MinIO evidence uses independent HTTP and
worker connections to prove admission without inline render, due-work
execution, exact 13-page persistence, redacted completed status, physically
verified download, and exact replay without another render. The portable
provider lane passes `20/20`.

Primary follow-up evidence is retained in
`../flowdoc-vnext-backend/docs/PDF_EXPORT_LOCAL_HTTP_COMPOSITION.md`.

## LOCAL-F Follow-Up

Backend now exposes an authenticated, no-store exact-pin eligibility contract
only on the separate local PDF listener. It classifies the retained canonical
revision as eligible, another revision as stale, and all other documents as
ineligible without admitting an operation. The response remains redacted and
adds no CORS.

Editor now checks that contract against the exact current fresh working-set
pin, submits only the two-field document pin with a retained caller
idempotency key, polls redacted operation status, exposes independent
cancellation intent, accepts only verified terminal PDF downloads, and resets
all intent when the document revision changes. Invalid or expanded public
responses fail closed.

The Vite proxy exists only for an exact local `serve` profile, injects the
uncommitted bearer inside the Node proxy process, and strips the proxy prefix
before forwarding to the loopback PDF listener. Browser code receives no
credential. Build and preview configurations receive no PDF proxy even when
the local environment values exist.

The normal Editor product document remains ineligible because LOCAL-E still
accepts only the Phase T canonical evidence source. Editor does not override
the working-set pin or substitute that fixture. LOCAL-G accepts the canonical
readiness/fault/load evidence; an eligible browser lifecycle over a trusted
product-readable working set remains for a later product-document lane.

Primary follow-up evidence is retained in
`../flowdoc-vnext-editor/docs/PDF_EXPORT_LOCAL_EDITOR_INTEGRATION.md` and
`../flowdoc-vnext-backend/docs/PDF_EXPORT_LOCAL_HTTP_COMPOSITION.md`.

## LOCAL-G Follow-Up

The portable actual-provider gate now executes the exact canonical request and
download in one Node process, exits it, and performs caller-key replay, status,
worker, and byte-identity checks in a fresh process over the same PostgreSQL and
MinIO state. The replay invokes no renderer or persistence work. Actual HTTP
cancellation before handoff produces no object; retained focused tests cover
before-render, mid-render, and before-persistence cancellation.

Actual MinIO deletion and corruption between write and readback both block
artifact metadata and terminal workflow completion. Canonical resource digest
drift blocks composition before admission or renderer creation. Existing
competing-connection and bounded continuation evidence retains one claim/
persistence owner and orphan traversal without prefix starvation.

The accepted 2026-07-19 workload measured 3315 ms wall time, 3110 ms CPU,
370290688 peak RSS bytes, 227958784 RSS-growth bytes, 16 PDF metadata rows,
655360 relation bytes, one 1212656-byte object, and seven HTTP requests. Every
value is below the versioned LOCAL-G guardrail. These are local qualification
facts, not production SLO, scale, cost, or availability claims. The actual
provider suite passes `24/24`.

Primary follow-up evidence is retained in
`../flowdoc-vnext-backend/docs/PDF_EXPORT_LOCAL_READINESS_AUDIT.md`.

## Real Document Follow-Up

`PDF-EXPORT-REALDOC-A` pins the exact external 69C UAT PDF, semantic roots,
and aggregate image set without copying source bytes into a repository. It
selects section 2.1 as the first bounded product-readable slice and preserves
the page-free source limitations explicitly. The roadmap is retained in
`docs/PDF_EXPORT_REAL_DOCUMENT_ROADMAP.md`.

REALDOC-A does not make the normal Editor document eligible and does not alter
the LOCAL-G canonical resource envelope. REALDOC-B must first define a
source-neutral UAT Structure Definition and source-specific adapter before a
measured product-readable contract can enter the existing local runtime.

REALDOC-B now accepts that Structure Definition and adapter boundary. The
adapter returns canonical pinned snapshot inputs but does not materialize or
resolve a document. REALDOC-C must perform the revision-zero materialization,
generated collection-row resolution, and explicit screenshot-placement
decision before any measured contract can be admitted.

REALDOC-C now accepts that deterministic revision-zero resolution boundary.
Screenshot rows follow the complete requirement table in source order, and all
17 collection rows retain exact source-to-instance provenance. REALDOC-D must
measure those rows and images before any page or artifact claim can enter the
local runtime.

REALDOC-D now accepts that measured local boundary. Native rustybuzz and ICU4X
evidence feeds Core table preparation, requirement pagination, repeated
headers, seven whole screenshot rows, and an A4 measured draw
contract. A separate bounded `local-measured-document` profile returns exact
bytes through both Core and Backend adapters, cancels without partial bytes,
and reproduces the same receipt in a fresh process. It does not weaken the
canonical LOCAL-G profile or activate persistence, DocGen admission, hosted
providers, or production.

REALDOC-D.1 now inserts a fingerprinted imported-text normalization step before
resolution. It folds 82 source-PDF layout wraps while retaining 58 semantic
paragraph/list boundaries. The exact section contracts from four to three
requirement pages and from 11 to 10 total pages without changing table widths,
the shared line breaker, renderer limits, Backend behavior, or production
status.

REALDOC-E.0 now realigns the next lane with the Phase 268 Structure Definition
north star. The Editor authors reusable Structure Definitions; imported test
data is a pre-test caller of the same mapping and generation contracts used by
external API clients. REALDOC-E must not turn the Editor into a primary
Document Instance editor or map business values directly to page coordinates.
Field definitions, presentation placements, caller-owned data, resolved facts,
and artifact truth remain separate. The accepted order is retained in
`docs/PDF_EXPORT_REALDOC_DOCGEN_ARCHITECTURE_LOCK.md`.

REALDOC-E.1 now accepts a pure Core planning envelope for one exact Published
Structure generation data contract and Backend-owned instance. Direct canonical
snapshots stop at runtime validation; adapted JSON payload descriptors stop at
mapping. Raw payload values, layout facts, renderer facts, and browser-owned
mapping do not enter the plan. Runtime mapping and validation remain E.2.

## Local Readiness Exit Gate (Accepted)

`LOCAL-G` closes because retained evidence proves:

- exact canonical request-to-download byte identity across process restart;
- no render on exact terminal replay;
- cancellation before handoff, before render, during render, and before
  persistence;
- stale source/profile/resource rejection before unsafe work;
- one claim/persistence winner under competing worker connections;
- no terminal metadata for missing or corrupted bytes;
- resumable bounded orphan cleanup without prefix starvation;
- Editor revision/eligibility gates and redacted status behavior;
- bounded CPU, memory, time, database, and object-store usage for the accepted
  local workload; and
- no non-loopback listener, remote provider call, production flag, default
  server mount, or committed credential.

## Production Promotion Rule

Local acceptance cannot promote a provider or flip a production binding.
Production selection begins only after `LOCAL-G` and requires a separate review
covering identity policy, threat model, provider cost, SLOs, capacity,
retention/deletion, backups, disaster recovery, secrets, TLS/proxy/rate limits,
deployment, monitoring/alerting, and rollout/rollback.

No production phase is named by `LOCAL-A`.

## RISK

- Controlled checkpoints bound paint-command serialization, but trusted
  resource resolution and synchronous contract preparation occur before the
  first renderer checkpoint. LOCAL-D can durably force-stop the lifecycle, but
  synchronous preparation cannot be preempted until control returns.
- The accepted renderer lane remains fixture-specific. Arbitrary product
  documents stay blocked until trusted measurement and resource resolution can
  create their complete exact handoff.
- V-B through V-F intentionally span multiple repository transactions;
  PostgreSQL adapters still require failure monitoring and reconciliation.
- The worker schedules the accepted object-store cursor in memory. Restart
  safely begins a new bounded sweep from the first page.
- Local PostgreSQL/object-storage success does not prove hosted latency,
  multi-region behavior, backup recovery, or production cost.

## UNKNOWN

- Which product documents first satisfy complete measured-contract and
  resource eligibility beyond the canonical evidence fixture.
- Measured worker poll/backoff and maintenance tuning under the accepted local
  workload.
- Production identity, database, object-store, telemetry, queue, and hosting
  providers.

## Intentionally Not Changed

- Core document, pagination, measured draw, handoff, receipt, admission, or
  render-completion schemas.
- Existing V-B through V-G repository, route, workflow, and security contracts.
- Default Backend server wiring or development CORS behavior.
- Editor source, controls, transport, or build configuration.
- Production renderer/provider selection, deployment, or activation flags.

Primary prior evidence:

- `docs/PDF_REAL_EXPORT_HANDOFF.md`;
- `docs/PDF_EXPORT_PRODUCTION_BASELINE.md`;
- `docs/PDF_EXPORT_V_ARCHITECTURE_LOCK.md`;
- `../flowdoc-vnext-backend/docs/PDF_EXPORT_AUTHENTICATED_ROUTE_ACTIVATION_REVIEW.md`;
- `../flowdoc-vnext-backend/src/pdfExport/pdfExportRendererAttempt.ts`;
- `../flowdoc-vnext-backend/src/pdfExport/pdfExportWorkflow.ts`; and
- `../flowdoc-vnext-backend/src/pdfExport/pdfExportHttpHandler.ts`.
