---
title: Create and edit Test Scenarios
description: Author structured Test Scenarios, ordered steps, and find them in the project catalog.
slug: /guides/test-scenarios
sidebar_position: 5
---

# Create and edit Test Scenarios

Test Scenarios store reusable test instructions in structured fields and ordered steps. Select a project, open **Test Scenarios**, then choose **Create scenario**. To change a saved scenario, open it and choose **Edit** from its actions.

## Enter scenario details

Use a clear **Title**. When you save a new scenario, Test Portal assigns it a key such as `TMS-42`. The key is unique within the project. You can also enter:

- **Details** to describe the behavior under test.
- **Priority** as Low, Medium, or High.
- **Preconditions** and **Test data** to record setup information.
- **Related issue URL** as a link to an issue in another tracker or system. This field is a URL, not a linked Test Portal issue or execution evidence.

Optional text can be left blank. Scenario fields are saved with the form. When editing, only changed fields are submitted, so an untouched draft field is not meant to overwrite a newer saved value.

## Add and maintain steps

Each step has an **Action** and an optional **Expected result**. In a new scenario, add and order steps in the form, then select **Save scenario**.

The detail page displays the saved steps in order. To add, edit, reorder, or remove a step, choose **Edit** to open the scenario form. Select **Save changes** once to save the step changes together with any scenario field changes. If no steps have been saved, the detail page shows **No steps saved**.

## Generated Markdown

Test Portal generates Markdown from the structured fields and steps for integrations. The application does not provide a Markdown editor or preview for scenarios, and MCP clients cannot submit Markdown as scenario input. Edit the fields and steps instead; generated content updates from those saved values.

## Find a scenario

In the catalog, search by title or scenario key. For example, find `TMS-42` within the selected project. For API calls, use the UUID returned by the scenario listing as `scenarioId`. Use column filters to match text in a displayed column, and select a column heading to sort. The initial order is newest first. The catalog paginates results and shows server-calculated totals.

An empty catalog means the selected project has no scenarios. **No scenarios match the current search** means the current search or filters found no rows; clear them to broaden the list. Folder, Unfiled, and suite views are described in [Organize scenarios](scenario-organization.md).

## Continue the workflow

- [Organize scenarios](scenario-organization.md)
- [Connect scenarios to automated evidence](scenario-automation-evidence.md)
- [Run a scenario manually](manual-test-runs.md)
- [Scenario MCP tools](../mcp/test-scenarios.md)
