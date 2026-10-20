---
title: Test Portal
description: Understand the Test Portal ecosystem and its main user workflows.
slug: /intro
sidebar_position: 1
---

# Test Portal

Test Portal brings test execution reports together so teams can inspect results and investigate failures. Its web application provides access to results, executions, and issues within a selected project.

## Choose a starting point

- [Getting Started](getting-started/index.md): prepare access to an existing instance and project.
- [Integrations](integrations/index.md): choose a report format for your framework.
- [CLI](cli/index.md): understand report conversion and submission.
- [API](api/index.md): understand authentication and report uploads.
- [MCP](mcp/index.md): connect a compatible client to your test data.
- [User Guides](guides/index.md): understand how results and issues fit together.

## The ecosystem

The web application lets you explore test data. The backend accepts reports and provides REST and MCP interfaces. The integration CLI converts framework-specific reports into CTRF and can submit them to a configured upload endpoint.

An existing Test Portal instance is required to store and explore reports. Converting a report locally with the CLI does not require a running Test Portal instance.
