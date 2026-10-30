---
title: Connect an MCP client
description: Configure authenticated Streamable HTTP and discover Test Portal tools.
slug: /mcp/getting-started
sidebar_position: 2
---

# Connect an MCP client

MCP lets a compatible assistant/client inspect Test Portal data and, for selected tools, create issues or review failures. You need an existing instance with MCP enabled, account/project access and a client supporting **Streamable HTTP with Bearer headers**. Confirm the deployed version with the instance maintainer; source support alone does not establish availability on every instance.

## Generate a token

1. Sign in and open **Settings → MCP**.
2. Choose **Generate MCP Token** (or **Regenerate Token** if replacing one).
3. Copy the token and note its displayed expiration. Supply it securely to your MCP client.
4. Update client credentials after regeneration/revocation. **Revoke** is available in this settings section.

This is a dedicated MCP token, not an upload API key, browser/API JWT or npm token. Do not publish it in shared client configuration.

## Connection parameters

| Setting | Value |
| --- | --- |
| Transport | Streamable HTTP |
| URL | `https://portal.example.com/api/v2/mcp` (replace origin) |
| Header | `Authorization: Bearer` followed by your MCP token |

Use your client's current remote-server configuration UI to enter these values. Client-specific JSON formats differ; the table specifies the server contract rather than claiming one universal configuration format. A client supporting only local stdio needs a separately verified bridge; do not launch the backend as a stdio server.

The transport initializes a session, then sends its `mcp-session-id` on later requests. Use a compatible client to manage initialize/initialized, session headers and event-stream responses; a bare JSON POST without initialization is not a complete setup.

Discover the current tool catalog after connecting. The current server exposes `testportal-find-action` and `testportal-execute-action`. Former individual tool names are now action IDs and cannot be called directly. See [migration guidance](tools.md#migrate-existing-clients).

## Reproducible Node client example

This example uses the same MCP SDK version as the inspected backend. In a separate example directory with Node.js 22, install it:

```bash
npm install @modelcontextprotocol/sdk@1.29.0
```

Save as `connect.mjs`. Set `TEST_PORTAL_MCP_URL` to your instance's MCP URL and supply `TEST_PORTAL_MCP_TOKEN` securely. These are variables for this example, not CLI upload settings.

```javascript
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
const url = process.env.TEST_PORTAL_MCP_URL;
const token = process.env.TEST_PORTAL_MCP_TOKEN;
if (!url || !token) throw new Error('Supply MCP URL and token');
const transport = new StreamableHTTPClientTransport(new URL(url), {
  requestInit: {headers: {Authorization: `Bearer ${token}`}},
});
const client = new Client({name: 'test-portal-example', version: '1.0.0'});
try {
  await client.connect(transport);
  const {tools} = await client.listTools();
  console.log(tools.map(tool => tool.name));
  const result = await client.callTool({name: 'testportal-execute-action', arguments: {actionId: 'testportal-check-status', arguments: {}}});
  if (result.isError) throw new Error('Status tool failed');
  console.log(result.content);
} finally {
  await client.close();
}
```

```bash
node connect.mjs
```

Expect tool discovery and a text content block containing status `ok`, a timestamp and service `test-portal-server`. This verifies the MCP request path, not database health. Compare discovered names/schemas with the [tool reference](tools.md); deployed older versions can differ.

## Common errors

| Response | Resolution |
| --- | --- |
| 401, `Invalid or expired MCP token` | Generate/update the dedicated token and reconnect |
| 401, missing/invalid authorization header | Ensure the client sends Bearer authentication on every request |
| 400, `Bad Request: No valid session ID provided` or `Invalid or missing session ID` | Reinitialize the connection; do not reuse a stale session |
| 403, `MCP session belongs to a different user` | Open a new session for the intended account |
| 500/server configuration failure | Ask the instance maintainer to check MCP availability; changing upload keys will not fix it |

Tool-level errors may arrive inside a successful HTTP response as `isError: true`; inspect the content, not just HTTP status. See [troubleshooting](../troubleshooting.md). Live connection/tool discovery requires an authorized instance and is separate from static validation of this example.
