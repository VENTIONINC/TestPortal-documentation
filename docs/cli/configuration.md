---
title: Configure the CLI
description: Configure report submission, output, metadata, retries and certificate validation.
slug: /cli/configuration
sidebar_position: 3
---

# Configure the CLI

The CLI loads `.env` from the current working directory through dotenv. Existing process environment values take precedence. Keep credential-bearing `.env` files out of version control. A `--webhook` argument overrides `TEST_PORTAL_URL`.

## Required values for submission

| Value | Meaning | Default |
| --- | --- | --- |
| `TEST_PORTAL_URL` | Full report-upload URL, including `/api/v2/upload-ctrf-report-api-key` | No URL; local conversion |
| `TEST_PORTAL_API_KEY` | Upload API key sent as `X-API-Key` | No key |

Set the API key through a secure environment/secret manager. Use your instance's backend address, which may differ from its UI address. This URL is an example placeholder:

```bash
export TEST_PORTAL_URL='https://portal.example.com/api/v2/upload-ctrf-report-api-key'
test-portal-cli --input report.json --type playwright --output report.ctrf.json
```

This command both writes a file and uploads because a URL is configured. For local conversion only, remove the webhook environment value and omit `--webhook`:

```bash
unset TEST_PORTAL_URL
test-portal-cli --input report.json --type playwright --output report.ctrf.json
```

A `.env` file can restore the value after `unset`. For local-only work, also remove `TEST_PORTAL_URL` from that directory's `.env`, or run in a directory without it. `--stdout` and `--output` do **not** turn off an enabled webhook.

## Output selection

Output is CTRF JSON. `--stdout` takes precedence over `--output`. Otherwise an explicit `--output` writes the file; without either option or a webhook, `report.json` becomes `report.unified.json`. Despite that suffix, the file contains CTRF. Parent output directories must already exist.

With only a webhook configured, no implicit file is saved. Success/error log lines can accompany console JSON, particularly with webhooks, so prefer `--output` when another tool must parse the result.

## Metadata

| Environment variable | Use |
| --- | --- |
| `TEST_ENVIRONMENT` | Nonempty value becomes the report environment; defaults to `ci` when a known CI is detected |
| `EXECUTION_TYPE` | Nonempty execution classification, for example `smoke` |
| `GIT_REPOSITORY_NAME`, `GIT_REPOSITORY_URL`, `GIT_BRANCH_NAME` | Explicit repository/branch metadata overriding detected values |

GitHub Actions, GitLab CI, Jenkins and Azure CI variables can supply build/repository metadata automatically. These metadata values are optional; they are not upload credentials.

## Timeout, retry and TLS settings

`--timeout` defaults to **30000 milliseconds per request**. `--retries` defaults to **3 total attempts**, including the first request. `--retry-delay` defaults to **1000 milliseconds**, doubled between attempts up to a 10000 ms cap. Use positive integer values; the command parser does not validate ranges. Failed HTTP responses can be retried, so repeated submissions are possible; verify the outcome before resubmitting manually.

SSL certificate verification defaults to enabled (`--verify-ssl`). `--no-verify-ssl` is exposed, but its Axios agent configuration is not established as working in this version. Fix the certificate/trust configuration with your instance maintainer instead of relying on that switch.

See [commands and exit behavior](commands.md) before using the CLI as a CI acceptance check.
