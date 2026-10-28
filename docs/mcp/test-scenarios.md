---
title: Test Scenario MCP tools
description: Discover and call the nine project-scoped MCP tools for Test Scenario authoring and steps.
slug: /mcp/test-scenarios
sidebar_position: 4
---

# Test Scenario MCP tools

This reference describes the nine tools registered at backend source baseline `d1ae062f3ce1b65afea4a3b4e724ebfdfe4843c1`, including four tools for scenario-step operations. A source baseline does not prove which tools are deployed on your instance. Connect to the instance and inspect its live `tools/list` response before calling a tool. For transport and authentication setup, see [MCP getting started](getting-started.md).

All IDs are UUID strings. Use the project UUID and scenario UUID for the same project. Each example below shows the `name` and `arguments` passed to MCP `tools/call`; the MCP client handles transport/session fields. UUIDs and content are synthetic.

## Tool inputs

| Tool | Required inputs | Optional inputs, defaults, and effects |
| --- | --- | --- |
| `create-test-scenario` | `projectId`, `title` | `folderId` UUID or null; `scenarioKey` (trimmed, 1–100 characters, no line breaks; duplicates allowed); nonblank `details`, `preconditions`, `testData`; `priority`: `low`, `medium`, `high`, or null; absolute HTTP(S) `relatedIssueUrl` or null; `steps` defaults to `[]`, each with nonblank `action` and optional nonblank `expectedResult`. The authenticated user becomes `createdById`. |
| `list-test-scenarios` | `projectId` | `page` defaults to 1; `limit` defaults to 30, maximum 100. `search` matches title/key. `createdById` filters by any creator UUID, including another user. `scenarioKey`, `title`, `details`, `folder`, and `createdBy` are case-insensitive literal substring filters; blank filters are ignored. `sort` is `recently_created` (default), `recently_updated`, or `title_asc`. Alternatively use `sortField` (`scenarioKey`, `title`, `details`, `folder`, `createdBy`, `createdAt`, `updatedAt`) with `sortDirection` `asc` or `desc` (default `desc`). `sortDirection` requires `sortField`; `sort` cannot be combined with `sortField`. |
| `get-test-scenario` | `scenarioId`, `projectId` | `resultPage`/`issuePage` default to 1; `resultLimit`/`issueLimit` default to 30, maximum 100. Result and issue evidence are paginated independently. |
| `update-test-scenario` | `scenarioId`, `projectId`, and at least one editable field | Any of `title`, `scenarioKey`, `details`, `preconditions`, `testData`, `priority`, `relatedIssueUrl`. Omitted fields stay unchanged; null clears nullable fields. Text must be nonblank after trimming when supplied. Markdown, steps, folder assignment, and immutable fields are not accepted. |
| `delete-test-scenario` | `scenarioId`, `projectId` | Deletes the scenario and its links; linked Specs and existing execution evidence are preserved. |
| `append-test-scenario-step` | `scenarioId`, `projectId`, `action` | `expectedResult` is optional and nonblank if supplied. Appends one step with a generated stable UUID and returns full scenario detail. |
| `update-test-scenario-step` | `scenarioId`, `projectId`, `stepId`, and at least one of `action` or `expectedResult` | Supplied text must be nonblank after trimming. Omitted fields stay unchanged; `expectedResult: null` clears it. Returns full scenario detail. |
| `delete-test-scenario-step` | `scenarioId`, `projectId`, `stepId` | Deletes that step and compacts the remaining positions. Returns full scenario detail. |
| `reorder-test-scenario-steps` | `scenarioId`, `projectId`, `stepIds` | `stepIds` must contain every current step UUID exactly once, in the requested order. An empty array is valid only for a scenario with no steps. Returns full scenario detail. |

Scenario keys are labels, not identifiers: they may be duplicated. Use UUIDs for scenario and step operations. The list response contains lightweight summaries; use `get-test-scenario` for structured detail, generated Markdown, steps, and evidence. The list tool accepts a `folder` text filter that matches the displayed folder path or `Unfiled`; it does not accept a folder UUID or suite filter. Scenario creation can assign an existing folder UUID with `folderId`, but MCP does not provide folder management or moves for existing scenarios. MCP also does not manage suites, Spec links, or manual runs.

## `tools/call` examples

### Create a scenario

```json
{
  "name": "create-test-scenario",
  "arguments": {
    "projectId": "11111111-1111-4111-8111-111111111111",
    "title": "Sign-in accepts a valid account",
    "scenarioKey": "AUTH-01",
    "priority": "medium",
    "steps": [
      {"action": "Open the sign-in page", "expectedResult": "The form is displayed"},
      {"action": "Submit valid credentials"}
    ]
  }
}
```

### List scenarios

```json
{
  "name": "list-test-scenarios",
  "arguments": {
    "projectId": "11111111-1111-4111-8111-111111111111",
    "search": "AUTH",
    "page": 1,
    "limit": 30,
    "sort": "recently_updated"
  }
}
```

### Get detail and independently paged evidence

```json
{
  "name": "get-test-scenario",
  "arguments": {
    "scenarioId": "22222222-2222-4222-8222-222222222222",
    "projectId": "11111111-1111-4111-8111-111111111111",
    "resultPage": 1,
    "resultLimit": 10,
    "issuePage": 2,
    "issueLimit": 20
  }
}
```

### Update structured fields

```json
{
  "name": "update-test-scenario",
  "arguments": {
    "scenarioId": "22222222-2222-4222-8222-222222222222",
    "projectId": "11111111-1111-4111-8111-111111111111",
    "details": "Covers a valid account on the sign-in form",
    "relatedIssueUrl": null
  }
}
```

### Delete a scenario

```json
{
  "name": "delete-test-scenario",
  "arguments": {
    "scenarioId": "22222222-2222-4222-8222-222222222222",
    "projectId": "11111111-1111-4111-8111-111111111111"
  }
}
```

### Append a step

```json
{
  "name": "append-test-scenario-step",
  "arguments": {
    "scenarioId": "22222222-2222-4222-8222-222222222222",
    "projectId": "11111111-1111-4111-8111-111111111111",
    "action": "Sign out",
    "expectedResult": "The sign-in page is shown"
  }
}
```

### Update a step

```json
{
  "name": "update-test-scenario-step",
  "arguments": {
    "scenarioId": "22222222-2222-4222-8222-222222222222",
    "projectId": "11111111-1111-4111-8111-111111111111",
    "stepId": "33333333-3333-4333-8333-333333333333",
    "expectedResult": null
  }
}
```

### Delete a step

```json
{
  "name": "delete-test-scenario-step",
  "arguments": {
    "scenarioId": "22222222-2222-4222-8222-222222222222",
    "projectId": "11111111-1111-4111-8111-111111111111",
    "stepId": "33333333-3333-4333-8333-333333333333"
  }
}
```

### Reorder all steps

```json
{
  "name": "reorder-test-scenario-steps",
  "arguments": {
    "scenarioId": "22222222-2222-4222-8222-222222222222",
    "projectId": "11111111-1111-4111-8111-111111111111",
    "stepIds": [
      "44444444-4444-4444-8444-444444444444",
      "33333333-3333-4333-8333-333333333333"
    ]
  }
}
```

## Success shapes

Successful tools return MCP text content containing serialized JSON. The following abbreviated response bodies are illustrative; generated IDs, timestamps, hashes, and content vary.

`list-test-scenarios` returns summaries and pagination metadata, without steps or generated Markdown:

```json
{
  "scenarios": [{"id": "22222222-2222-4222-8222-222222222222", "projectId": "11111111-1111-4111-8111-111111111111", "createdById": "55555555-5555-4555-8555-555555555555", "title": "Sign-in accepts a valid account", "scenarioKey": "AUTH-01", "details": null, "createdBy": {"id": "55555555-5555-4555-8555-555555555555", "name": "Example User", "email": "user@example.test"}, "createdAt": "2026-10-01T10:00:00.000Z", "updatedAt": "2026-10-01T10:00:00.000Z"}],
  "total": 1,
  "page": 1,
  "limit": 30,
  "totalPages": 1
}
```

`get-test-scenario` returns a full scenario and two separately paged evidence envelopes:

```json
{
  "scenario": {"id": "22222222-2222-4222-8222-222222222222", "projectId": "11111111-1111-4111-8111-111111111111", "createdById": "55555555-5555-4555-8555-555555555555", "title": "Sign-in accepts a valid account", "scenarioKey": "AUTH-01", "details": null, "preconditions": null, "testData": null, "priority": "medium", "relatedIssueUrl": null, "steps": [{"id": "33333333-3333-4333-8333-333333333333", "position": 0, "action": "Open the sign-in page", "expectedResult": null}], "contentMd": "# Sign-in accepts a valid account\n", "contentMdHash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "contentMdFormatVersion": 1, "createdAt": "2026-10-01T10:00:00.000Z", "updatedAt": "2026-10-01T10:00:00.000Z"},
  "resultEvidence": {"scenarioId": "22222222-2222-4222-8222-222222222222", "projectId": "11111111-1111-4111-8111-111111111111", "linkedSpecCount": 1, "results": [], "total": 0, "page": 1, "limit": 30, "totalPages": 0},
  "issueEvidence": {"scenarioId": "22222222-2222-4222-8222-222222222222", "projectId": "11111111-1111-4111-8111-111111111111", "linkedSpecCount": 1, "issues": [], "total": 0, "page": 1, "limit": 30, "totalPages": 0}
}
```

Create, update, and step mutation tools return the complete updated scenario, including generated Markdown metadata and ordered steps. `delete-test-scenario` instead returns a deletion confirmation:

```json
{
  "id": "22222222-2222-4222-8222-222222222222",
  "projectId": "11111111-1111-4111-8111-111111111111",
  "createdById": "55555555-5555-4555-8555-555555555555",
  "title": "Sign-in accepts a valid account",
  "scenarioKey": "AUTH-01",
  "details": "Checks a valid account",
  "preconditions": null,
  "testData": null,
  "priority": "medium",
  "relatedIssueUrl": null,
  "steps": [{"id": "33333333-3333-4333-8333-333333333333", "position": 0, "action": "Open the sign-in page", "expectedResult": null}],
  "contentMd": "# Sign-in accepts a valid account\n",
  "contentMdHash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "contentMdFormatVersion": 1,
  "createdAt": "2026-10-01T10:00:00.000Z",
  "updatedAt": "2026-10-01T10:05:00.000Z"
}
```

```json
{"scenarioId": "22222222-2222-4222-8222-222222222222", "projectId": "11111111-1111-4111-8111-111111111111", "deleted": true}
```

## Validation, scope, and failures

Schemas reject unknown fields, invalid UUIDs, invalid pagination, unsupported priority values, malformed or non-HTTP(S) related issue URLs, blank text, and invalid sort combinations. List page defaults to 1 and limit to 30 (maximum 100). Result and issue evidence each default to page 1 and limit 30 (maximum 100). List filtering and totals are applied before pagination. Default ordering is creation time descending, then ID descending. The authenticated session supplies the creator identity for creation; callers do not choose it.

For updates, omission preserves a value and explicit null clears a nullable value. An update with no editable fields is rejected. Append requires a nonblank action and permits an omitted expected result; it does not accept null there. Step update requires at least one field and accepts null expected result to clear it. Step UUIDs remain stable across edits and reorders; deleting a step compacts positions. Reorder requires the full current set of step UUIDs exactly once. If membership is stale, read the scenario again and deliberately submit the current complete order. Do not assume multiple tool calls form a transaction, and do not automatically replay a create or append after an uncertain response.

Scenario and evidence reads are scoped to `projectId`; a scenario outside that project is not returned. The tools do not accept generated Markdown as input. Folder/suite management, scenario-Spec linking, and manual-run management remain outside this MCP tool set.

MCP authentication failures occur at the transport boundary. Input/schema or protocol errors may be returned before a handler runs. Handler failures use the tool error response convention (`isError: true` with text); exact text depends on the failure. Check protocol errors and `isError` rather than assuming every error has the same envelope or message. Success data is serialized in MCP text content; parse the text according to your client SDK.

See the [general MCP tool reference](tools.md) for other registered operations and [scenario authoring](../guides/test-scenarios.md) for the web workflow.
