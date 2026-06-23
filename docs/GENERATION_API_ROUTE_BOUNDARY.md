# Generation API Route Boundary

Status: Phase 86 implementation boundary.

Phase 86 adds a pure route-response adapter for the readiness-only generation
runtime. It lets app/server code wrap `generation.assess` requests in a stable
HTTP-shaped response contract without importing parent app routes, starting a
server, rendering artifacts, or writing storage.

This is a generation API route boundary. It is not a concrete server route.

## Purpose

The backend generation path now has a route-safe layer:

```text
POST request body
  -> createVNextGenerationApiRouteResponse(...)
  -> assessVNextGenerationReadiness(...)
  -> JSON response envelope
```

The adapter exists so a future app route can call the core with a canonical
template package and request data while preserving the current readiness-only
truth boundary.

## Module Ownership

`src/generation/apiRoute.ts` owns:

- `VNEXT_GENERATION_API_ROUTE_SOURCE`;
- `VNEXT_GENERATION_API_ROUTE_MODE`;
- `VNEXT_GENERATION_API_ROUTE_ACTION`;
- `createVNextGenerationApiRouteResponse(...)`;
- allowed method policy for `POST`;
- route-safe HTTP status mapping;
- JSON/no-store response headers;
- a response envelope that keeps readiness result, issues, artifact, and
  generated document fields separate.

The module is pure TypeScript and Node-testable. It does not start an HTTP
server, import a framework, call `fetch`, write storage, run exact layout,
render artifacts, or mutate template packages.

## Status Mapping

- `POST` with a valid request shape returns `httpStatus = 200`, even when
  generation readiness is `blocked` by diagnostics such as invalid request
  data.
- `POST` with an invalid request or invalid package shape returns
  `httpStatus = 400`.
- Non-`POST` methods return `httpStatus = 405` with `allow = "POST"`.

The route envelope stays separate from readiness status. API callers can
distinguish transport/request failures from valid readiness diagnostics.

## Truth Boundary

The route boundary does not change generation truth:

- canonical package v2/document v3 remains the only accepted template input;
- request data can override package data for diagnostics but does not mutate
  the package;
- exact layout remains `not-run`;
- artifacts remain `not-rendered`;
- `artifact` and `generatedDocument` remain `null`;
- no authored document state is returned as generated output.

## Acceptance Evidence

Phase 86 is covered by `tests/generationApiRoute.test.ts`:

- valid `POST` requests produce route-safe readiness responses;
- invalid request shapes produce bounded 400 responses;
- readiness blockers inside valid requests stay inside a 200 route envelope;
- non-`POST` methods produce 405 responses with explicit allowed methods;
- route source is independent from server frameworks, parent routes, storage,
  exact layout, measured pagination, renderer consumption, and export
  readiness.

## Non-Goals

Phase 86 does not implement a concrete HTTP server route, template id/version
loading, session storage, idempotency persistence, exact layout execution,
renderer adapter output, PDF/DOCX/preview artifacts, artifact storage,
collaboration, backend authentication, rate limiting, or package/document
schema changes.
