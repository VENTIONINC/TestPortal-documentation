---
title: MCP tool reference
description: Use the selected registered Test Portal tools and understand inputs and side effects.
slug: /mcp/tools
sidebar_position: 3
---

# MCP tool reference

The current authenticated integration exposes two public tools: `testportal-find-action` discovers contracts and `testportal-execute-action` invokes one action. The tables below list canonical action IDs, not public tool names. Confirm the live `tools/list` result after [connecting](getting-started.md); source support does not establish the deployed version.

Use UUIDs from the intended project. Examples below contain synthetic UUID placeholders and must be replaced. Read-only queries are a useful starting point before enabling any operation that writes data.

Call discovery with `{}` for an overview, with `{"query":"manual step outcome","area":"tms","limit":3}` for bounded search, or with `{"actionId":"testportal-get-results"}` for an exact contract. Areas are `core` and `tms`; shared project, status and time actions belong to both. Search returns at most five definitions (default three), with `hasMore` indicating further matches. A query and action ID cannot be combined; limit applies only to queries.

## Migrate existing clients

This is an immediate breaking change: direct calls to former prefixed and unprefixed tools fail without aliases. Call `testportal-execute-action` with `{"actionId":"testportal-check-status","arguments":{}}`, for example, and use discovery to retrieve action contracts. Update saved calls and reconnect after deployment. Restart the server at cutover so existing in-memory sessions cannot retain the old tool surface; clients must reconnect again after rollback.

Action arguments, service responses, authentication, project scoping, prompt identifiers and the endpoint remain unchanged. Discovery is marked read-only. The executor is conservatively marked potentially destructive and non-idempotent; individual action effects are metadata, not native per-action MCP annotations. Client approval behavior varies and should be checked with your client.

## Read tools

All listed inputs are required unless marked optional.

| Tool | Inputs | Expected result |
| --- | --- | --- |
| `testportal-check-status` | `{}` | Status `ok`, timestamp and service name; not a database health probe |
| `testportal-current-time` | `{}` | UTC ISO date and timestamp |
| `testportal-get-available-projects` | `{}` | Active projects as an array of `{id, name}`; use a returned `id` for project-scoped calls |
| `testportal-get-issues` | `projectId`; optional `category`, `name`, `page`, `limit`, `statFrom`, `statTo` | Issues with category and linked-result category summaries |
| `testportal-get-issue-by-id` | `issueId`, `projectId` | One issue and category summary |
| `testportal-get-results` | `projectId`; optional filters below | Matching results with pagination |
| `testportal-get-result-by-id` | `resultId`, `projectId` | Result with execution/error details |
| `testportal-get-results-stats` | `projectId`; optional `dates` | Status/entity counts and error/issue statistics |
| `testportal-get-execution-by-id` | `executionId`, `projectId` | Execution details |
| `testportal-get-spec-by-id` | `specId`, `projectId` | Spec details and normalized tags |
| `testportal-get-result-error-by-id` | `resultErrorId`, `projectId` | Error details |
| `testportal-get-assumption-by-id` | `assumptionId`, `projectId` | Issue/error association details |

`testportal-get-issues` accepts category `bug`, `infra`, `performance`, `script` or `other`; pagination fields **are strings**, with schema defaults `"1"` and `"10"`. Statistics bounds `statFrom`/`statTo` are ISO datetimes.

`testportal-get-results` filters are optional strings `tag`, `specId`, `specFile`, `specName`, `environment`, `type`, `status`, `from`, `to`, plus `dates` as an array of strings. Its `page` and `limit` **are numbers**, with schema defaults 1 and 1000. Use ISO dates for date filtering and send an explicit small limit when exploring.

Example MCP `tools/call` payload (the client supplies the negotiated transport/session):

```json
{
  "name": "testportal-execute-action",
  "arguments": {
    "actionId": "testportal-get-results",
    "arguments": {
      "projectId": "11111111-1111-4111-8111-111111111111",
      "status": "failed",
      "page": 1,
      "limit": 10
    }
  }
}
```

For issues, note the different pagination types:

```json
{
  "name": "testportal-execute-action",
  "arguments": {
    "actionId": "testportal-get-issues",
    "arguments": {
      "projectId": "11111111-1111-4111-8111-111111111111",
      "category": "bug",
      "page": "1",
      "limit": "10"
    }
  }
}
```

## Tools that change data

Run these only for intended changes in a project you are authorized to manage. Automated review can depend on instance analysis configuration. An **assumption** is a proposed association between an issue and a result error; confirming an association is distinct from the test's pass/fail status.

| Tool | Required inputs | Optional inputs | Effect/result |
| --- | --- | --- | --- |
| `testportal-create-issue` | `name`, `category`, `projectId` | `description`, `portal`, `service`, `ticket` | Creates and returns an issue; same category values as above |
| `testportal-create-assumption` | `issueId`, `resultErrorId` | `madeBy`, `isConfirmed`, `description`, `hypothesis`, `evidence` | Creates and returns an issue/error association |
| `testportal-update-assumption` | `assumptionId`, `madeBy` | `isConfirmed`, `description`, `hypothesis`, `evidence` | Updates an association; **`isConfirmed: false` deletes it** |
| `testportal-assign-issue-to-result-error` | `resultErrorId`, `assumptionId` | None | Assigns the issue through an existing assumption; returns updated error |
| `testportal-review-result-error` | `resultErrorId` | None | Runs automated review and can create associations; returns reviewed error |
| `testportal-bulk-review-result-errors` | `errorIds` (array of UUID strings) | None | Reviews errors in a batch; returns per-batch outcomes/counts |

For `testportal-update-assumption`, send `madeBy: "user"`; the service rejects other nonempty values even though the schema accepts a string. Reviewer identity comes from the authenticated MCP session. `isConfirmed` is boolean and description/hypothesis/evidence fields are strings. Do not treat rejection (`false`) as a reversible draft update.

Illustrative issue-creation input for a deliberate test-project action:

```json
{
  "name": "testportal-execute-action",
  "arguments": {
    "actionId": "testportal-create-issue",
    "arguments": {
      "projectId": "11111111-1111-4111-8111-111111111111",
      "name": "Example checkout failure",
      "category": "bug",
      "description": "Synthetic example; replace with reviewed failure details."
    }
  }
}
```

## Response and error handling

Results use MCP `content` text blocks containing serialized JSON. Mutation responses can prepend a success message; do not assume every text block parses directly as JSON. For example, `testportal-check-status` returns this illustrative structure with a generated timestamp:

```json
{
  "content": [{
    "type": "text",
    "text": "{\"status\":\"ok\",\"timestamp\":\"2026-10-20T10:00:00.000Z\",\"service\":\"test-portal-server\"}"
  }]
}
```

Unknown action IDs and invalid action arguments produce `isError: true` with a JSON error kind and, for invalid arguments, field paths and messages. An exact lookup with the wrong area returns `area_mismatch`. Invalid public envelopes produce MCP validation errors. Handler failures retain their existing text, such as `Error fetching results: ...`. Check protocol errors and tool `isError` before using the result. A bulk review's overall response is not proof every item succeeded: inspect its item/count outcomes.

Mock tools and unregistered exports are excluded. If a name is absent from live discovery, check the deployed version with the maintainer instead of guessing a replacement endpoint. Use [UI guides](../guides/issues.md) to inspect resulting issue associations.

For the nine project-scoped Test Scenario tools, see the dedicated [Test Scenario MCP reference](test-scenarios.md). Its source baseline does not guarantee that every instance has deployed those tools; check live discovery first.

For the nine manual execution and history tools, see [Manual test runs over MCP](manual-test-runs.md). They record client-observed outcomes and require explicit completion; check live discovery before relying on deployed availability.

The four shared environment-profile tools and a profile-to-run example are documented in [Manual test runs over MCP](manual-test-runs.md#manage-environment-profiles). Check live discovery for their availability.
