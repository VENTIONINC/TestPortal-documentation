---
title: Investigate and manage issues
description: Associate failures with issues and inspect their occurrence statistics.
slug: /guides/issues
sidebar_position: 4
---

# Investigate and manage issues

An **issue** describes a recurring failure or cause. An **assumption** proposes a link between an issue and a result error; confirmation records a reviewed association. Issues and their statistics are scoped to the selected project.

## Inspect issues

1. Select the destination project and open **Issues**.
2. Filter by category/name and execution type where needed. The statistics date range scopes occurrence statistics.
3. Read the issue card's name, category, description, occurrence count, first/last seen and impacted-test count. A time distribution is shown when occurrences are available.
4. Hover the category summary for linked-result category details. A **Mixed** badge describes mixed linked-result categories; it does not replace the issue's own category.
5. Use the pencil control (**Manage issue**) to open its edit drawer. Review changes before saving.

The effective list query supports issue name/category, execution type and statistics dates. Do not assume every visible spec-related filter controls this list; prefer these verified query controls. An empty list can mean no matching issues or restrictive filters, not an upload failure.

## Associate an error with an issue

1. In **Results**, locate a failed result and open its error/context dialog.
2. Inspect the error and any available logs/snippet before choosing an issue.
3. Search by issue name or use **Find matching issues** when available. A similarity suggestion is a candidate, not a confirmed cause.
4. Review a suggestion and choose **Confirm** only when it describes the failure.
5. If there is no suitable issue, enter the category, issue name and description, then choose **Assign Issue** to create/associate it.

**Categorise with AI** can draft fields when configured by the instance. Review generated wording/category before assignment. Analysis or matching can fail independently of saved test data; retry or enter reviewed details manually.

The category choices correspond to `bug`, `infra` (Environment), `performance`, `script` and `other`. Use a concise issue name and a description grounded in the observed failure, without credentials or private report content.

## Verify the association

Reopen the result context and inspect its confirmed issue, then find the issue in **Issues** with the intended project and statistics period. Read counts within that period; they are not necessarily lifetime totals.

Editing issue details and confirming/rejecting associations change shared investigation data. Check the target result/issue before applying them. For an assistant-driven workflow, [MCP tools](../mcp/tools.md) distinguish reads, review operations and writes.
