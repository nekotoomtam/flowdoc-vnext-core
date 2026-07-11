# Product Fixture Roles

Date: 2026-07-11

These fixtures serve different validation levels and must not be treated as
interchangeable product truth.

| Level | Fixture | Intended use | Not evidence for |
|---|---|---|---|
| Smoke | `product-report-vnext-minimal.flowdoc.json` | Basic package loading and narrow mutation checks | Product-realistic layout or pagination |
| Baseline | `product-report-vnext-baseline.flowdoc.json` | Synthetic but product-realistic editor UX and PDF-like preview validation over approximately two pages | Exact export pagination or customer data |
| Stress | `product-report-vnext.flowdoc.json` | Multi-section, multi-page, graph, pagination, and layout pressure | Typical document length or final product content |

The baseline fixture is the default evidence document for connecting real
canonical nodes to the product preview. Its values are intentionally synthetic,
its node ids are stable for browser QA, and its page count is only a preview
estimate until exact measured pagination and a concrete renderer agree.
