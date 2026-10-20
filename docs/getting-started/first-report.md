---
title: Upload your first report
description: Convert a small Playwright sample, upload CTRF and find the resulting execution.
slug: /getting-started/first-report
sidebar_position: 4
---

# Upload your first report

This tutorial uses a **synthetic one-test sample** to verify the integration path. It does not run or validate your application. Use [framework integrations](../integrations/index.md) for actual test runs.

## Before you start

Have an existing Test Portal instance, an active account/project, a project [upload API key](authentication.md), the [CLI installed](../cli/installation.md), Node.js and cURL with `--fail-with-body` support. Know the backend origin; it can differ from the UI origin.

The example domain below is a placeholder, not a default or hosted demo. Supply the real API key securely as `TEST_PORTAL_API_KEY`. Run local conversion in a directory without a `TEST_PORTAL_URL` entry in `.env`.

## 1. Save a supported source report

Save this complete JSON as `report.json`. The example date is sample data; use that date when finding it in the UI.

```json
{
  "config": {"version": "sample"},
  "suites": [{
    "title": "Sample suite",
    "file": "example.spec.ts",
    "specs": [{
      "title": "sample check",
      "file": "example.spec.ts",
      "line": 1,
      "tests": [{
        "projectName": "sample",
        "status": "expected",
        "results": [{
          "retry": 0,
          "status": "passed",
          "duration": 12,
          "startTime": "2026-10-20T10:00:00.000Z"
        }]
      }]
    }]
  }],
  "stats": {"startTime": "2026-10-20T10:00:00.000Z", "duration": 12}
}
```

## 2. Convert to CTRF

```bash
unset TEST_PORTAL_URL
test-portal-cli --input report.json --type playwright --output report.ctrf.json
node -e 'const r=require("./report.ctrf.json"); if(r.results.tests.length!==1 || r.results.tests[0].status!=="passed") process.exit(1); console.log(r.results.summary)'
```

Expect one passed test and a CTRF `results` object. If no file appears, check the input path and writable output directory.

## 3. Submit and check the response

The CLI supports direct webhook submission, but its exit code alone does not prove upload success. This tutorial uses cURL to make the outcome explicit:

```bash
set -e
export TEST_PORTAL_URL='https://portal.example.com/api/v2/upload-ctrf-report-api-key'
status=$(curl --silent --show-error --fail-with-body \
  --output upload-response.json --write-out '%{http_code}' \
  --header "X-API-Key: $TEST_PORTAL_API_KEY" \
  --form 'report=@report.ctrf.json;type=application/json' \
  "$TEST_PORTAL_URL")
test "$status" = 201
node -e 'const r=require("./upload-response.json"); if(r.success!==true || !r.executionId || r.specsProcessed!==1) process.exit(1); console.log("Execution:",r.executionId)'
```

Run these commands in a shell that stops on errors (for example, enable `set -e`), and stop if cURL or either check fails. Success is HTTP **201**, `success: true`, an `executionId`, and `specsProcessed: 1`. Generated IDs vary. See [report upload](../api/report-upload.md) for the full response and error handling.

## 4. Inspect it in the UI

1. Open the instance UI and select the same project used to create the upload key.
2. Open **Results** and include **20 October 2026** in the period. Select that day's results; clear other restrictive filters.
3. Find the `example.spec.ts` / `sample check` spec and its execution card. The test name includes the `sample` project prefix.
4. Confirm a passed result and the uploaded sample's timing. Executions are grouped inside Results; there is no separate executions page to open.

If it is missing, compare the response/project/date with [results troubleshooting](../troubleshooting.md#results-do-not-appear). Continue with [execution guides](../guides/test-executions.md) or submit a real [framework report](../integrations/index.md).
