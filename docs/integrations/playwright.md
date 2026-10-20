---
title: Playwright
description: Generate Playwright JSON, convert it to CTRF and upload the results.
slug: /integrations/playwright
sidebar_position: 2
---

# Playwright

## Overview

Use Playwright's JSON reporter with CLI provider `playwright`. HTML and blob reports are different formats. The converter flattens nested suites and carries retry information into CTRF; the final attempt determines the final test status.

## Prerequisites

Use a working Playwright project with its dependencies/browser setup, an accessible Test Portal instance/project, an [upload key](../getting-started/authentication.md), and [CLI 1.1.2](../cli/installation.md). The CLI's Node minimum does not override your Playwright version's requirements.

## Generate the source report

From your test project:

```bash
mkdir -p reports
PLAYWRIGHT_JSON_OUTPUT_NAME=reports/playwright.json npx playwright test --reporter=json
```

This uses the [official JSON reporter](https://playwright.dev/docs/test-reporters#json-reporter). Keep your application's usual server/configuration setup. Tests can return nonzero while still writing a report; do not discard that file or turn the test failure into success.

## Configure Test Portal

Supply `TEST_PORTAL_API_KEY` securely and set `TEST_PORTAL_URL` to your backend's full `/api/v2/upload-ctrf-report-api-key` URL. See [configuration](../cli/configuration.md). The example origin in these docs must be replaced.

## Convert and upload

For direct CLI submission:

```bash
test-portal-cli --input reports/playwright.json --type playwright \
  --output reports/playwright.ctrf.json --webhook "$TEST_PORTAL_URL"
```

Check the saved `results.tests` array against the source test count and inspect the webhook log. A successful exit alone does not prove upload acceptance. For scripts, prefer local conversion without a configured webhook, followed by [cURL with response assertions](../getting-started/first-report.md#3-submit-and-check-the-response). [GitHub Actions](github-actions.md) provides that complete workflow.

## Verify the results

Expect CTRF tool name `playwright`, test names prefixed with the Playwright project name, statuses based on final attempts, and retries when present. In **Results**, select the key's project and report date, then inspect the spec and its execution card. Failed attempts/errors depend on report contents; conversion does not manufacture missing diagnostics.

## Troubleshooting

`Invalid playwright format in file` means the input did not match the provider: inspect for JSON `suites` and `config`. Do not pass the HTML report. For empty or incomplete results, compare the actual tests array with the source, including project variants/retries. For HTTP failures or missing results use [troubleshooting](../troubleshooting.md).
