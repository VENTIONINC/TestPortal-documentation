---
title: Review manual run history
description: Filter, resume, and retest manual runs while preserving their saved snapshots.
slug: /guides/manual-run-history
sidebar_position: 9
---

# Review manual run history

Open **Manual Test Runs** for project history, or open **Run history** from a scenario for its runs. Both views support status and started-date filters, plus pagination. Project history also filters by source scenario ID or captured scenario key; the key filter is an exact, case-sensitive match. Clear filters when looking for a run that may be hidden by the current view.

## Inspect a saved run

Open a run to see its saved scenario fields, ordered steps, step outcomes and notes, run note, environment values, status, and timestamps. These are the values captured or recorded for that run. They remain the history even if the current scenario changes. The history view does not detect or replay a historical scenario version.

When the source scenario still exists, the detail can link to its current version; current content may differ from the run snapshot. If the source was deleted, history marks **Source deleted**. Deleting a scenario preserves its manual runs and snapshots, while new runs can no longer be started from that deleted scenario.

## Resume or retest

Use **Resume** on an in-progress run assigned to you to continue that same run and its saved outcomes and notes. Other users see **View**. The interface's execution controls follow the saved Executor assignment; this client behavior does not establish a server authorization guarantee. Completed runs are viewed as history and cannot be resumed as active execution.

Use **Retest** to start a separate run. The new run starts from the source scenario's current saved fields and steps and asks for a new optional run key and environment values. It does not copy the previous run's outcomes or notes, and the interface does not establish automatic persisted lineage between the two runs. If the source scenario is deleted, a fresh retest from it is unavailable.

## Example lifecycle

1. Save a scenario with title “Sign in”, setup fields, and two steps.
2. Start a run. The run captures those saved fields and steps, plus the resolved environment values.
3. Edit the scenario title and change a step. The existing run still shows its original snapshot and recorded outcomes.
4. Complete that run. Its outcome and notes remain in history.
5. Choose **Retest** while the scenario still exists. The new run uses the updated saved title and steps; it begins with fresh step outcomes and notes.

Scenario priority, related issue URL, generated Markdown, and automated evidence are not part of the manual-run snapshot. A run is not a historical-version replay.

## See also

- [Manual test runs over MCP](../mcp/manual-test-runs.md)
- [Run a Test Scenario manually](manual-test-runs.md)
- [Organize Test Scenarios](scenario-organization.md)
