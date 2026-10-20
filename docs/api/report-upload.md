---
title: Upload reports with REST
description: Submit CTRF or Playwright JSON as multipart files and check the import response.
slug: /api/report-upload
sidebar_position: 3
---

# Upload reports with REST

This reference selects the public report-ingestion interface used by integrations and upload-key settings. It is not a catalog of every backend route. Examples assume an accessible instance and authorized project.

## Choose the matching route

All paths below include the backend's `/api` prefix. Replace the example backend origin with the address supplied by your maintainer.

| POST path | File contents | Authentication | Additional field |
| --- | --- | --- | --- |
| `/api/v2/upload-ctrf-report-api-key` | CTRF JSON, including CLI output | `X-API-Key` | None; key selects project |
| `/api/v2/upload-ctrf-report` | CTRF JSON | API JWT Bearer | `projectId` |
| `/api/v2/upload-json-report-api-key` | Raw Playwright JSON | `X-API-Key` | None; key selects project |
| `/api/v2/upload-json-report` | Raw Playwright JSON | API JWT Bearer | `projectId` |

Use **multipart/form-data**, with one JSON file in field **`report`**. The file limit is **50 MiB**. Let cURL create the multipart boundary. The raw JSON route is specifically a Playwright transform, not a general-purpose JSON importer. Jest and Cypress must be converted to CTRF first. The CLI always sends CTRF and therefore needs a CTRF endpoint.

## Minimal CTRF example

Save as `report.ctrf.json`. This is synthetic sample data, with one passed test and timestamps in epoch milliseconds:

```json
{
  "reportFormat": "CTRF",
  "specVersion": "0.0.0",
  "results": {
    "tool": {"name": "example"},
    "summary": {
      "tests": 1, "passed": 1, "failed": 0,
      "pending": 0, "skipped": 0, "other": 0,
      "start": 1792490400000, "stop": 1792490400012
    },
    "tests": [{
      "name": "sample check", "status": "passed", "duration": 12,
      "filePath": "example.spec.ts", "suite": ["Sample suite"]
    }]
  }
}
```

For normal runs, use a [framework guide](../integrations/index.md) to generate and inspect CTRF instead of inventing a payload. In particular, test names/files and summary timestamps affect where results appear in the UI.

## Submit and assert acceptance

Run in Bash with error handling enabled, with `TEST_PORTAL_API_KEY` supplied securely:

```bash
set -e
status=$(curl --silent --show-error --fail-with-body --max-time 120 \
  --output upload-response.json --write-out '%{http_code}' \
  --header "X-API-Key: $TEST_PORTAL_API_KEY" \
  --form 'report=@report.ctrf.json;type=application/json' \
  'https://portal.example.com/api/v2/upload-ctrf-report-api-key')
test "$status" = 201
node -e 'const r=require("./upload-response.json"); if(r.success!==true || !r.executionId) process.exit(1); console.log("Execution:",r.executionId,"Specs:",r.specsProcessed)'
```

A successful import returns HTTP **201**. The following is an illustrative response, not live evidence; the UUID and count depend on the report:

```json
{
  "success": true,
  "executionId": "11111111-1111-4111-8111-111111111111",
  "specsProcessed": 1
}
```

Additional analysis fields may be present depending on report path and instance/user configuration. Do not require them for upload acceptance. Compare `specsProcessed` with the expected submitted tests and retain the execution ID for [UI verification](../guides/test-executions.md).

## Raw Playwright JSON

Use the source report from the [Playwright guide](../integrations/playwright.md), before CLI conversion:

```bash
curl --fail-with-body --show-error \
  --header "X-API-Key: $TEST_PORTAL_API_KEY" \
  --form 'report=@reports/playwright.json;type=application/json' \
  'https://portal.example.com/api/v2/upload-json-report-api-key'
```

JWT alternatives use the corresponding route and `projectId` shown in [authentication](authentication.md). Keep raw and converted reports distinguishable so they cannot be sent to the wrong route.

## Errors and retries

| Symptom | Verified behavior and resolution |
| --- | --- |
| 401 | Check the key/header with [authentication](authentication.md) |
| 400, `Only JSON files are allowed` | Supply a JSON file, with JSON MIME type/extension |
| 400 from CTRF processing | JSON body has `error` prefixed `Failed to process raw CTRF report file.`; check the suffix |
| Missing file suffix `CTRF report file is required` | Use multipart field `report` |
| Missing project suffix `Missing required form field: projectId` | Add `projectId` on the JWT CTRF route |
| Missing CTRF results/tests | Suffix is `Invalid CTRF report format - missing results object` or `Invalid CTRF report format - missing or invalid tests array` |
| Malformed JSON | Error includes `Invalid JSON format in uploaded file:`; validate the file before sending |
| Oversized file | Reduce/split the report below 50 MiB; intermediaries may impose smaller limits |
| Timeout/network failure | Confirm backend address, connection and observed import before retrying |

A proxy can return a different status/body, so distinguish its response from application JSON. A timeout is not proof that no data was saved. Do not blindly retry an uncertain upload: first inspect Results/execution data to avoid duplicate imports. See [troubleshooting](../troubleshooting.md).

These contracts are checked against the recorded source baseline. To complete live acceptance, upload a sanitized report to a disposable project, check status/body/count and find the same execution in the UI; then test a missing/invalid key and malformed report without recording credentials.
