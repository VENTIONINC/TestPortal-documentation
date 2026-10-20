---
title: Inspect test results
description: Filter results, inspect failed attempts and open available diagnostic context.
slug: /guides/test-results
sidebar_position: 3
---

# Inspect test results

Start with an [uploaded report](../getting-started/first-report.md) and the destination project selected. Open **Results**. This page presents specs, execution cards and per-test outcomes together.

## Narrow the view

Use the filter panel to narrow by result status, review status, error message, period, issue name, spec tags/ID/file/name or execution type. Date selections control which days are displayed. Filters and day selection can hide results that were successfully imported; clear them when confirming your first upload.

Find a known test by spec name/file, then inspect its execution card. Read status, start time, duration and retry information if provided by the source report. Retry counts are distinct from additional separate test runs.

## Inspect a failure

1. Locate a failed result and select its error message to open the result context/issue dialog.
2. Review **Error** for the error message, call log and stack when available.
3. Use **Logs**, **Snippet** or **Test Case** only when those tabs appear. They depend on imported diagnostic data; a report need not contain all of them.
4. Expand the result context if you need more room to read it. Close the dialog when finished, or proceed with the deliberate [issue-assignment workflow](issues.md).

A missing diagnostic tab means that context is unavailable in the loaded data; it does not establish that the integration collected screenshots, source files or logs. The CLI's provider determines which source fields survive conversion.

## Interpret status and review separately

Pass/fail describes the test outcome. Issue association, category and review describe investigation of that outcome. Confirming an issue association does not rerun the test or change a failure into a pass. Automated suggestions require review against the actual error/context.

For example, a failed test may be associated with an infrastructure issue, while another failure is a product bug. The issue category and the test result status answer different questions.

## Check completeness

Compare the report's test list with imported results after clearing filters. For Playwright, project variants and retries affect what you expect to see; for Jest/Cypress, use the normalization/count checks in their [guides](../integrations/index.md). If a result is absent, check [troubleshooting](../troubleshooting.md) before changing the report or uploading again.
