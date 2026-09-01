# Version policy

## Authority Boundary

Owner repository: Core.
Scope: Core-local documentation context for this repository file. This file may describe Core-owned implementation, runtime contracts, package-local tests, setup guidance, or bounded historical evidence.
Project Control owns FlowDoc-wide Work, Phase, Checklist, Evidence, Risk, Unknown, Roadmap, documentation authority, product terminology, compatibility promotion, and map truth. Governing Work: `flowdoc-product-development-resumption > flowdoc-documentation-authority-cleanup`; governing Project Control record: `docs/domains/product-repo-markdown-boundary-completion-2026-09-01.md`.
This file does not promote Core, Backend, Editor, compatibility, release readiness, frontend readiness, FlowDoc product truth, Project Control terminology authority, or map truth.


Core, Editor, and Backend use independent SemVer. One repository's version
does not promote another repository's package.

The current Core package version remains `0.0.0` until the alpha gate passes.
The first proposed Core release is `0.1.0-a.1`; it is not authorized by this
plan.

The `0_1` release-line folder represents the `0.1` line, not one prerelease.
When authorized, the exact prerelease snapshot uses the `v0.1.0-a.1` tag and
artifact identity.

Schema and contract versions are independent from package SemVer. A
`Development Baseline` never auto-promotes to a package release.
