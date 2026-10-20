---
title: CLI command reference
description: Use verified CLI flags, provider names, output modes and submission examples.
slug: /cli/commands
sidebar_position: 4
---

# CLI command reference

```bash
test-portal-cli --input report.json --type playwright --output report.ctrf.json
```

There are no subcommands or positional report arguments. `--input` and `--type` are required except for help/version. Provider names are case-insensitive in lookup; use the lowercase names below.

## Options

| Option | Meaning | Default |
| --- | --- | --- |
| `-i, --input <path>` | Source report file; required | None |
| `-t, --type <provider>` | Source provider; required | None |
| `-o, --output <path>` | CTRF output file | Derived local filename when no webhook |
| `--stdout` | Print CTRF instead of writing a file | Off |
| `--webhook <url>` | Submit multipart CTRF | `TEST_PORTAL_URL` if set |
| `--headers <json>` | Additional request headers as JSON | Multipart headers; upload key from environment |
| `--method <method>` | Webhook HTTP method | `POST` |
| `--timeout <ms>` | Per-request timeout | `30000` |
| `--retries <count>` | Total request attempts | `3` |
| `--retry-delay <ms>` | Initial exponential delay | `1000` |
| `--verify-ssl` | Enable certificate verification | Enabled |
| `--no-verify-ssl` | Requests certificate bypass; see configuration caveat | Off |
| `-h, --help` | Show help | — |
| `-V, --version` | Show CLI version | — |

`POST`, `PUT` and `PATCH` appear in CLI help for generic webhooks. Test Portal's documented upload routes require **POST**. Do not override the multipart `Content-Type` boundary with `--headers`. The environment API key takes precedence over a custom `X-API-Key` header.

## Provider names and input boundaries

The registry contains `playwright`, `jest`, `cypress`, `junit`, `vitest`, `nunit`, `mocha`, `pytest` and `testng`. These guides verify [Playwright](../integrations/playwright.md), [Jest](../integrations/jest.md) and [Cypress](../integrations/cypress.md). A provider name describes its expected source format; arbitrary JSON or a framework's HTML report is not interchangeable with it. Standard Jest/Mochawesome JSON needs the normalization described in those guides for this CLI version.

## Local conversion

Ensure no `TEST_PORTAL_URL` is loaded from the environment or `.env`:

```bash
unset TEST_PORTAL_URL
test-portal-cli -i report.json -t playwright -o report.ctrf.json
```

Inspect the file's `results.tests` array and summary before submitting. For console inspection:

```bash
test-portal-cli -i report.json -t playwright --stdout
```

## Remote submission

Supply `TEST_PORTAL_API_KEY` securely, and replace the example origin with your backend:

```bash
test-portal-cli -i report.json -t playwright -o report.ctrf.json \
  --webhook 'https://portal.example.com/api/v2/upload-ctrf-report-api-key' \
  --timeout 60000 --retries 1
```

The body is a multipart JSON file named `report`, containing CTRF. The upload key determines the project. Use the [REST upload guide](../api/report-upload.md) to submit saved CTRF and inspect the actual HTTP response.

## Exit behavior

Help/version return successfully. Missing required options, invalid input/provider, malformed header JSON, and output write failures produce errors and a nonzero exit (normally 1).

A webhook HTTP/network failure is logged as `Webhook failed` but the converter returns normally: the process can exit **0** and print a conversion success message after a rejected upload. `Successfully sent to webhook` indicates a successful HTTP result, but the CLI does not print the response execution ID. For reliable automation, convert locally and use cURL with an explicit HTTP/body check, as in [GitHub Actions](../integrations/github-actions.md). Confirm the execution in the UI.
