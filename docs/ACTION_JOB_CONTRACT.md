# Action And Job Contract

Status: Phase 26 design baseline.

This document defines the action/job vocabulary for FlowDoc vNext. It is a
coordination contract for future frontend and backend runtimes, not a job queue
implementation.

## Terms

| Term | Meaning |
|---|---|
| Action | A user or system event such as typing, inserting a field, saving, or requesting PDF generation. |
| Command | A discrete core operation or transaction that may mutate the working document. |
| Transaction | A granular authoring command with validation, dirty scope, and history intent. |
| Intent | The user-facing reason for one or more transactions, used for history/undo grouping. |
| Job | Scheduled work produced by an action, often background or deferred. |
| Workflow | Ordered jobs that together complete a larger task such as artifact generation. |
| Artifact | Derived output such as preview, renderer commands, PDF, DOCX, or storage reference. |

## Action Sources

Actions may come from different callers, but they must use the same contract:

| Source | Meaning | Requirements |
|---|---|---|
| user | direct human interaction in the editor | immediate feedback, undoable when mutating |
| automation | trusted product/system automation | audit trail, scoped permissions |
| ai | AI assistant or agent acting through approved tools | explicit allowed action, audit trail, approval gates where needed |
| system | internal runtime maintenance | diagnostic-only unless explicitly mutating |

AI is not a separate editor runtime. AI may propose or invoke approved actions,
but those actions must pass through the same command, transaction, history,
dirty-scope, live-layout, and generation contracts as user actions.

## Job Shape

Future runtime jobs should carry enough metadata to avoid stale work:

```ts
type RuntimeJob = {
  jobId: string;
  kind: string;
  triggerActionId: string;
  lane: "immediate" | "background-live" | "deferred-exact" | "external-artifact";
  priority: "user-blocking" | "visible" | "background" | "idle";
  documentRevision?: number;
  dataRevision?: number;
  measurementProfileId?: string;
  cancelPolicy: "replace-by-newer" | "finish-if-started" | "must-complete";
  stalePolicy: "drop-if-revision-changed" | "diagnostic-only" | "not-staleable";
};
```

The exact TypeScript shape can be implemented later. The contract here is that
jobs must name their lane, revision assumptions, cancel policy, and stale
policy before they are allowed to affect visible state or artifacts.

## Lanes

| Lane | Purpose | Examples | Blocking Rules |
|---|---|---|---|
| immediate | work needed for the current user action | local draft update, text transaction, history append | must stay small and synchronous where possible |
| background-live | visible authoring follow-up work | live layout visible range, diagnostics refresh | may be replaced by newer revisions |
| deferred-exact | deterministic full-output work | measured pagination, renderer command artifact | must not block active typing |
| external-artifact | app/server side effects | PDF bytes, DOCX bytes, storage write | must be idempotency/retry aware |

## AI-Callable Action Contract

AI support is one reason this action/job layer exists. Future AI tools should
not drive the editor by guessing DOM state or mutating authored data directly.
They should call approved actions and receive structured results.

Every AI-callable action must declare:

- action kind;
- allowed source: `ai`;
- required permission level;
- whether user approval is required;
- target scope;
- expected core command or workflow;
- audit record fields;
- rollback or undo availability;
- stale/cancel behavior.

Suggested permission levels:

| Permission | Description | Examples |
|---|---|---|
| read | inspect package/session/diagnostics only | summarize keys, list missing data |
| suggest | return proposed actions without applying them | suggest adding a field-ref |
| edit-safe | apply bounded template edits with undo history | insert field-ref, replace selected text |
| edit-structural | apply structural changes with approval | insert table, duplicate section |
| generate | request diagnostics or artifacts | run readiness, future PDF job |
| admin | manage templates, storage, or destructive actions | delete template, publish version |

Initial AI-callable action policy:

| Action | AI Policy | Approval | Notes |
|---|---|---|---|
| inspect diagnostics | allowed | no | read-only |
| suggest template edits | allowed | no | returns proposed action list |
| insert field reference | allowed with `edit-safe` | configurable | must use `inline.field-ref.insert` |
| replace selected text | allowed with `edit-safe` | configurable | must produce history record |
| change selection | allowed | no | non-durable |
| save template | restricted | yes | app persistence concern |
| generate diagnostics | allowed with `generate` | no | readiness-only in current core |
| render artifact | future restricted | yes | requires idempotency and storage policy |
| delete/large structural edit | restricted | yes | must be undoable or explicitly destructive |

AI action audit records should include:

```ts
type AiActionAudit = {
  actionId: string;
  source: "ai";
  modelOrAgentId?: string;
  promptSummary?: string;
  targetScope: string[];
  permission: string;
  approvalId?: string;
  producedCommandIds: string[];
  producedJobIds: string[];
  resultStatus: "applied" | "rejected" | "requires-approval" | "stale";
};
```

The audit shape is future-facing. The current requirement is that AI actions
must be traceable to approved actions, commands, jobs, diagnostics, and history
records.

AI must not:

- edit DOM or canvas state as the source of truth;
- write resolved data values into authored text;
- bypass key/data diagnostics;
- bypass text transaction validation;
- bypass history/dirty-scope creation for mutations;
- run exact layout or artifact rendering inside active typing;
- persist editor-only state into `DocumentNode`;
- publish stale job results over newer user work.

## Action Catalog

### `user.openTemplate`

```text
immediate
  -> parse canonical package
  -> create editable session
  -> build graph/key diagnostics

background-live
  -> initialize visible range
  -> schedule first live layout view
```

Must not accept current/prototype document shapes as canonical input.

### `user.typeText`

```text
immediate
  -> update local draft
  -> runVNextTextTransaction(text.insert | text.delete | text.range.replace)
  -> appendVNextAuthoringIntentHistoryResult
  -> mark dirty text-block scope

background-live
  -> resolveVNextLiveLayoutBoundary
  -> schedule visible live-layout job

deferred-exact
  -> mark exact generation stale
```

Must not exact-paginate, serialize the whole package, render offscreen pages, or
call generation APIs per keypress.

### `user.commitIme`

```text
immediate
  -> commit composition as one text transaction
  -> create one intent history group

background-live
  -> live layout affected visible range

deferred-exact
  -> mark exact generation stale
```

Composition updates before commit remain frontend-only draft state.

### `user.insertFieldRef`

```text
immediate
  -> validate selected registry key exists when available
  -> runVNextTextTransaction(inline.field-ref.insert)
  -> append one command intent group

background-live
  -> live layout text-block/parent

deferred-exact
  -> mark exact generation stale
```

Must not replace the field reference with resolved data text in the template.

### `user.changeSelection`

```text
immediate
  -> update session-only selection
  -> optionally create non-durable selection history record

background-live
  -> no layout request
```

Must not create durable document history or exact generation work.

### `user.saveTemplate`

```text
immediate
  -> flush or reject active draft
  -> assert canonical package
  -> serialize package

external-artifact
  -> app persistence writes canonical package
```

Must not persist selection, viewport, hover, live layout, exact layout, or
generation artifacts into `DocumentNode`.

### `generation.assess`

```text
immediate
  -> safeParseVNextGenerationRequest
  -> assessVNextGenerationReadiness
  -> return readiness diagnostics
```

Must not render artifacts or mutate authored template state.

### `generation.renderArtifact`

```text
immediate
  -> parse request
  -> readiness gate

deferred-exact
  -> exact layout job
  -> renderer command job

external-artifact
  -> PDF/DOCX/preview render job
  -> storage or response job
```

This action is future work. It must carry idempotency and revision metadata
before it can write artifacts.

### `ai.suggestEdit`

```text
immediate
  -> inspect current package/session/selection/diagnostics
  -> return proposed actions and target scopes
```

This is read/suggest work. It must not mutate the document.

### `ai.applySafeEdit`

```text
immediate
  -> permission/approval gate
  -> invoke the same core transaction or operation used by user actions
  -> append history/audit metadata with source ai

background-live
  -> live layout affected visible range

deferred-exact
  -> mark exact generation stale
```

AI safe edits must remain bounded and undoable. If the target scope is unclear,
the action must return `requires-approval` or `rejected`.

### `ai.generateDiagnostics`

```text
immediate
  -> assessVNextGenerationReadiness
  -> return diagnostics
```

This is allowed as a read/generate action and must not render artifacts in the
current readiness-only core.

## Workflow Examples

### Typing Workflow

```text
Action user.typeText
  Command text.insert
  Intent typing-session group
  Job live-layout-visible-range
  Marker exact-generation-stale
```

Only the visible live layout job may run after the immediate path. Exact layout
stays deferred.

### Generate PDF Workflow

```text
Action generation.renderArtifact(pdf)
  Job readiness
  Job exact-layout
  Job renderer-commands
  Job pdf-render
  Job artifact-store-or-return
```

Every job must verify that the package/data/profile revision it consumed still
matches the request before publishing its result.

### AI Safe Edit Workflow

```text
Action ai.applySafeEdit
  Gate permission/approval
  Command text transaction or operation
  Intent source ai/automation
  Audit AI action id and target scope
  Job live-layout-visible-range
  Marker exact-generation-stale
```

AI uses the same rails as user editing. The only addition is explicit
permission and audit metadata.

## Stale Work Rules

- A job result with an older document revision cannot replace newer visible
  state.
- A job result with older request data cannot publish a generation artifact.
- Live layout results can be dropped silently when superseded.
- Exact generation results should surface stale/blocked diagnostics when the
  user requested export readiness.
- Artifact jobs must be idempotency-aware before storage writes.

## Queue Non-Goals

This contract does not implement:

- a scheduler;
- a worker pool;
- retries;
- persistence;
- cancellation APIs;
- browser rendering;
- server routes.

Those belong to later runtime phases. The purpose of Phase 26 is to prevent
future UI/API work from coupling active typing to long-running generation work.
