# Thai Corpus / Oracle Boundary

Status: Phase 106 corpus boundary.

Phase 106 adds a small Thai text corpus and oracle comparison contract before
ICU4X, Intl.Segmenter, LibThai, PyThaiNLP, or AttaCut are executed.

This phase does not run segmentation. It only records the samples and coverage
needed for later deterministic comparison.

## Boundary

The boundary lives in `src/renderer/thaiCorpusBoundary.ts`.

It exposes:

- `VNEXT_THAI_CORPUS_SOURCE`;
- `VNEXT_THAI_CORPUS_MODE`;
- `createVNextThaiCorpusPlan(...)`.

The corpus fixture lives at:

```text
fixtures/thai-measurement-corpus.v1.json
```

It includes Thai-only text, Thai text without spaces, combining marks, mixed
Thai/Latin text, digits, punctuation, spaces, and mixed-script samples.

## Selected Direction

The first comparison stack is:

```text
ICU4X segmenter
  -> primary deterministic candidate
Intl.Segmenter
  -> browser/runtime comparison baseline
LibThai / PyThaiNLP / AttaCut
  -> Thai oracle candidates
```

Expected breakpoints are intentionally not stored in this fixture yet. A later
phase should run candidates and record observed breakpoints separately so the
source corpus remains neutral.

## Truth

This boundary may validate corpus coverage and oracle readiness.

This boundary must not:

- execute segmentation;
- import ICU4X, Intl.Segmenter wrappers, LibThai, PyThaiNLP, AttaCut, browser
  APIs, PDF, or DOCX libraries;
- compute line breaks;
- mutate corpus fixtures;
- replace `measureVNextText(...)` or measured pagination;
- write artifacts, cache files, or storage records.

## Acceptance Evidence

- `tests/thaiCorpusBoundary.test.ts` validates fixture coverage, blocks
  runtime-dependent primary segmenters, checks duplicate sample ids, verifies
  source independence, and confirms documentation trail.
- `fixtures/thai-measurement-corpus.v1.json` provides the initial sample set.
- `src/index.ts` exports the boundary without adding segmenter/oracle
  dependencies.

## Non-Goals

No concrete ICU4X execution, Intl.Segmenter execution, LibThai/PyThaiNLP/
AttaCut execution, expected-breakpoint generation, glyph shaping, line layout,
pagination replacement, PDF/DOCX rendering, backend route, worker runtime,
storage adapter, or schema change is introduced in this phase.
