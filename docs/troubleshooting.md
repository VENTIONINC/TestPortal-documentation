---
title: Troubleshooting
description: Diagnose credential, report, upload, CLI and results visibility problems.
slug: /troubleshooting
sidebar_position: 2
---

# Troubleshooting

Start by separating source report generation, local conversion, HTTP upload acceptance and UI visibility. Preserve the source/converted files and a sanitized HTTP status/response. Do not collect secrets, full authorization headers or unreviewed application logs when requesting help.

## Before requesting help

Share the evidence relevant to the failing stage, when available:

- The stage that failed: source report generation, local conversion, HTTP upload, or UI inspection.
- The test framework and `test-portal-cli` versions.
- The report timestamp.
- The HTTP status and a sanitized response, if an HTTP request was made.
- The execution ID, if one was returned.
- Expected and observed result counts, noting whether each count comes from the source report, converted report, or UI.

Before sharing evidence, remove API keys, authorization headers, and sensitive report data. Do not attach full reports or unreviewed logs.

## Authentication and invalid API keys

**Symptom:** HTTP 401 or an authentication error during upload.

**Likely causes:** Wrong credential type, missing header, revoked key, wrong instance, or API-key/JWT endpoint mismatch.

**Resolution:** Use an upload key in `X-API-Key` on an `-api-key` route. Confirm the key's project and instance in **Settings → Upload API Keys**. Exact verified errors include `Missing X-API-Key header`, `Invalid API key`, and `API key has been revoked or does not exist`. Generate a replacement when needed and update the secret. A GitHub Packages token or MCP token cannot replace an upload key. See [authentication](api/authentication.md).

For UI sign-in failure, use the instance's configured login flow; check approval/account access with the maintainer rather than assuming self-signup grants access.

## Wrong upload endpoint

**Symptom:** 404/405, an HTML response, or format-processing failure.

**Likely causes:** UI origin instead of backend origin, missing `/api/v2`, wrong method or mismatched report type.

**Resolution:** Use POST and the complete [upload path](api/report-upload.md). CLI output is CTRF: submit it to `/api/v2/upload-ctrf-report-api-key`. Raw Playwright JSON uses `/api/v2/upload-json-report-api-key`. Jest/Cypress source JSON is not accepted by the Playwright transform. Check proxy routing with the instance maintainer if the documented backend path returns HTML.

## Unsupported format or invalid report

**Symptom:** CLI error, HTTP 400, zero converted tests or incomplete names.

**Likely causes:** HTML supplied instead of JSON, incorrect provider, incompatible producer output or malformed payload.

**Resolution:** Validate JSON locally and compare the source to its framework guide. The CLI can report `Unsupported provider: ...` or `Invalid <provider> format in file: ...`; the variable parts depend on your input. Required flags are `--input` and `--type`, not positional arguments.

Use [Jest normalization](integrations/jest.md) for the expected file-path field, and [Cypress normalization](integrations/cypress.md) to flatten suites/title arrays. Stop on a count mismatch. A zero exit does not establish complete conversion; inspect `results.tests` against the source.

For CTRF uploads, missing `results` or `tests` produces the verified suffixes listed in [REST errors](api/report-upload.md#errors-and-retries). Upload a JSON file with multipart field `report`, not a bare JSON request body. The file limit is 50 MiB; proxies can set smaller limits.

## CLI configuration and output

**Symptom:** Command missing, no output file, unexpected upload, or JSON mixed with log text.

**Likely causes:** Global npm executable directory absent from PATH, webhook enabled by environment/`.env`, `--stdout` taking precedence over `--output`, or unwritable output location.

**Resolution:** Check `test-portal-cli --version` and [installation](cli/installation.md). Check variable presence without printing key values. Remove `TEST_PORTAL_URL` from both the shell environment and `.env` for local-only conversion. Ensure the output directory exists. A webhook suppresses implicit local file output; specify `--output` to keep a file. Console output can include logs; parse the output file instead. See [configuration](cli/configuration.md).

## Upload appears successful but was rejected

**Symptom:** CLI exits 0 and prints conversion success, yet no imported execution is visible.

**Likely cause:** CLI 1.1.2 logs webhook failures without propagating a failing exit code.

**Resolution:** Look for `Webhook failed` versus `Successfully sent to webhook`. Convert locally and use the [checked cURL flow](getting-started/first-report.md#3-submit-and-check-the-response) to require HTTP 201, `success: true`, an execution ID and the expected processed count. Do not treat conversion success as HTTP acceptance. The [Actions example](integrations/github-actions.md) does this explicitly.

## Timeout or network failure

**Symptom:** Webhook network error, cURL connection/TLS failure, or `Request timed out after ...ms`.

**Likely causes:** Wrong/unreachable backend address, network/proxy/certificate configuration, or processing slower than the request timeout.

**Resolution:** Confirm the backend address, network access and certificate trust. CLI timeout defaults to 30000 ms per attempt; use a suitable positive `--timeout` only after checking connectivity. Default `--retries 3` means three total attempts. `--no-verify-ssl` is exposed but its behavior is not established as working in this version; fix trust configuration instead.

Before retrying, check whether the original execution was imported: a lost/timed-out response can follow a successful save. Avoid multiplying an uncertain upload. Escalate persistent server/proxy failures with a sanitized timestamp, status and execution ID if known.

## Results do not appear

**Symptom:** HTTP import was accepted but the expected results are absent from the current view.

**Likely causes:** Different selected project, a period/day selection excluding the report timestamps, persisted filters, or a source/conversion count problem.

**Resolution:**

1. Check `success`, `executionId` and `specsProcessed` in the upload response.
2. Select the project encoded by the upload key, or the JWT upload's `projectId`.
3. Open **Results**, include the report's date and select the relevant day. The synthetic tutorial sample is dated 20 October 2026.
4. Clear status/review/issue/tag/spec/type filters, then locate the known file/test name.
5. Compare source counts with converted `results.tests`, especially for Jest/Cypress. Check the submitted file is from the current run.
6. Reload the view after a confirmed import. If it is still absent, give the maintainer a sanitized response/execution ID and report timestamps.

See [executions](guides/test-executions.md) and [results](guides/test-results.md). Missing AI suggestions or issue links do not mean the test report was lost.

## MCP connection or tool error

Use the dedicated token and full Streamable HTTP URL from [MCP setup](mcp/getting-started.md). Regenerate expired tokens and reconnect to initialize a new session. Check both HTTP/protocol errors and tool `isError`. If a tool is missing, compare live discovery with the deployed version; do not assume every backend export is a public tool. Review [tool inputs](mcp/tools.md), including string issue pagination versus numeric result pagination.
