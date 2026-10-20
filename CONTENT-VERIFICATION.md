# Public content verification: TP-10–TP-13

Repository review record, excluded from site inputs, search and exports. This records evidence, not completion of unperformed live acceptance. No Test Portal instance or GitHub Actions job was used for acceptance, no website was deployed, and no source repositories/tickets/settings were modified.

## Source baseline and selection

On 20 October 2026, read GitHub's current `main` commit IDs and confirmed they still match the foundation's independent source archives:

| Repository | Commit |
| --- | --- |
| TestPortal-cli | `6a0ed4754276334d6ced8ee54a6f9384cd4c94a7` |
| TestPortal-backend | `e113971625d3666fc18fac135872a2ecc6c84ca4` |
| TestPortal-client | `22802e11abb029a38dc358055532ca82cf5de2e1` |

The merged foundation at `72bbc84` is the base of `codex/tp-10-13-public-docs`. It selects `VENTIONINC/TestPortal-documentation` and `/TestPortal-documentation/`, superseding older ticket naming. The source checkouts' unrelated changes were left intact; CLI compilation used the archived commit in a temporary directory, reusing installed dependencies.

All 25 pages are explicitly selected in `public-content.json`. Every source permalink was checked for file existence in the matching audited archive. CLI defaults/behavior come from command, converter, HTTP, provider and environment code; upload paths/payloads/errors from routes, middleware, controllers and services; MCP names/inputs from registration and per-tool schemas/handlers; UI steps from routes, settings and the actual components/query controls. The selected API is ingestion/authentication only. All 17 registered MCP product tools are covered, with reads/writes and deletion behavior distinguished. Private prompts, mock/unregistered exports, internal source directories and hidden report-generator UI were excluded.

Public-content selection and agent review are recorded, but the PR still requires human public-suitability review. No product screenshots are published: there was no authorized, sanitized live product session. Browser evidence concerns the documentation website only.

## Per-ticket acceptance

| Ticket | Implemented | Evidence passed | Remaining acceptance |
| --- | --- | --- | --- |
| TP-10 | Overview; quickstart, credentials and complete first-report tutorial; installation/configuration/full CLI reference; direct homepage tutorial link | Source contracts; sample conversion; metadata/examples/build/links | Released-package installation with package read access; authenticated upload and matching UI execution |
| TP-11 | Playwright/Jest/Cypress guides with common structure; explicit tested JSON normalization; complete Actions YAML preserving failing tests and artifacts | Real Playwright/Jest/Mochawesome producer outputs converted; count/name/status/retry checks; normalizer negative cases; YAML/shell/CLI contract checks | Real Cypress browser/spec run and multi-spec merge; actual trusted Actions run, registry access and live upload |
| TP-12 | Upload-key/JWT authentication; four selected upload variants; multipart examples/status/errors; Streamable HTTP setup, SDK example and 17-tool catalog | Backend contract/schema/handler review; JSON/shell checks; SDK example against local mock with Bearer authentication/discovery/status call | Authenticated backend error/success cases; live MCP discovery and read/write acceptance on disposable data |
| TP-13 | Execution/result/issue guides and symptom/cause/resolution troubleshooting | Implemented client/query/component review; cross-links, navigation and content scans | Authenticated product workflow acceptance; screenshots only if later useful and sanitized |

Implementation and local validation are ready for review. Do not mark these tickets fully accepted based on static checks or mocks. External gates do not require publication/settings changes or writes to source repositories.

## Local runtime experiments

Toolchain: Node.js 22.22.2, npm 10.9.7; audited CLI manifest/command version 1.1.2. A successful source build is not a test of downloading the released package from GitHub Packages.

| Input | Producer | Outcome |
| --- | --- | --- |
| First-report tutorial JSON | Exact JSON fence from the page | 1 passed CTRF test, summary count 1 |
| Playwright JSON | `@playwright/test` 1.58.2, nested suite, one pass/one deliberate failure, retries 1; browser-free assertions | 2 CTRF tests, 1 failure; failed test has one retry; final statuses/names/counts checked |
| Jest JSON | Jest 29.7.0, nested suite, one pass/one deliberate failure | Standard JSON uses `name`; guide normalization supplies `testFilePath`/runtime; 2 CTRF tests, 1 failure |
| Nested Mochawesome JSON | Mocha 11.7.5 + Mochawesome 7.1.4, pass/fail/pending in nested suites | Guide flatten/title normalization preserves 3 tests; 1 failed and 1 skipped CTRF test; full names/counts checked |
| Rejected webhook | Loopback HTTP 401 mock, one attempt | Multipart request and `X-API-Key` verified; `Webhook failed` logged with process exit 0 |
| MCP SDK example | SDK 1.29.0, loopback Streamable HTTP mock | Exact page client code initialized, discovered tools, sent Bearer headers, called `check-status`, closed successfully |

All producer test runs intentionally exited 1 because of failed assertions. That failing outcome was retained while reports were inspected and converted. The Mochawesome producer experiment is not a Cypress browser run. The MCP mock has one tool and no Test Portal database; it does not establish live availability, permissions or business-operation success.

## Reproduce conversion evidence

Build the CLI at the exact recorded commit in an isolated checkout/archive, using its locked dependencies, then point `TEST_PORTAL_AUDITED_CLI` at `dist/cli.js`. Do not use an unrelated dirty feature checkout as the behavior baseline.

In a separate fixture project, install `@playwright/test@1.58.2`, `jest@29.7.0`, `mocha@11.7.5` and `mochawesome@7.1.4`. Use a fresh `reports` directory. The following is a sufficient Playwright test (save under the configured test directory):

```javascript
const {test, expect} = require('@playwright/test');
test.describe('nested', () => {
  test('passes', () => expect(1).toBe(1));
  test('fails', () => expect(1).toBe(2));
});
```

Generate `reports/playwright.json` using the JSON reporter, with retries 1. For Jest, make the equivalent two tests using its global `describe`, `test` and `expect`; use `--runInBand --json --outputFile=reports/jest.json`. For Mochawesome, use nested Mocha suites with `assert.equal(1, 1)`, `assert.equal(1, 2)` and one `it.skip`, then save JSON using `--reporter mochawesome --reporter-options reportDir=reports,reportFilename=cypress,html=false,json=true`. Run each producer separately, retaining its expected nonzero test outcome. Set `TEST_PORTAL_EXAMPLE_REPORTS` to this reports directory.

From this documentation repository:

```bash
node scripts/verify-cli-examples.mjs "$TEST_PORTAL_AUDITED_CLI" "$TEST_PORTAL_EXAMPLE_REPORTS"
```

The script extracts the tutorial sample and exact normalizer code blocks, converts the real producer reports, checks counts/names/statuses/retries, then verifies the webhook failure caveat against a local HTTP mock. It never contacts a real instance. Normalizer regressions also run in regular CI using small synthetic inputs, including negative count/state cases.

For MCP reproduction, install SDK 1.29.0 in an isolated directory, copy the page's `connect.mjs`, and configure a local authenticated Streamable HTTP mock with a registered `check-status` tool. Assert the Bearer header on initialization and subsequent requests; verify tools discovery, status content and connection close. For real acceptance, follow the separate instance procedure below instead.

## Automated and browser checks

`npm run validate` passed: Markdown lint, 25-page public-input/source/metadata/example checks, TypeScript, 9 regression tests, production build, 28 HTML pages' internal links/assets/anchors, sitemap, local search index and public-output scanning. `git diff --check` passed. Generated build output, dependencies and framework fixture files remain untracked/ignored or outside the repository; they are not publication inputs.

The Actions example's YAML and shell syntax are checked without executing it. Official Action tags were resolved to commit SHAs: checkout v7.0.1 (`3d3c42e5aac5ba805825da76410c181273ba90b1`), setup-node v7.1.0 (`949feb2413d6458794dcd2491c4babbbce0c15c1`) and upload-artifact v7.0.2 (`cf430e030ddbb5b0abf93d22962f4752f3646cd9`). Review runner compatibility when updating/adapting them. The workflow preserves a failing test step, reports after failure using `!cancelled()`, guards absent report files, asserts upload status/body/count and retains only report artifacts.

In the built documentation at its project base path, browser checks confirmed the homepage tutorial link, tutorial content/code formatting in the current narrow/dark layout, navigation entries for all 25 pages, navigation to the Cypress guide, and search suggestions indexing its new content. This is a targeted content/navigation check; the foundation's desktop/mobile/both-theme shell checks are recorded separately. It is not authenticated product acceptance.

## External acceptance procedure

1. Confirm CLI 1.1.2 is available to an authorized account at its documented GitHub Packages registry, install it, and check bin/help/version parity.
2. Use an authorized disposable Test Portal project. Generate its upload key without logging it. Submit the tutorial/real report using the documented request; require HTTP 201, `success`, execution ID and expected count.
3. Check missing/revoked keys, wrong format and malformed JSON. Record sanitized status/error evidence; avoid uncertain automatic retries or duplicate imports.
4. In the UI, select the same project/report date, clear restrictive filters and compare file/test names, statuses and retry details. Inspect an error and deliberately create/confirm/edit an issue association in disposable data.
5. Run a real Cypress browser suite with nested specs and current compatible Mochawesome/merge versions. Normalize and compare merged, converted and imported counts; inspect pending/skipped and hook-failure behavior instead of assuming complete support.
6. Execute the trusted Actions example using authorized package/upload secrets. Include one intentional failing test; require the job to remain failed while reports are retained and upload is checked.
7. Generate a dedicated MCP token, connect with the documented transport, compare `tools/list` against the 17-tool reference, inspect read results, and exercise selected writes only on authorized disposable data. Record tool `isError`/bulk outcomes separately from HTTP success.
8. Human-review all public content and sanitize any future screenshots before adding them to the manifest. Publication/settings and source-repository changes remain separately authorized work.

The final group's LLM exports and TP-15 integration consume the 25 approved routes from `public-content.json`, excluding this record, migration inventory and tests. See FINAL-ACCEPTANCE.md for current TP-14/TP-16/TP-17 implementation and validation evidence. Publication, settings and ecosystem README changes remain gated separately.
