---
title: Organize Test Scenarios
description: Use project folders, Unfiled, and ordered Test Suites to organize scenarios.
slug: /guides/scenario-organization
sidebar_position: 6
---

# Organize Test Scenarios

Folders and suites organize scenarios within the selected project. They do not create copies of scenarios or capture historical execution state.

## Browse folders and Unfiled

The catalog offers **All scenarios**, **Unfiled**, a project folder tree, and project suites. A scenario can belong to one folder or remain Unfiled. Selecting a folder can include its descendants; turn off the descendant option to see only scenarios directly in that folder. Search and pagination apply within the current view.

Create folders from the catalog and use folder actions to rename, move, or reorder them. Moving a scenario changes its current folder assignment; it keeps the same scenario record, steps, links, and execution history. Use the bulk **Move** action to assign selected scenarios to a folder or Unfiled. It is not offered in suite context.

Deleting a populated folder asks whether its direct scenarios should move to the parent folder or to Unfiled. Child folders are promoted to the deleted folder's parent. This removes the folder only; it does not delete scenarios or child folders.

## Curate a suite

A suite is a named, editable selection of scenarios in the project. Add scenarios to a suite, remove selected members, or change their order. A scenario may be included in more than one suite without being copied. Suites can have a description, purpose, and release label, but a release label does not freeze the suite or record release evidence.

Removing a scenario from a suite changes only that membership. Deleting a suite removes the suite and its membership links; its scenarios remain in the project. To delete a scenario itself, use the scenario's delete action and review the confirmation: deletion removes the scenario and its Spec links, preserves linked Specs and existing execution evidence and manual-run snapshots, and prevents new manual runs from that scenario.

## See also

- [Create and edit Test Scenarios](test-scenarios.md)
- [Connect scenarios to automated evidence](scenario-automation-evidence.md)
- [Manual run history](manual-run-history.md)
