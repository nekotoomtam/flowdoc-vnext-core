# Backend Generation Runtime Plan

Status: draft architecture reset.

The backend generation runtime turns canonical template packages and request
data into deterministic diagnostics and output artifacts. It is the API-facing
runtime, not the active browser typing engine.

## Goal

Support external callers that can:

- submit a template package or template id/version;
- submit data for field keys;
- request preview, PDF, DOCX, or future artifact formats;
- receive validation diagnostics;
- receive generated artifacts or storage references;
- rely on deterministic output for the same template/data/profile input.

## Pipeline

```text
generation request
  -> load/parse canonical template package
  -> validate package and document graph
  -> validate key registry and request data
  -> bind data into runtime view
  -> exact layout and pagination
  -> renderer command artifact
  -> export readiness
  -> render/store/return output artifact
```

Generation output is derived state. It must not mutate the template package,
frontend session state, selection, history, or saved data unless an explicit
storage API says so.

## Request Direction

Suggested long-term shape:

```ts
type GenerateRequest = {
  template:
    | { id: string; version?: string }
    | { package: unknown };
  data?: unknown;
  output: {
    kind: "diagnostics" | "preview" | "pdf" | "docx";
    measurementProfileId?: string;
  };
  requestId?: string;
  idempotencyKey?: string;
};
```

The first implementation can be narrower. The important rule is that the API
accepts template plus data, not current editor runtime state.

## Response Direction

```ts
type GenerateResponse = {
  requestId?: string;
  status: "ready" | "ready-with-warnings" | "blocked" | "rendered";
  template: {
    id: string | null;
    packageVersion: 2 | null;
    documentVersion: 3 | null;
  };
  diagnostics: unknown[];
  artifact?: {
    kind: "preview" | "pdf" | "docx";
    contentType?: string;
    storageId?: string;
    bytes?: Uint8Array;
  };
};
```

Exact response fields should be designed per route, but responses must keep
diagnostics, generation status, and output artifact separate from authored
template state.

## Runtime Responsibilities

Generation runtime owns:

- package loading/parsing for API requests;
- request data validation;
- binding runtime view creation;
- exact layout;
- export readiness;
- renderer artifact handoff;
- idempotency/cache metadata where needed;
- route-safe diagnostics.

It must not own:

- frontend caret/selection/IME;
- live layout cache;
- editor local undo;
- current editor reducer state;
- legacy document adapters inside exported core.

## Determinism

The same canonical template package, request data, and measurement profile
should produce the same diagnostics and artifacts, excluding timestamps,
storage ids, and explicitly non-deterministic metadata.

Measurement profile identity must be explicit. Hidden font fallback should be a
diagnostic, not silent output drift.

## Error Classes

Generation should distinguish:

- invalid package;
- unsupported package/document version;
- invalid document graph;
- key registry error;
- request data error;
- binding warning;
- layout warning;
- export blocker;
- renderer failure.

This keeps external API users from receiving one generic failure for different
fix actions.

## Non-Goals

- No active browser editing.
- No current `/api/paginate` compatibility contract.
- No generated-output-as-template mutation.
- No key history implementation yet.
- No repeat/collection expansion until designed.
