---
title: GitHub Actions
description: Retain reports and upload results after failed tests while keeping CI failures visible.
slug: /integrations/github-actions
sidebar_position: 5
---

# GitHub Actions

This example runs an existing Playwright test project, installs the CLI, converts locally and submits CTRF using a checked HTTP request. Upload and artifact steps can run after test failures, while the test step remains failed. Cancellation is respected.

## Prerequisites

Commit your Playwright project configuration and npm lockfile. Configure the application's normal test server in that project. Set these repository Actions secrets/variables:

| Name | Kind | Value |
| --- | --- | --- |
| `TEST_PORTAL_API_KEY` | Secret | Destination project's upload key |
| `TEST_PORTAL_PACKAGE_TOKEN` | Secret | GitHub Packages token with access to the CLI |
| `TEST_PORTAL_URL` | Variable | Full backend CTRF API-key upload URL |

Package read permissions and a published CLI 1.1.2 are required. This workflow runs on trusted pushes/manual dispatch; review your trust/secrets policy before adding pull-request triggers. Test reports can contain application data: review artifact access and retention for your repository.

## Workflow

Save as `.github/workflows/test-portal.yml` in your test project. Use a fresh report directory in the job and your project's compatible Playwright dependency version.

```yaml
name: Tests and Test Portal
on:
  push:
  workflow_dispatch:
permissions:
  contents: read
jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version: '22'
          cache: npm
      - name: Install test dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      - name: Run tests
        env:
          PLAYWRIGHT_JSON_OUTPUT_NAME: reports/playwright.json
        run: |
          mkdir -p reports
          npx playwright test --reporter=json
      - name: Install integration CLI
        if: ${{ !cancelled() && hashFiles('reports/playwright.json') != '' }}
        env:
          NPM_TOKEN: ${{ secrets.TEST_PORTAL_PACKAGE_TOKEN }}
        run: |
          export NPM_CONFIG_USERCONFIG="$RUNNER_TEMP/test-portal.npmrc"
          printf '%s\n' '@vention-test-portal:registry=https://npm.pkg.github.com' '//npm.pkg.github.com/:_authToken=${NPM_TOKEN}' > "$NPM_CONFIG_USERCONFIG"
          npm install --global @vention-test-portal/test-portal-integration-cli@1.1.2
      - name: Convert report
        if: ${{ !cancelled() && hashFiles('reports/playwright.json') != '' }}
        run: |
          test-portal-cli --input reports/playwright.json --type playwright --output reports/report.ctrf.json
          node -e 'const r=require("./reports/report.ctrf.json"); if(!r.results.tests.length) process.exit(1)'
      - name: Upload and verify
        if: ${{ !cancelled() && hashFiles('reports/report.ctrf.json') != '' }}
        env:
          TEST_PORTAL_URL: ${{ vars.TEST_PORTAL_URL }}
          TEST_PORTAL_API_KEY: ${{ secrets.TEST_PORTAL_API_KEY }}
        run: |
          test -n "$TEST_PORTAL_URL"
          test -n "$TEST_PORTAL_API_KEY"
          status=$(curl --silent --show-error --fail-with-body --max-time 120 \
            --output upload-response.json --write-out '%{http_code}' \
            --header "X-API-Key: $TEST_PORTAL_API_KEY" \
            --form 'report=@reports/report.ctrf.json;type=application/json' \
            "$TEST_PORTAL_URL")
          test "$status" = 201
          node -e 'const r=require("./upload-response.json"); const c=require("./reports/report.ctrf.json"); if(r.success!==true || !r.executionId || r.specsProcessed!==c.results.tests.length) process.exit(1); console.log("Execution:", r.executionId)'
      - name: Retain test reports
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7.0.2
        with:
          name: test-reports
          path: reports/
          if-no-files-found: warn
          retention-days: 7
```

The example installs Chromium; configure a Chromium project or install additional browsers required by your tests. The example pins verified official Action releases to commit SHAs. Review [checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node), and [upload-artifact](https://github.com/actions/upload-artifact) releases when updating them. It targets GitHub-hosted runners; review action/runtime requirements before adapting it to self-hosted runners.

## Failure behavior

`!cancelled()` overrides the implicit success condition, so reporting can continue after failed tests. File conditions prevent uploading an absent report; they do not hide the original test failure. No `continue-on-error` is used. If setup fails before test execution there may be no report, and the job remains failed.

Conversion runs with no Test Portal webhook environment, so it cannot silently submit. Keep `TEST_PORTAL_URL` out of committed `.env` files in the test project as well. cURL exits nonzero on HTTP/network failures, HTTP 201 is required, and the body is checked for acceptance and count. We do not retry upload automatically because a lost response may follow a successful import.

The artifact step can retain source/converted reports after failed tests, conversion or upload. It intentionally excludes the HTTP response and registry configuration. Secrets never appear as literal workflow values.

## Verify results

Inspect the upload step's execution ID and the artifact counts, then open the same project/date in Test Portal **Results**. GitHub build metadata is detected by the CLI. For Jest/Cypress replace the producer/normalization/conversion steps using their [integration guides](index.md), and preserve equivalent failure conditions and count checks.

YAML and embedded shell commands are statically checked with these docs. Actual Actions execution, package access, and live upload require your repository/instance access; see [troubleshooting](../troubleshooting.md).
