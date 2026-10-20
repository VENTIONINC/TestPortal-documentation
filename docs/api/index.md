---
title: API
description: Understand the public report-upload interfaces and their credentials.
slug: /api
sidebar_position: 1
---

# API

Test Portal provides report-upload routes for raw JSON reports and CTRF reports. Use the endpoint that matches the payload; these formats are not interchangeable.

## Upload credentials

API-key uploads use the `X-API-Key` header and derive the destination project from the key. JWT-authenticated uploads require the destination project as a form field.

Reports are sent as a JSON file in the multipart form field named `report`. The audited upload middleware limits a file to 50 MiB.

## Choose the correct interface

The integration CLI converts framework reports to CTRF before submission. Configure it with a CTRF upload endpoint, rather than a raw framework JSON endpoint.

An MCP connection uses its own Bearer token. See the [MCP overview](../mcp/index.md).
