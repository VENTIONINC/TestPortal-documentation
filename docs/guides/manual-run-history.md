---
title: Review manual run history
description: Find, reopen, and review project runs and start a separate retest.
slug: /guides/manual-run-history
sidebar_position: 9
---

# Review manual run history

Open **Manual runs** in the selected project and use **Search runs** to find a run by name, build, browser, or starter. In **Filters**, use **Show** to switch between **In progress**, **Completed**, and **All runs**. Choose a period such as **Recent**, **Any time**, or **Custom range**. A date range matches runs that were active during the range or completed within it. Browse additional pages if needed.

## Inspect a saved run

Select a run and open a scenario inside it to review its saved fields and ordered steps. The workspace shows each scenario's result and assignee, along with any step comments and failure or blocked flags. The run also stores its environment values. Later edits to a source scenario leave the saved snapshot intact. Deleting the source scenario preserves its existing run history.

## Continue a run or retest

Select an **In progress** run to continue recording results. For a completed run, choose **Reopen** to unlock results on that same run. Reopening keeps the existing snapshots and recorded results.

To retest using the current scenario content, return to the catalog. Select the scenarios and choose **Run selected**, or open a suite and choose **Run suite**. Start a separate run with a new name. The new snapshots reflect the current saved scenarios and their results start as **Untested**. The earlier run remains available in project history.

## See also

- [Manual test runs over MCP](../mcp/manual-test-runs.md)
- [Run a Test Scenario manually](manual-test-runs.md)
- [Organize Test Scenarios](scenario-organization.md)
