---
title: Run a Test Scenario manually
description: Start a manual run, record step outcomes and environment details, and complete it.
slug: /guides/manual-test-runs
sidebar_position: 8
---

# Run a Test Scenario manually

Open a saved Test Scenario and select **Start manual run**. Review the scenario, optionally enter a **Run key**, choose an environment profile or enter values for this run, then confirm the start. The run key is a readable label; it can be omitted and is not a run UUID.

## What the run saves

At start, Test Portal copies the scenario title, details, preconditions, test data, source scenario key, and the ordered steps into a new run. The run and its steps get their own IDs. Priority, related issue URL, generated Markdown, and linked automated evidence are not copied into the run snapshot.

You can start more than one independent run from a scenario. Later edits to the scenario do not replace the content already captured by a run.

## Record environment values

Environment values are optional. A saved profile for the selected project can prefill Browser, OS, Device, and API environment; adjust those values for this run before confirming. Enter Build and Deployment directly for the run. You can also enter values without selecting a profile or leave them empty. Profile actions let you save a profile, update the selected profile, or delete it. The run stores the resolved values as its own snapshot, so later profile edits or deletion do not change an existing run.

## Execute the steps

For each copied step, set its outcome to **Passed**, **Failed**, **Blocked**, or **Skipped**, and add an optional note. You can also save a run-level note. Step progress shows saved outcomes and highlights unsaved drafts. The assigned Executor can edit execution details, move between steps, and complete the run by choosing its final outcome. When a run has steps, a **Passed** completion requires every step to be **Passed** or **Skipped** and at least one step to be **Passed**. A run with no steps can also be completed as **Passed**. After completion, step results and execution notes are read-only; the run key and Executor can still be changed. A completed run is a record of the manual execution; it is not an automated Result.

Save operations can fail independently. Read the feedback before continuing. When the interface says a write may have succeeded but refreshed data is unavailable, refresh and inspect the run before repeating the action. If starting a run has an uncertain result, inspect run history before choosing **Start another run**; the earlier request may already have created a run. Do not assume a retry is safe when the result is uncertain.

## Continue to history

- [Review manual run history](manual-run-history.md)
- [Create and edit Test Scenarios](test-scenarios.md)
- [Review automated evidence](scenario-automation-evidence.md)
