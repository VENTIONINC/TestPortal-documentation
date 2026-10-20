---
title: Get access and credentials
description: Choose the right credential for the UI, report uploads and MCP.
slug: /getting-started/authentication
sidebar_position: 3
---

# Get access and credentials

You need an existing accessible Test Portal instance, a usable account, and a project. Ask the instance maintainer for the UI address, backend address and supported sign-in method. Sign-up availability and approval depend on the instance; creating an account does not guarantee immediate access. Sign in and select a project before inspecting reports.

## Choose the right credential

| Purpose | Credential | Where it is used |
| --- | --- | --- |
| Browser UI | Your instance's sign-in flow | Browser session |
| CLI/CI report upload | Project upload API key | `X-API-Key` request header |
| Direct authenticated report upload | API access JWT | `Authorization: Bearer` on JWT upload routes |
| MCP client | Dedicated MCP token | `Authorization: Bearer` on the MCP endpoint |
| CLI package installation | GitHub Packages read token | npm registry authentication |

These credentials are distinct. An upload key cannot authenticate MCP or sign you into the UI.

## Create an upload API key

1. Sign in to the UI and open **Settings → Upload API Keys**.
2. Choose **Generate API Key** and select the destination project in the dialog.
3. Copy the generated key securely. The list also provides a copy control for your keys.
4. Supply it as `TEST_PORTAL_API_KEY` in your shell's secret environment or CI secrets. Do not paste it into reports, committed files, logs or screenshots.

A key identifies its project; API-key uploads do not need a separate `projectId`. Deleting a key from this settings screen revokes it. Update CI secrets when replacing a key.

For direct JWT requests and verified authentication errors, see [API authentication](../api/authentication.md). To connect an assistant, generate a separate token using [MCP setup](../mcp/getting-started.md).

Continue with [CLI installation](../cli/installation.md) and [your first report](first-report.md).
