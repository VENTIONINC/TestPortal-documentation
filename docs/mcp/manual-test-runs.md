---
title: Manual test runs over MCP
description: Record client-observed Test Scenario outcomes and inspect manual-run history through MCP.
slug: /mcp/manual-test-runs
sidebar_position: 4
---

# Manual test runs over MCP

The authenticated MCP server offers nine actions for starting manual runs, recording outcomes, retrieving history, and selecting executors. Discover them with `testportal-find-action` and invoke them through `testportal-execute-action`. These actions store what the client observed; they do not launch a browser, call the API under test, or create automated `Result` records. Check live discovery before relying on availability.

All run operations require UUIDs from the intended project. Inputs reject unknown fields. Successful results are JSON in MCP text content. A service failure sets `isError: true`; invalid protocol or schema input fails before the service runs. See [Connect an MCP client](getting-started.md) for endpoint and token setup.

## Tool reference

| Tool | Required inputs | Optional inputs and response |
| --- | --- | --- |
| `testportal-start-manual-test-run` | `projectId`, `scenarioId` | `notes`, `runKey`, `environmentProfileId`, `browser`, `operatingSystem`, `device`, `apiEnvironment`, `build`, `deployment`. Executor comes from the authenticated session. Returns a new run snapshot with copied steps and independent step UUIDs. |
| `testportal-get-manual-test-run` | `projectId`, `runId` | Returns full saved snapshot, ordered steps and outcomes, environment, source identity, and nullable safe executor `{id,name,email}`. |
| `testportal-update-manual-test-run` | `projectId`, `runId`, and at least one of `notes` or `runKey` | Null clears either value; omission preserves it. No status is accepted. On completed runs only a `runKey`-only change is allowed. |
| `testportal-update-manual-test-run-step` | `projectId`, `runId`, snapshot `stepId`, and `status` and/or `notes` | Status: `not_started`, `passed`, `failed`, `blocked`, `skipped`. Null clears notes. |
| `testportal-complete-manual-test-run` | `projectId`, `runId`, terminal `status` | Status: `passed`, `failed`, `blocked`, `skipped`; `notes` is optional. This is the only MCP completion tool. |
| `testportal-list-manual-test-runs` | `projectId` | Optional `testScenarioId`, exact `sourceScenarioKey`, overall `status`, `startedFrom`, `startedBefore`, numeric `page`, `limit`. |
| `testportal-list-test-scenario-manual-runs` | `projectId`, live same-project `scenarioId` | Optional `status`, `startedFrom`, `startedBefore`, numeric `page`, `limit`. It does not accept project-only source filters. |
| `testportal-list-active-users` | Empty object `{}` | Returns active executor candidates as `{id,name,email}`, ordered by name then ID. Requires no project ID. |
| `testportal-reassign-manual-test-run-executor` | `projectId`, `runId`, `executedById` | Target must be active. Reassignment changes executor and run `updatedAt`; it does not grant executor-only authorization. |

History responses are exactly `{runs,total,page,limit,totalPages}`. Summary entries omit snapshot body, steps, and notes. Filters are combined before pagination; rows order by `startedAt DESC`, then `id DESC`. Pagination accepts positive JSON integers, defaults to page 1 and limit 30, and caps limit at 100. Dates must be RFC 3339 values with an explicit timezone; `startedFrom` is inclusive and `startedBefore` is exclusive, and the first must precede the second. Overall `status` filters the run, not individual steps.

Project history and direct run lookup retain source snapshots after the source scenario is deleted, with immutable `sourceTestScenarioId` and a null live `testScenarioId`. Nested scenario history requires a live same-project scenario. A valid unmatched project source filter returns an empty page without exposing foreign data.

## Manage environment profiles

The four profile tools use authenticated project-shared access. All IDs are UUIDs; unknown fields are rejected. Successful calls return JSON in MCP text content; service errors set `isError: true`. List requires an existing project, returns an array ordered by `createdAt DESC, id DESC`, and is not filtered by creator. Create derives `ownerId` from the session. Create and update return the persisted profile with `id`, `projectId`, `ownerId`, `name`, `browser`, `operatingSystem`, `device`, `apiEnvironment`, `createdAt`, and `updatedAt`.

| Tool | Input | Result |
| --- | --- | --- |
| `testportal-list-manual-run-environment-profiles` | `projectId` | Profile array, possibly empty |
| `testportal-create-manual-run-environment-profile` | `projectId`, `name`; optional reusable fields below | Created profile |
| `testportal-update-manual-run-environment-profile` | `projectId`, `profileId`; at least one editable field | Updated profile |
| `testportal-delete-manual-run-environment-profile` | `projectId`, `profileId` | `{projectId, profileId, deleted: true}` |

Names are trimmed, nonblank single-line strings up to 100 characters; duplicate names are allowed. Reusable fields `browser`, `operatingSystem`, `device`, and `apiEnvironment` accept null or trimmed single-line strings up to 200 characters. Blank strings normalize to null. Omission preserves an update field; null clears it. Ownership, generated IDs, timestamps, `build`, and `deployment` are not editable inputs. Missing projects and missing or foreign profiles return errors. Deleting a profile does not alter saved runs.

For example, call these tools in order, replacing the identifiers with returned values:

```text
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-list-manual-run-environment-profiles","arguments":{"projectId":"11111111-1111-4111-8111-111111111111"}}}
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-create-manual-run-environment-profile","arguments":{"projectId":"11111111-1111-4111-8111-111111111111","name":"Staging","browser":"Chrome","operatingSystem":"Linux","device":"Laptop","apiEnvironment":"Staging"}}}
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-start-manual-test-run","arguments":{"projectId":"11111111-1111-4111-8111-111111111111","scenarioId":"22222222-2222-4222-8222-222222222222","environmentProfileId":"33333333-3333-4333-8333-333333333333","browser":"Firefox","device":null,"build":"42","deployment":"canary"}}}
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-update-manual-run-environment-profile","arguments":{"projectId":"11111111-1111-4111-8111-111111111111","profileId":"33333333-3333-4333-8333-333333333333","operatingSystem":"Windows"}}}
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-start-manual-test-run","arguments":{"projectId":"11111111-1111-4111-8111-111111111111","scenarioId":"22222222-2222-4222-8222-222222222222","environmentProfileId":"33333333-3333-4333-8333-333333333333"}}}
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-delete-manual-run-environment-profile","arguments":{"projectId":"11111111-1111-4111-8111-111111111111","profileId":"33333333-3333-4333-8333-333333333333"}}}
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-get-manual-test-run","arguments":{"projectId":"11111111-1111-4111-8111-111111111111","runId":"44444444-4444-4444-8444-444444444444"}}}
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-get-manual-test-run","arguments":{"projectId":"11111111-1111-4111-8111-111111111111","runId":"55555555-5555-4555-8555-555555555555"}}}
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-list-manual-test-runs","arguments":{"projectId":"11111111-1111-4111-8111-111111111111"}}}
{"name":"testportal-execute-action","arguments":{"actionId":"testportal-list-test-scenario-manual-runs","arguments":{"projectId":"11111111-1111-4111-8111-111111111111","scenarioId":"22222222-2222-4222-8222-222222222222"}}}
```

Use the created profile's ID and the started run's ID in subsequent calls. The first run captures Firefox, Linux, null device, Staging, build 42, and canary. A later run started after the update captures Windows instead. Both retain their snapshots after deletion, including in project and scenario history. Build and deployment are run-only. Reconnect and use action discovery to check availability.

## Record an execution

Start a run and retain the identifiers returned by that call. The step IDs in `steps` belong to the copied run snapshot; use these IDs in every step update.

```json
{
  "name": "testportal-execute-action",
  "arguments": {
    "actionId": "testportal-start-manual-test-run",
    "arguments": {
      "projectId": "11111111-1111-4111-8111-111111111111",
      "scenarioId": "22222222-2222-4222-8222-222222222222",
      "environmentProfileId": "33333333-3333-4333-8333-333333333333",
      "browser": "Firefox",
      "build": "2026.10.29",
      "deployment": "canary"
    }
  }
}
```

Same-project environment profiles can supply Browser, OS, Device, and API environment. Explicit request values override those reusable values. Build and Deployment come from the start request. Omitted optional fields remain unset. The returned run detail is authoritative; inspect it before recording outcomes.

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

```json
{
  "name": "testportal-execute-action",
  "arguments": {
    "actionId": "testportal-update-manual-test-run-step",
    "arguments": {
      "projectId": "11111111-1111-4111-8111-111111111111",
      "runId": "44444444-4444-4444-8444-444444444444",
      "stepId": "55555555-5555-4555-8555-555555555555",
      "status": "passed",
      "notes": "The expected dashboard appeared"
    }
  }
}
```

Record run-level notes with `testportal-update-manual-test-run`. Finish explicitly:

```json
{
  "name": "testportal-execute-action",
  "arguments": {
    "actionId": "testportal-complete-manual-test-run",
    "arguments": {
      "projectId": "11111111-1111-4111-8111-111111111111",
      "runId": "44444444-4444-4444-8444-444444444444",
      "status": "passed"
    }
  }
}
```

A nonempty run can pass only when at least one step passed and every other step passed or was skipped. Failed, blocked, or skipped completion may leave steps unfinished without changing their recorded states. Empty runs may use any terminal outcome. Completion sets the server timestamp and freezes execution data; runs cannot be reopened. A completed run still permits a runKey-only metadata update.

## Inspect history and retest

Use project history to find a run or filter by captured source identity, outcome, and start window. The following example requests failed runs for a source scenario in a date interval:

```json
{
  "name": "testportal-execute-action",
  "arguments": {
    "actionId": "testportal-list-manual-test-runs",
    "arguments": {
      "projectId": "11111111-1111-4111-8111-111111111111",
      "testScenarioId": "22222222-2222-4222-8222-222222222222",
      "status": "failed",
      "startedFrom": "2026-10-01T00:00:00Z",
      "startedBefore": "2026-11-01T00:00:00Z",
      "page": 1,
      "limit": 30
    }
  }
}
```

To choose an executor, execute the `testportal-list-active-users` action with empty arguments and select one returned active-user UUID. Reassignment may be used on active or completed runs; it preserves run/step outcomes, notes, and their timestamps.

Retesting starts a separate run from the scenario's current saved content. It does not copy prior outcomes or notes. Inspect history before retrying an uncertain start request, because the original start may already have created a run.

## REST and MCP completion

For this release, REST `PATCH /api/v2/manual-test-runs/{runId}` still accepts terminal status updates. MCP `testportal-update-manual-test-run` rejects every status field and requires `testportal-complete-manual-test-run`. TP-38 tracks REST alignment. General MCP account-lifecycle authentication changes are tracked separately in TP-37; this manual-run capability does not implement them.

## Related guides

- [Manual test run interface](../guides/manual-test-runs.md)
- [Manual run history](../guides/manual-run-history.md)
- [Test Scenario MCP tools](test-scenarios.md)
