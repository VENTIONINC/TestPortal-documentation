---
title: Quickstart
description: Go from an existing Test Portal account to an uploaded report and visible results.
slug: /getting-started/quickstart
sidebar_position: 2
---

# Quickstart

You need an existing accessible Test Portal instance. These steps connect to that instance; ask its maintainer for UI/backend addresses and account/project access.

1. **Sign in and select a project.** Use your instance's supported sign-in method. Account approval may be required.
2. **Get upload credentials.** In **Settings → Upload API Keys**, generate a key for the destination project. Supply it securely as `TEST_PORTAL_API_KEY`; see [authentication](authentication.md).
3. **Install the CLI.** Follow [registry setup and installation](../cli/installation.md). Version 1.1.2 uses GitHub Packages, package read access and the executable `test-portal-cli`.
4. **Generate a report.** Follow [Playwright](../integrations/playwright.md), [Jest](../integrations/jest.md), or [Cypress](../integrations/cypress.md), or use the complete sample in [your first report](first-report.md).
5. **Convert it locally.** For Playwright JSON, with no webhook loaded from `.env`:

   ```bash
   unset TEST_PORTAL_URL
   test-portal-cli --input report.json --type playwright --output report.ctrf.json
   ```

6. **Upload it.** Supply your backend's full CTRF API-key URL as `TEST_PORTAL_URL`:

   ```bash
   curl --fail-with-body --show-error \
     --header "X-API-Key: $TEST_PORTAL_API_KEY" \
     --form 'report=@report.ctrf.json;type=application/json' \
     "$TEST_PORTAL_URL"
   ```

   Expect HTTP 201 and JSON containing `success: true`, `executionId` and `specsProcessed`. Use the [first-report tutorial](first-report.md#3-submit-and-check-the-response) for executable response assertions. The CLI's success exit alone is insufficient to establish upload acceptance.

7. **Open Results in the UI.** Select the upload key's project, include the report's date in the period and select the relevant day. Inspect the spec's execution card, status and errors. See [test results](../guides/test-results.md).

Use [GitHub Actions](../integrations/github-actions.md) to repeat this workflow in CI, including reporting after failed tests.
