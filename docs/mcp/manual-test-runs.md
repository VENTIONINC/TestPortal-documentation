---
title: Manual test runs over MCP
description: Record client-observed Test Scenario outcomes and inspect manual-run history through MCP.
slug: /mcp/manual-test-runs
sidebar_position: 4
---

# Manual test runs over MCP

Discover manual-run actions with `testportal-find-action` and invoke them through `testportal-execute-action`. These actions record observations from a tester or client. Any browser or API testing runs outside Test Portal, and the observations are stored in the manual run. Check live discovery for the actions available on your server.

All run operations require UUIDs from the intended project. Inputs reject unknown fields. Successful results are JSON in MCP text content. A service failure sets `isError: true`; invalid protocol or schema input fails before the service runs. See [Connect an MCP client](getting-started.md) for endpoint and token setup.

## Tool reference

| Tool | Required inputs | Optional inputs and response |
| --- | --- | --- |
| `testportal-start-manual-test-run` | `projectId` and either `scenarioIds` (1–100 unique UUIDs) or `suiteId` | Optional `title`, `environmentProperties` (name/value pairs), `browser`, `operatingSystem`, `device`, `apiEnvironment`, `build`, and `deployment`. The session user starts the run. Returns the run and its scenario and step snapshots. |
| `testportal-get-manual-test-run` | `projectId`, `runId` | Returns saved run details, including environment values, scenario results, assignees, and step evidence. Each scenario snapshot includes its original `sourceScenarioId`. |
| `testportal-update-manual-test-run` | `projectId`, `runId`, `title`, `scenarioIds`, `environmentProperties` | Updates an active run. Send the full desired source UUID list and environment properties. Omitting a source UUID removes its snapshot from the run. |
| `testportal-update-manual-test-run-step` | `projectId`, `runId`, snapshot `scenarioId`, snapshot `stepId`, and at least one evidence field | Evidence fields are `comment`, `failedFlag`, `failedComment`, `blockedFlag`, and `blockedComment`. This call records what happened at the step. |
| `testportal-update-manual-test-run-scenario-result` | `projectId`, `runId`, snapshot `scenarioId`, `result` | Results are `untested`, `passed`, `failed`, `blocked`, and `skipped`. The result is attributed to the session user. |
| `testportal-complete-manual-test-run` | `projectId`, `runId` | Completes the run and marks remaining untested scenarios as skipped. Set optional `requireAllMarked: true` to reject completion when untested scenarios remain. |
| `testportal-list-manual-test-runs` | `projectId` | Optional `search`, `show`, `period`, `timeZone`, `dateFrom`, `dateTo`, `page`, and `limit`. |
| `testportal-list-test-scenario-manual-runs` | `projectId`, original source `scenarioId` | Same optional filters as project history. Matches saved scenario snapshots by source UUID, including after source deletion. |
| `testportal-list-active-users` | Empty object `{}` | Returns active assignee candidates with `id`, `name`, and `email`. |
| `testportal-reassign-manual-test-run-executor` | `projectId`, `runId`, snapshot `scenarioId`, `assigneeId` | Sets the assignee for one scenario in an active run. Use an active user UUID or `null` to clear the assignment. |

History responses contain `runs`, `total`, `page`, `limit`, and `totalPages`. Runs are ordered by most recent update, with descending ID as a tie-breaker. Pagination defaults to page 1 and limit 30. The maximum page size is 100.

The `show` filter selects `in_progress` (the default), `completed`, or `all`. The `period` filter defaults to `recent`. Use `any_time` to include older runs or `custom` with `dateFrom` and `dateTo` in `YYYY-MM-DD` format. Custom dates are inclusive calendar dates in the supplied IANA `timeZone`, which defaults to UTC. Use `testportal-get-manual-test-run` to read full scenario snapshots and step evidence.

Scenario history searches saved snapshots within the selected project. A valid source UUID with no matching runs returns an empty page.

## Manage environment profiles

The four profile tools use authenticated project-shared access. All IDs are UUIDs; unknown fields are rejected. Successful calls return JSON in MCP text content; service errors set `isError: true`. List requires an existing project, returns an array ordered by `createdAt DESC, id DESC`, and is not filtered by creator. Create derives `ownerId` from the session. Create and update return the persisted profile with `id`, `projectId`, `ownerId`, `name`, `browser`, `operatingSystem`, `device`, `apiEnvironment`, `createdAt`, and `updatedAt`.

| Tool | Input | Result |
| --- | --- | --- |
| `testportal-list-manual-run-environment-profiles` | `projectId` | Profile array, possibly empty |
| `testportal-create-manual-run-environment-profile` | `projectId`, `name`; optional reusable fields below | Created profile |
| `testportal-update-manual-run-environment-profile` | `projectId`, `profileId`; at least one editable field | Updated profile |
| `testportal-delete-manual-run-environment-profile` | `projectId`, `profileId` | `{projectId, profileId, deleted: true}` |

Names are trimmed, nonblank single-line strings up to 100 characters; duplicate names are allowed. Reusable fields `browser`, `operatingSystem`, `device`, and `apiEnvironment` accept null or trimmed single-line strings up to 200 characters. Blank strings normalize to null. Omission preserves an update field; null clears it. Ownership, generated IDs, timestamps, `build`, and `deployment` are not editable inputs. Missing projects and missing or foreign profiles return errors. Deleting a profile does not alter saved runs.

When starting a run from a profile, read the profile in the project, apply any overrides in your client, and send the final environment values. The start action accepts those values directly. Use `profileId` for profile updates and deletion. Build and deployment are run-only values.

In the following sequence, use the returned profile ID for update and deletion and the returned run ID for each lookup.

```text
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-list-manual-run-environment-profiles","arguments":{"projectId":"11111111-1111-4111-8111-111111111111"}}}
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-create-manual-run-environment-profile","arguments":{"projectId":"11111111-1111-4111-8111-111111111111","name":"Staging","browser":"Chrome","operatingSystem":"Linux","device":"Laptop","apiEnvironment":"Staging"}}}
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-start-manual-test-run","arguments":{"projectId":"11111111-1111-4111-8111-111111111111","scenarioIds":["22222222-2222-4222-8222-222222222222"],"browser":"Firefox","operatingSystem":"Linux","device":null,"apiEnvironment":"Staging","build":"42","deployment":"canary"}}}
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-update-manual-run-environment-profile","arguments":{"projectId":"11111111-1111-4111-8111-111111111111","profileId":"33333333-3333-4333-8333-333333333333","operatingSystem":"Windows"}}}
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-start-manual-test-run","arguments":{"projectId":"11111111-1111-4111-8111-111111111111","scenarioIds":["22222222-2222-4222-8222-222222222222"],"browser":"Chrome","operatingSystem":"Windows","device":"Laptop","apiEnvironment":"Staging"}}}
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-delete-manual-run-environment-profile","arguments":{"projectId":"11111111-1111-4111-8111-111111111111","profileId":"33333333-3333-4333-8333-333333333333"}}}
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-get-manual-test-run","arguments":{"projectId":"11111111-1111-4111-8111-111111111111","runId":"44444444-4444-4444-8444-444444444444"}}}
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-get-manual-test-run","arguments":{"projectId":"11111111-1111-4111-8111-111111111111","runId":"55555555-5555-4555-8555-555555555555"}}}
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-list-manual-test-runs","arguments":{"projectId":"11111111-1111-4111-8111-111111111111"}}}
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-list-test-scenario-manual-runs","arguments":{"projectId":"11111111-1111-4111-8111-111111111111","scenarioId":"22222222-2222-4222-8222-222222222222"}}}
```

The first run captures Firefox, Linux, a cleared device field, Staging, build 42, and canary. The second run uses the updated profile values, including Windows. Both retain their saved environment values after the profile is deleted.

## Record an execution

Start a run from a selected list or an existing suite. This example uses a suite, so the server determines the scenarios to copy. The returned `id` identifies the run. Within `scenarios`, use each snapshot's `id` for recording observations and results, and use the copied step's `id` for step evidence. The original catalog UUID is in `sourceScenarioId`.

```json
{
  "name": "testportal-execute-action",
  "arguments": {
    "actionId": "testportal-start-manual-test-run",
    "arguments": {
      "projectId": "11111111-1111-4111-8111-111111111111",
      "suiteId": "66666666-6666-4666-8666-666666666666",
      "browser": "Firefox",
      "build": "2026.10.29",
      "deployment": "canary"
    }
  }
}
```

Retrieve the saved snapshot later by its project and run UUID:

```json
{
  "name": "testportal-execute-action",
  "arguments": {
    "actionId": "testportal-get-manual-test-run",
    "arguments": {
      "projectId": "11111111-1111-4111-8111-111111111111",
      "runId": "44444444-4444-4444-8444-444444444444"
    }
  }
}
```

If payment returns an error, flag the affected step and record what happened:

```json
{
  "name": "testportal-execute-action",
  "arguments": {
    "actionId": "testportal-update-manual-test-run-step",
    "arguments": {
      "projectId": "11111111-1111-4111-8111-111111111111",
      "runId": "44444444-4444-4444-8444-444444444444",
      "scenarioId": "77777777-7777-4777-8777-777777777777",
      "stepId": "55555555-5555-4555-8555-555555555555",
      "failedFlag": true,
      "failedComment": "The payment API returned HTTP 500 instead of a confirmation."
    }
  }
}
```

Then record the scenario result using the same snapshot ID:

```json
{
  "name": "testportal-execute-action",
  "arguments": {
    "actionId": "testportal-update-manual-test-run-scenario-result",
    "arguments": {
      "projectId": "11111111-1111-4111-8111-111111111111",
      "runId": "44444444-4444-4444-8444-444444444444",
      "scenarioId": "77777777-7777-4777-8777-777777777777",
      "result": "failed"
    }
  }
}
```

Finish explicitly when all scenarios have a result:

```json
{
  "name": "testportal-execute-action",
  "arguments": {
    "actionId": "testportal-complete-manual-test-run",
    "arguments": {
      "projectId": "11111111-1111-4111-8111-111111111111",
      "runId": "44444444-4444-4444-8444-444444444444",
      "requireAllMarked": true
    }
  }
}
```

With `requireAllMarked: true`, completion rejects the request if any scenario is still `untested`. If the tester chooses to finish with scenarios still untested, omit that field or set it to `false`. The server marks those scenarios as `skipped` and preserves the results already recorded.

## Inspect history and retest

Use project history to find runs. This example requests completed runs in a date range:

```json
{
  "name": "testportal-execute-action",
  "arguments": {
    "actionId": "testportal-list-manual-test-runs",
    "arguments": {
      "projectId": "11111111-1111-4111-8111-111111111111",
      "show": "completed",
      "period": "custom",
      "dateFrom": "2026-10-01",
      "dateTo": "2026-10-31",
      "timeZone": "Europe/Bratislava",
      "page": 1,
      "limit": 30
    }
  }
}
```

To find a failed scenario, look for runs whose `failedCount` is greater than zero. Open each matching run by its `id` with `testportal-get-manual-test-run`, then find the entries in `scenarios` with `result: "failed"`. If you are looking for a particular source, match its `sourceScenarioId`. Inspect that scenario's copied steps for failure flags and comments. Read additional pages if the search has more results.

To assign a scenario, execute `testportal-list-active-users` with empty arguments, then pass the selected user's UUID as `assigneeId` together with the run and scenario snapshot IDs.

Retesting starts a separate run from the scenario's current saved content. It does not copy prior outcomes or notes. Inspect history before retrying an uncertain start request, because the original start may already have created a run.

## Related guides

- [Manual test run interface](../guides/manual-test-runs.md)
- [Manual run history](../guides/manual-run-history.md)
- [Test Scenario MCP tools](test-scenarios.md)
