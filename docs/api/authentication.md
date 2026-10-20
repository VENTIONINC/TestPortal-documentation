---
title: API authentication
description: Authenticate public report uploads using a project upload key or API access token.
slug: /api/authentication
sidebar_position: 2
---

# API authentication

## Recommended integration credential

Use a project **upload API key** for CLI/CI report ingestion. Create it in **Settings → Upload API Keys → Generate API Key**, selecting the destination project. Store it securely and send it in `X-API-Key`. The project comes from the key; adding a different `projectId` does not redirect an API-key upload.

```bash
curl --fail-with-body --show-error \
  --header "X-API-Key: $TEST_PORTAL_API_KEY" \
  --form 'report=@report.ctrf.json;type=application/json' \
  'https://portal.example.com/api/v2/upload-ctrf-report-api-key'
```

The URL is an example placeholder. Supply `TEST_PORTAL_API_KEY` securely; it is not an npm registry credential, MCP token or API JWT. See [account and credential setup](../getting-started/authentication.md).

## API access JWT

The equivalent upload routes **without** `-api-key` require `Authorization: Bearer` with a valid API access JWT and multipart `projectId`. Use your instance's supported sign-in flow to obtain access; account approval/active status may be required. Do not assume password login is available on every instance. Automated integrations should prefer the upload key instead of copying browser session credentials into CI.

```bash
curl --fail-with-body --show-error \
  --header "Authorization: Bearer $TEST_PORTAL_ACCESS_TOKEN" \
  --form "projectId=$TEST_PORTAL_PROJECT_ID" \
  --form 'report=@report.ctrf.json;type=application/json' \
  'https://portal.example.com/api/v2/upload-ctrf-report'
```

`TEST_PORTAL_ACCESS_TOKEN` and `TEST_PORTAL_PROJECT_ID` are environment variable names used by this cURL example, not additional CLI configuration options. Use an authorized project UUID.

## Verified authentication failures

| Response | Meaning | Resolution |
| --- | --- | --- |
| HTTP 401, `Missing X-API-Key header` | No upload key reached the API-key route | Check secret mapping and header spelling |
| HTTP 401, `Invalid API key` | The supplied key was not accepted | Copy the complete key from the intended instance |
| HTTP 401, `API key has been revoked or does not exist` | Key is no longer active | Generate a replacement and update the secret |
| JWT route returns 401/403 | Token or account state was rejected | Sign in again or contact the instance maintainer about account access |

Authentication errors have a JSON `error` field. Upload processing failures are documented in [report upload](report-upload.md). Revoke an exposed upload key in settings, then update consuming integrations. For MCP use its [dedicated token and setup](../mcp/getting-started.md).
