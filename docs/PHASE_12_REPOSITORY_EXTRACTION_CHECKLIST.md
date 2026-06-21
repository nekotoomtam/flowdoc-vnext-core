# Phase 12 Repository Extraction Checklist

Status: complete for repository extraction readiness.

This checklist owns the final in-repo readiness gate before moving
`vnext-workspace/` to a new repository.

## Goal

Make the vNext core ready to move as its own repository without carrying parent
editor runtime code, current/prototype compatibility input, or parent API
routes into the exported core.

## Extraction Unit

Move these as the new repository root:

- `package.json`
- `tsconfig.json`
- `vitest.config.ts`
- `.gitignore`
- `README.md`
- `src/**`
- `tests/**`
- `fixtures/**`
- `docs/**`

Do not move these parent consumers into the core repository:

- `../src/app/editor/_components/vnextBridge/**`
- `../src/app/api/vnext/**`
- parent app tests under `../src/app/**`
- parent editor/runtime reducers, canvas, selection, pagination, export, or
  persistence code

## Definition Of Done

- Package-local `npm run check` passes inside `vnext-workspace`.
- Extraction boundary tests prove required standalone files exist.
- Extraction boundary tests prove `src/**` has no imports from parent app or
  current core paths.
- Canonical parser/tests reject old package/document versions and prototype
  node names.
- Parent-app vNext imports remain restricted to the bridge host until the new
  package dependency exists.
- Post-extraction parent work is listed separately from core move work.

## Evidence

| Gate | Evidence | Status |
|---|---|---|
| Package-local commands exist | `package.json` scripts `type-check`, `test`, and `check` | verified |
| Package-local tests pass | `npm.cmd --prefix vnext-workspace run check` | passed; 10 files / 67 tests |
| Standalone required files exist | `tests/extractionBoundary.test.ts` | verified |
| No parent app/current core imports from `src/**` | `tests/extractionBoundary.test.ts` | verified |
| Canonical-only parser rejects old shapes | `tests/packageFixture.test.ts` | verified |
| Product fixture exists | `fixtures/product-report-vnext.flowdoc.json` | verified |
| Parent import boundary is explicit | `../docs/EDITOR_VNEXT_IMPORT_BOUNDARY_DECISION.md` | verified |

## Verification Run

```text
npm.cmd --prefix vnext-workspace run check
```

Result:

- type-check passed;
- 10 test files passed;
- 67 tests passed.

## Post-Extraction Parent Adapter Work

After the new repository/package exists:

1. Add the new dependency to the parent app.
2. Change only `../src/app/editor/_components/vnextBridge/editorVNextBridgeHost.ts`
   from the temporary relative import to the new package import.
3. Keep existing import guard tests so no other parent file imports the vNext
   package directly.
4. Run parent bridge/generation route tests and parent `type-check`.
5. Keep current `/api/paginate`, current `/api/export`, editor canvas, reducer,
   history, selection, and persistence unchanged unless a later integration
   plan explicitly changes them.

## Not Part Of The Core Move

- Visible editor runtime flip.
- Controlled editor preview integration.
- PDF/DOCX artifact rendering.
- Replacing `/api/paginate` or `/api/export`.
- Transport/cache/background job design.
- Legacy/current document conversion inside exported vNext core.

## Remaining Owner Inputs For Physical Move

- Target repository path or remote.
- Final package name and publishing/private policy.
- Parent dependency strategy: workspace link, git dependency, package registry,
  or local file dependency during transition.

## Ready-To-Move Verdict

PASS for repository extraction readiness.

The physical repository move should be performed only after the owner provides
the target repository path or remote and dependency strategy. Until then, keep
the parent app importing vNext through the temporary bridge host only.
