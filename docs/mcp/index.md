---
title: MCP
description: Understand the Test Portal MCP connection and authentication requirements.
slug: /mcp
sidebar_position: 1
---

# MCP

Test Portal exposes an MCP endpoint at `/api/v2/mcp` on your backend instance. It uses Streamable HTTP and requires an MCP token in an `Authorization: Bearer` header.

## Prepare a connection

Obtain an MCP token through the web application's MCP settings. Configure your MCP client with the backend endpoint and the required authorization header using that client's supported format.

An upload API key is intended for report submission and does not replace an MCP token.

## Available operations

Registered tools include result and execution lookup, issue operations, and failure review. Some tools modify data. Review the tools discovered by your client and their input requirements before invoking them.

Tool exports and documentation lists can differ from the tools actually registered by the server. Use the registered tools of your instance when determining availability.
