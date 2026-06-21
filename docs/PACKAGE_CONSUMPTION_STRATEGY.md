# Package Consumption Strategy

Status: transition strategy documented.

This repository is the source of truth for `@flowdoc/vnext-core`. Consumers
must depend on the package boundary, not source paths inside this repository.

## Current Local Strategy

During local transition work, the parent FlowDocEditor repository may use a
sibling checkout dependency:

```json
"@flowdoc/vnext-core": "file:../flowdoc-vnext-core"
```

This keeps iteration fast while the package API is still stabilizing.

## Required Consumer Rules

- Import only the public package entrypoint unless a separate exported subpath
  exists.
- Do not import `src/**` through relative paths from another repo.
- Do not copy parent adapters into this package.
- Keep parent editor bridge code in the parent consumer repo.
- Run package-local `npm run check` before blaming consumer integration.

## Distribution Options

| Option | Use When | Tradeoff |
|---|---|---|
| Sibling `file:` dependency | Local development and early bridge integration. | Fast, but CI and other machines need matching checkout layout. |
| Workspace/monorepo link | Both repos are intentionally managed together. | Easier CI linking, but weakens the separate-repo boundary. |
| Git dependency | Small team needs remote install before registry publishing. | Versioning and lock updates need discipline. |
| Private package registry | The package API is stable enough for CI/release consumers. | Best consumer experience, but requires publish/version process. |

## Current Recommendation

Stay on sibling `file:` dependency until the next consumer lane proves the
public package API shape. Before shared CI or release work, choose either a git
dependency or private package registry.

