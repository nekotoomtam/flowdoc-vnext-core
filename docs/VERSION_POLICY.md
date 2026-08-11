# Version policy

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
