---
title: What is Test Portal?
description: Bring test reports together and investigate executions, results and issues.
slug: /intro
sidebar_position: 1
---

# What is Test Portal?

Test Portal brings test-run data into one place so teams can inspect outcomes, investigate failures and associate recurring errors with issues. Use it to review local or CI runs, compare reported outcomes, and give people or compatible MCP clients a shared view of test data.

## How the parts fit together

- Your test framework generates a source report.
- The integration CLI converts a supported report into CTRF and can submit it to an existing instance.
- The backend accepts report uploads through authenticated REST endpoints and exposes the selected MCP interface.
- The web application displays project-scoped results, execution context and issue investigations.

An execution represents a run; a spec identifies a test; a result records an outcome in a run. An issue describes a failure/cause, and an assumption proposes an association between an issue and a result error. Review and issue category are separate from pass/fail status.

## Choose a workflow

Start with [your first report](getting-started/first-report.md) if you have an accessible instance, account and project. The [quickstart](getting-started/quickstart.md) connects credentials, installation, conversion, upload and UI verification.

Use [framework integrations](integrations/index.md) for Playwright, Jest or Cypress. Automate reporting with [GitHub Actions](integrations/github-actions.md), or submit existing CTRF using the [REST upload interface](api/report-upload.md). Connect an assistant with [MCP](mcp/getting-started.md) to query data and perform deliberate issue/review operations.

The detailed [CLI reference](cli/commands.md) explains format boundaries and exit behavior. [User guides](guides/index.md) help you inspect imported results and investigate issues. Availability of analysis and sign-in features depends on your instance's configuration and deployed version.
