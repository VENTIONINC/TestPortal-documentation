# Final documentation group: TP-14, TP-16, TP-17

Repository-only acceptance record, excluded from public site inputs, search and LLM exports. Date: 20 October 2026. Local checks establish build behavior; publication, live product use and source-repository README changes remain separate gates.

## Baseline and repository identity

Implementation starts at `29a68493`, the current `origin/develop` merge of public-content PR #2 (`b3669321`), following foundation PR #1 (`72bbc848`). Both PRs target `develop`. Branch: `codex/tp-14-16-17-exports-deployment`. The checkout was clean; no preceding work was replaced or duplicated.

The merged foundation and content record select `VENTIONINC/TestPortal-documentation`, origin `git@github.com.work:VENTIONINC/TestPortal-documentation.git`, with site origin `https://ventioninc.github.io` and base path `/TestPortal-documentation/`. This supersedes the original ticket proposal `TestPortal-docs`. No repository rename, visibility or Pages setting change was made.

Read-only `gh repo view` reports the documentation repository is currently **private**, its default branch is `main`, and the current CLI identity has `ADMIN` permission. The Pages read endpoint returned HTTP 404, so an enabled site was not confirmed. Admin access does not substitute for publication approval. Confirm the organization's Pages plan/policy supports the intended public site from this private repository before enabling it; any visibility change requires separate explicit authorization.

Fresh read-only GitHub API checks confirmed current source `main` commits match the existing verified content baseline:

| Repository | Inspected current default-branch commit |
| --- | --- |
| TestPortal-client | `22802e11abb029a38dc358055532ca82cf5de2e1` |
| TestPortal-backend | `e113971625d3666fc18fac135872a2ecc6c84ca4` |
| TestPortal-cli | `6a0ed4754276334d6ced8ee54a6f9384cd4c94a7` |

No product claims, API endpoints, CLI flags or framework recipes were changed in this group. Their implementation evidence and public-source selection remain in MIGRATION.md and CONTENT-VERIFICATION.md. No configured `vention-issue-tracker` capability or project tracker configuration is available here; supplied current descriptions determine scope. No tracker configuration, ticket status or dependency was mutated.

## TP-14: implementation and plugin decision

Evaluated npm `docusaurus-plugin-llms` **0.6.1**, whose `@docusaurus/core: ^3.0.0` peer range accepts installed **3.10.2**. A real production build enabled `generateMarkdownFiles`, `excludeImports`, and image URL rewriting and generated 25 page exports plus both LLM files. However, `docs/intro.md` retained `[framework integrations](integrations/index.md)` although the hub export was `docs/integrations.md`. The flattened `docs/getting-started.md` retained `quickstart.md`, resolving outside its actual subsection. The combined root-level `llms-full.txt` retained page-relative links such as `../getting-started/authentication.md`. These concrete broken links fail the ticket's resolved-link requirement.

Sources: [plugin repository](https://github.com/rachfop/docusaurus-plugin-llms), [published package](https://www.npmjs.com/package/docusaurus-plugin-llms/v/0.6.1). The package was removed after evaluation; no added dependency or lockfile change remains.

The permitted minimal fallback is `scripts/llms-plugin.mjs` with shared logic in `scripts/llms.mjs`. It consumes live Docusaurus loaded-doc metadata and joins every resolved page to the approved manifest. It rejects unexpected/draft/unlisted documents, missing routes and unsupported rendered syntax. Imports are removed only outside code fences. Plain Markdown, heading hierarchy, tables, code blocks and prose remain intact. Link edits use parsed node positions so code examples are not rewritten. Source `index.md` links, explicit slugs and fragments resolve to absolute published HTML targets; the categorized index links to Markdown exports. Combined output includes all 25 page bodies in fixed category/slug order.

Every production build emits:

- `build/llms.txt` and `build/llms-full.txt`.
- Exactly 25 `build/docs/<resolved-slug>.md` files, including hubs such as `build/docs/integrations.md`.
- Existing homepage, 25 HTML docs, 404/search pages, sitemap, search indexes, assets and `.nojekyll`.

`validate-llms.mjs` independently checks emitted bytes against approved sources/resolved metadata, rejects unexpected exports, parses every link, checks local targets/rendered anchors, scans for excluded content and requires the sitemap. `check-llms-stability.mjs` runs another production build, validates it, and compares path/hash snapshots for all 27 LLM artifacts. The shared `npm run validate` activates TP-15's previously deferred LLM checks in both PR and deployment pipelines.

## TP-16: prepared workflow and approval gate

`.github/workflows/deploy.yml` triggers only on push to `main`. Official Pages actions are pinned to immutable commits. The build job uses only `contents: read` and `pages: read` (for Pages metadata), explicitly disables automatic Pages enablement, runs all shared validations, and uploads only the complete validated build. The deploy job depends on build success, has only `pages: write` / `id-token: write`, and uses the `github-pages` environment. Workflow concurrency serializes deployments. PRs target `develop`/`main` for checks and never deploy.

The post-deploy job runs `scripts/smoke-pages.mjs`. It checks every selected page/export plus both LLM files and sitemap; confirms page titles/headings, full sitemap coverage and absolute Markdown index URLs; follows internal navigation; and fetches linked CSS/JS. Each request has a ten-second timeout and at most three attempts, with a four-minute overall deadline and a five-minute job limit. HTTP redirects are rejected to catch path/domain drift. A smoke failure does not automatically roll back deployment.

Before publication, an authorized maintainer/administrator must confirm repository access/visibility and Pages availability, choose GitHub Actions as publishing source, review environment approvals and protected-branch requirements, and approve promotion to `main`. No PAT, auto-enablement or settings workaround is provided. Prepared workflow code and local success do not close TP-16.

## Local validation evidence

- `npm run validate`: Markdown/source/example/workflow checks, TypeScript, validator regressions, production build, all local links/assets/anchors/public artifacts, strict LLM validation, and repeated-build hash stability passed.
- Regression suite: 14 passing checks, including real validator subprocess failures for missing/empty/altered exports, wrong base paths, unresolved MDX, excluded content, unexpected Markdown output and missing anchors; generator failures for unapproved/draft/missing routes and components; preservation of code-fence imports; source-index/query/fragment rewrites; and deployment trigger/permission/dependency controls.
- Production output: 28 HTML pages, 25 Markdown exports and both LLM files. All 27 LLM artifacts were byte-identical across repeated production builds.
- Local HTTP smoke against the served build passed: 54 page/export/sitemap requests, three CSS/JavaScript assets and 26 navigation targets under `/TestPortal-documentation/`.
- Fresh browser checks on the production build confirmed the narrow mobile homepage layout, first-report navigation, production search suggestions for Playwright and result navigation to the Playwright guide. Earlier desktop/mobile/theme/search acceptance is recorded in MIGRATION.md and CONTENT-VERIFICATION.md; public-host behavior remains unverified.

The sandbox initially blocked the smoke check's loopback request; the authorized rerun with local network access passed. No production Test Portal instance or GitHub Pages deployment was used. Existing dependency advisory findings remain documented in README.md; no clean audit is claimed.

## Final original-brief checklist

| Required area | Evidence/status | Remaining acceptance |
| --- | --- | --- |
| Public site and correct project path | Local build and HTTP smoke pass at actual configured path | Publication approval, Pages settings, main promotion and live HTTP evidence |
| Homepage/product explanation; direct first-report entry | Implemented, linked and locally browser-verified | Human public-content approval and public-host check |
| Desktop/mobile layout and navigation | Prior documented browser checks; fresh mobile first-report/search navigation; all local links pass | Public-host/browser confirmation |
| Light/dark themes and search | Prior recorded theme/search checks; fresh production search opens actual guide | Public-host confirmation |
| CLI installation/configuration/reference | Implementation-verified content and example checks at audited commit | Released-package installation with required registry access |
| Quickstart and complete first-report workflow | Complete guide, local conversion/mock evidence from content group | Authenticated import and matching execution/results in UI |
| Playwright/Jest/Cypress | All three complete; source/report/normalizer regressions recorded | Real authorized upload/UI acceptance |
| GitHub Actions integration | Full failure-aware sample, parsed and syntax/contract checked | Authorized actual CI run and upload evidence |
| Public API authentication/upload | Selected routes verified against source; JSON/shell/multipart checks pass | Authorized endpoint/error/response verification |
| MCP setup and tools | Registered product-tool selection verified against source | Compatible client connection/discovery and authorized tool calls |
| Execution/results/issues guides and troubleshooting | All required pages in manifest/navigation and exports | Authenticated product walkthrough; screenshots only if sanitized/authorized |
| Public-only, complete source selection | 25 explicit approved entries; strict source/artifact/export checks; no bookkeeping exported | Human public-suitability review; automated scans are supplementary |
| LLM generation and Markdown representations | All 27 outputs, links, complete content and repeat-build stability pass locally | Public accessibility after deployment |
| PR quality automation and broken-link enforcement | Shared complete validation in PR CI; strict link/anchor/image/route errors | This PR's hosted CI and review |
| Automatic official Pages deployment | Reviewable validation-gated main-only workflow and bounded smoke job | Explicit publication/settings approval and actual successful deployment/smoke |
| Contribution workflow | README explains setup, page/source review, navigation, generation, validation, PRs and deployment | Review/merge |
| Three ecosystem README links | Exact configured target identified; existing material untouched | Verified publication, explicit cross-repository write approval, three separate branches/PRs |
| Maintenance without editing generated files | Sources/metadata drive exports; README documents authoring constraints | Normal PR review discipline |

## Per-ticket acceptance and proposed public URLs

| Ticket | Completed locally | Still open |
| --- | --- | --- |
| TP-14 | Automatic complete exports, resolved links, approved-only content, strict validation and stable builds | Review/merge; public accessibility depends on authorized TP-16 deployment |
| TP-15 integration | All deferred LLM checks active and passing with complete content | Hosted PR CI/review; no claim of live product acceptance |
| TP-16 | Workflow, artifact/deployment gating and exercised local smoke procedure | Settings/permission approval, main promotion, publication and public smoke evidence |
| TP-17 | Contributor instructions, final consistency checklist and reconciled migration records | Verified public portal, explicit approval and separate client/backend/CLI README PRs |

Proposed URLs below are configured targets, **not published/live-verified results**:

- [Homepage](https://ventioninc.github.io/TestPortal-documentation/)
- [Introduction](https://ventioninc.github.io/TestPortal-documentation/docs/intro)
- [Quickstart](https://ventioninc.github.io/TestPortal-documentation/docs/getting-started/quickstart)
- [CLI](https://ventioninc.github.io/TestPortal-documentation/docs/cli)
- [Integrations](https://ventioninc.github.io/TestPortal-documentation/docs/integrations)
- [LLM index](https://ventioninc.github.io/TestPortal-documentation/llms.txt)
- [Full Markdown](https://ventioninc.github.io/TestPortal-documentation/llms-full.txt)
- [Example page Markdown](https://ventioninc.github.io/TestPortal-documentation/docs/integrations.md)
- [Sitemap](https://ventioninc.github.io/TestPortal-documentation/sitemap.xml)

This group changes generator/validator/smoke scripts and regressions, Docusaurus plugin registration, package scripts, PR/deployment workflows, README and repository acceptance/migration records. It changes no public product-page wording or source-repository files. Overall completion is not claimed while publication, README permissions and product/live gates remain unresolved.
