---
title: Run a Test Scenario manually
description: Start a manual run, record scenario results and step observations, and complete it.
slug: /guides/manual-test-runs
sidebar_position: 8
---

# Run a Test Scenario manually

Select scenarios in the catalog and choose **Run selected**, or open a suite and choose **Run suite**. Review the selected scenarios, enter a **Run name**, set any environment properties, and choose **Start run**. You can include one scenario or a set of scenarios in the same run.

## What the run saves

At start, Test Portal saves a copy of each selected scenario's title, details, preconditions, test data, source scenario key, and ordered steps. Each scenario starts as **Untested** and gets its own result in the run.

You can start more than one independent run from a scenario. Later edits to the scenario do not replace the content already captured by a run.

## Record environment values

Environment properties are optional. The form can prefill them from the latest run in the project. Review the copied values, enter the build for this run, and use **Add property** for any additional values. The run stores its own copy of the properties.

## Record results and observations

Open a scenario in the run, follow its copied steps, and record the scenario result as **Passed**, **Failed**, **Blocked**, or **Skipped**. Use a step comment or flag to record what happened at a specific step. For example, if a payment returns an error, mark the payment scenario **Failed**, flag the step that failed, and describe the error there.

## Complete the run

Choose **Complete run** when the checks are finished. If any scenarios are still **Untested**, the confirmation offers two choices:

- **Keep testing** leaves the run open.
- **Complete and skip** marks the remaining untested scenarios as **Skipped** and preserves the results already recorded.

Completion locks the scenario results. Reopen the run if you need to change them.

If the interface cannot confirm that a change was saved, refresh the run and check its state before repeating the action. If the server cannot confirm creation, check **Manual runs** before trying **Start run** again. The earlier request may already have created a run.

## Continue to history

- [Record manual runs through MCP](../mcp/manual-test-runs.md)
- [Review manual run history](manual-run-history.md)
- [Create and edit Test Scenarios](test-scenarios.md)
- [Review automated evidence](scenario-automation-evidence.md)
