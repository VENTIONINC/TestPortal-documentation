---
title: Inspect test executions
description: Find uploaded runs inside Results and interpret their execution cards.
slug: /guides/test-executions
sidebar_position: 2
---

# Inspect test executions

An **execution** groups a test run. A **spec** identifies a test, and a **result** records its outcome in an execution. The Results screen groups results by spec, then shows the related execution cards. You do not need a separate executions route.

## Find an uploaded run

1. Sign in and select the project associated with your upload key or JWT upload's `projectId`.
2. Open **Results** from navigation.
3. Set the period to include the report's timestamps. Select the relevant day in the date controls. For the first-report fixture this is 20 October 2026, not necessarily today.
4. Clear unrelated status, review status, issue, tag, spec and execution-type filters.
5. Find the spec by its name or source file. Inspect its execution card below it.

The same execution can appear beneath multiple specs. A file name and test name are useful landmarks; do not expect an execution to be represented by just one top-level row.

## Read an execution card

The header shows execution name, environment, type and provider when available. Result rows show status, timing/duration and retry information where present. Metadata comes from the submitted report and integration configuration; absent metadata is not evidence an upload failed.

CI links appear only when corresponding metadata is present. The CLI can detect GitHub Actions run/repository metadata; optional `TEST_ENVIRONMENT` and `EXECUTION_TYPE` describe your run. See [CLI configuration](../cli/configuration.md).

## Confirm import acceptance

Keep the upload response's `executionId` and `specsProcessed`, then compare expected specs/tests and outcomes in the same project/date. The UI's current filters can show a subset of the imported run. A successful CLI exit or a status counter alone does not establish that all expected results were imported.

For detailed failures, continue with [test results](test-results.md). For missing runs, follow [results troubleshooting](../troubleshooting.md#results-do-not-appear) before resubmitting.
