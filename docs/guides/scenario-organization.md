---
title: Organize Test Scenarios
description: Use project folders, the No folder view, and ordered Test Suites to organize scenarios.
slug: /guides/scenario-organization
sidebar_position: 6
---

# Organize Test Scenarios

Folders and suites organize scenarios within the selected project. They do not create copies of scenarios or capture historical execution state.

## Browse the folder tree

The catalog offers **All scenarios**, **No folder**, a project folder tree, and project suites. A scenario can belong to one folder or appear in **No folder**. Selecting a folder can include its descendants; turn off the descendant option to see only scenarios directly in that folder. Search and pagination apply within the current view.

Create folders from the catalog and use folder actions to rename, move, or reorder them. Moving a scenario changes its current folder assignment; it keeps the same scenario record, steps, links, and execution history. Use the bulk **Move** action to assign selected scenarios to a folder or **No folder**. It is not offered in suite context.

To delete a folder, open its actions and choose **Delete folder**. The confirmation covers the selected folder and all its subfolders. For example, deleting **Payments** also deletes its **Refunds** subfolder. Scenarios from both folders move to **No folder**. Their suite memberships and run history stay available.

Deleting a folder [through MCP](../mcp/test-scenarios.md) has the same effect on the folder tree and its scenarios.

## Curate a suite

A suite is a named, editable selection of scenarios in the project. Add scenarios to a suite, remove selected members, or change their order. A scenario may be included in more than one suite without being copied. Suites can have a description, purpose, and release label, but a release label does not freeze the suite or record release evidence.

Removing a scenario from a suite changes only that membership. Deleting a suite removes the suite and its membership links; its scenarios remain in the project. To delete a scenario itself, use the scenario's delete action and review the confirmation: deletion removes the scenario and its Spec links, preserves linked Specs and existing execution evidence and manual-run snapshots, and prevents new manual runs from that scenario.

## See also

- [Create and edit Test Scenarios](test-scenarios.md)
- [Connect scenarios to automated evidence](scenario-automation-evidence.md)
- [Manual run history](manual-run-history.md)
