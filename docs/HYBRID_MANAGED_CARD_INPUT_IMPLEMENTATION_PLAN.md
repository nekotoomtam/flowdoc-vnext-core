# Hybrid Managed Card Input Implementation Plan

Status: Phase 153 hybrid managed card input implementation plan.

Phase 153 turns the Phase 143 primary input decision into implementation-sized
plan boundaries.

This is a plan boundary only. It does not implement production DOM binding,
contenteditable behavior, editor UI runtime, storage, routes, renderer output,
collaboration, or schema changes.

## Inputs

- Phase 143 selected hybrid managed cards with a hardened contenteditable
  island for the currently edited text block.
- Phase 144 accepts `text-block.rich-inline.replace` for the v1 single-user
  vertical slice, but not for collaboration/offline claims.
- Phase 152 recommends this plan as the next lane after the first vertical
  slice RC foundation pass.

## Ownership Boundaries

### Managed Card Runtime

- Owns document structure display, block cards, table cards, field chip cards,
  generated content cards, page shell, structural selection, visible range, and
  command availability for non-active blocks.
- Keeps non-text structure out of arbitrary contenteditable DOM.
- Sends only explicit command intents to lower boundaries.

### Active Text-Block Island Runtime

- Owns one active text-block editing island at a time.
- Owns browser-local DOM selection, composition state, transient segment facts,
  and edit buffer for that active text block.
- Does not mutate canonical package data directly.
- May use contenteditable only inside the active text-block island.

### Command Policy

- Decides whether a command is safe for rich contenteditable, textarea/plain
  text fallback, or rejection.
- Guards styled runs, field chips, IME composition, selection/caret ranges,
  paste/delete shape, and unsupported block targets.
- Emits explicit command readiness and rejection reasons.

### Commit Bridge

- Converts accepted active-island facts into vNext text/rich inline commit
  requests.
- For v1 rich inline commits, routes through `text-block.rich-inline.replace`.
- Marks live/exact generation stale after accepted content commits.
- Does not claim collaboration/offline merge safety.

### Fallback Textarea Path

- Owns plain-text editing for blocks that cannot safely enter the hardened
  contenteditable island.
- Preserves package truth by committing through existing vNext text operations
  or safe rich inline replacement when allowed.
- Keeps fallback visible as a safety policy, not as a product failure.

### App-Shell Integration

- Coordinates focus, active block switching, toolbar state, inspector state,
  viewport anchoring, and packet refresh.
- Does not own canonical mutation semantics.
- Does not import old FlowDocEditor runtime.

## Browser-Local Versus Core Commit

Browser-local:

- DOM node refs and contenteditable state;
- active selection/caret and IME composition state;
- transient segment/capture facts;
- toolbar hover/focus/readiness state;
- paste/delete preflight facts;
- textarea fallback buffer.

Commits into vNext core:

- accepted text transaction commands;
- accepted `text-block.rich-inline.replace` commits for v1 single-user rich
  inline edits;
- history-ready records;
- dirty scopes and packet refresh facts;
- live/exact stale signals.

Never commits into canonical package truth:

- raw DOM ranges;
- browser selection objects;
- contenteditable HTML;
- transient composition text while IME is active;
- app-shell focus or viewport state.

## Guard Policy

Styled runs:

- allow only when segment capture can preserve inline ids, style facts, and
  UTF-16 ranges;
- reject or fallback when style overlaps are ambiguous.

Atomic inline field chips:

- keep field chips as managed atomics, not editable text spans;
- block cursor placement inside chip internals;
- route delete/copy/paste behavior through explicit commands;
- require field key visibility in commit facts.

IME composition:

- do not commit while composition is active;
- freeze destructive command execution during composition;
- keep composition state browser-local.

Selection and caret:

- accept only bounded active text-block ranges;
- reject cross-block selection mutation in the island;
- keep structural selection owned by managed cards.

Paste/delete:

- normalize paste into text, supported field chips, or safe rejection;
- block deletion across structural boundaries;
- block arbitrary HTML mutation from becoming package truth.

Unsupported blocks:

- route generated content, tables, static zones, unsupported inline mixes, and
  unsafe segment captures to managed cards or textarea/plain-text fallback.

## Fallback Policy

- Use textarea/plain-text editing when rich contenteditable hardening cannot
  preserve inline identity, field chip atomics, IME safety, or selection range
  correctness.
- Plain-text fallback may commit through text operations when the block is
  plain text.
- Mixed inline fallback must either preserve supported field refs through a
  safe rich inline replacement or reject with actionable diagnostics.
- Fallback does not authorize full-document contenteditable.

## Post-153 Phase Sequence

Recommended next phases:

1. Input runtime ownership boundary.
2. Active text block island boundary.
3. DOM binding smoke.
4. Commit bridge smoke.

Later guarded phases:

- field chip delete/copy/paste command boundary;
- renderer segment and hit-test evidence boundary;
- granular rich inline operation upgrade before collaboration/offline claims.

## PASS

- Phase 153 defines ownership boundaries for the selected hybrid input model.
- Browser-local state and vNext core commit facts are separated.
- Guard policy covers styled runs, atomic field chips, IME composition,
  selection/caret, paste/delete, and unsupported blocks.
- Textarea/plain-text fallback policy is explicit.
- Follow-up phases are small and bounded.

## FAIL / BLOCKER

- No blocker prevents using this as the implementation plan.
- Production input readiness remains blocked until later implementation and
  browser QA phases.

## RISK

- DOM selection and IME behavior can still vary by browser.
- Field chip delete/copy/paste needs explicit command contracts.
- `text-block.rich-inline.replace` remains weak for collaboration/offline
  semantics.
- Renderer-backed segment and hit-test evidence remains future work.

## UNKNOWN

- Final production browser support matrix is unknown.
- Exact renderer-owned segment stream protocol is unknown.
- Production paste sanitization policy is unknown.
- Collaboration/offline merge policy is unknown.

## Files Changed

- `docs/HYBRID_MANAGED_CARD_INPUT_IMPLEMENTATION_PLAN.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/hybridManagedCardInputPlan.test.ts`

## Behavior Changed

- No runtime behavior changed.
- The project now has a plan boundary for implementing the selected hybrid
  managed card input model.

## Tests Run

- `npm.cmd test -- tests/hybridManagedCardInputPlan.test.ts`
- `npm.cmd run check`

## Risks Left

- Implement the input runtime ownership boundary.
- Implement the active text-block island boundary.
- Add DOM binding and commit bridge smokes.
- Define field chip delete/copy/paste commands.
- Define renderer segment and hit-test evidence.

## Intentionally Not Changed

- No production contenteditable implementation.
- No full-document contenteditable.
- No collaboration/offline behavior.
- No storage/backend route.
- No PDF/DOCX renderer work.
- No package/document schema change.
- No legacy editor runtime copy.
