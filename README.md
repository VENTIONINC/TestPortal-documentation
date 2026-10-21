# Test Portal documentation

English product documentation for Test Portal, built with Docusaurus, TypeScript, React and MDX.

**Website:** <https://ventioninc.github.io/TestPortal-documentation/>

The guides cover onboarding, report uploads, the CLI, framework and CI integrations, public REST/MCP interfaces, and user workflows.

## Run locally

Use Node.js 22 (`.nvmrc`) and npm. Node.js 24 is also supported.

```bash
nvm use
npm ci
npm start -- --no-open
```

Open <http://localhost:3000/TestPortal-documentation/>. Preserve the project base path when testing links and assets.

Preview the production build, including local search:

```bash
npm run build
npm run serve -- --no-open
```

## Contribute

Pages live in `docs/`; the homepage and styling live in `src/`. `public-content.json` records reviewed publication inputs and commit-pinned product sources.

```bash
npm run validate
```

Validation covers formatting, source metadata, examples, TypeScript, regressions, production links/assets, public-content checks and generated LLM exports. It includes a second build to verify deterministic Markdown output.

See [CONTRIBUTING.md](CONTRIBUTING.md) for page authoring, navigation, source review, runtime example verification and dependency maintenance. Submit changes through pull requests to `develop`.

## LLM exports

Every production build generates `llms.txt`, `llms-full.txt` and a Markdown representation of each approved documentation page. `scripts/llms-plugin.mjs` uses the same publication manifest and Docusaurus's resolved routes; no duplicate handwritten content is maintained.

The index groups Markdown links by category. The combined file preserves headings and code blocks in deterministic order. Relative document links become absolute published URLs, including slugged hub pages. For example, `docs/integrations/index.md` exports as `build/docs/integrations.md`.

Run `npm run check:llms` to validate generated content and links, or `npm run check:llms-stability` to rebuild and compare output hashes. Both are included in `npm run validate`.

## GitHub Pages deployment

`.github/workflows/docs-check.yml` validates PRs to `develop` and `main`. `.github/workflows/deploy.yml` validates and publishes pushes to `main` using the official GitHub Pages artifact/deployment actions. Deployments are serialized and use the `github-pages` environment.

To configure hosting, a repository administrator selects **Settings → Pages → Build and deployment → Source → GitHub Actions** and ensures the environment permits deployment from `main`. Confirm the organization's plan and policy support the repository's visibility. Review environment approvals and branch protections before promoting a release from `develop` to `main`.

Site origin, base path and repository identity are defined in `site-settings.json`. Keep those settings and repository links consistent if the repository is renamed. No custom domain is configured.

After deployment, the workflow runs `npm run check:live` against the configured site. It checks all approved pages and Markdown exports, both LLM files, sitemap coverage, navigation and linked CSS/JavaScript, with bounded retries and timeouts. A failed smoke check reports a failed workflow; it does not roll back the site automatically.

To run the same HTTP checks against a local production preview:

```bash
DOCS_SMOKE_ORIGIN=http://localhost:3000 npm run check:live
```

## License

See [LICENSE](LICENSE) for the Apache License 2.0 terms.
