---
title: MCP tool reference
description: Use the selected registered Test Portal tools and understand inputs and side effects.
slug: /mcp/tools
sidebar_position: 3
---

# MCP tool reference

These tools are explicitly selected from the authenticated Test Portal MCP integration and checked against the recorded server registration, schemas and handlers. They cover product workflows, not private prompts or arbitrary backend exports. Confirm the live `tools/list` result after [connecting](getting-started.md); a source snapshot does not establish your instance's deployed version or grant authorization to its data.

Use UUIDs from the intended project. Examples below contain synthetic UUID placeholders and must be replaced. Read-only queries are a useful starting point before enabling any operation that writes data.

Every backend MCP tool uses the canonical `testportal-<previous-name>` form. Unprefixed names are unsupported and have no aliases or transition period. Reconnect and discover the current catalog, or update hard-coded calls before invoking tools.

## Migrate existing clients

After the backend naming update, reconnect your MCP client and refresh its tool catalog. Update saved tool selections and hard-coded `tools/call` names by adding `testportal-` to the complete previous name; for example, `check-status` becomes `testportal-check-status` and `append-test-scenario-step` becomes `testportal-append-test-scenario-step`. Add the prefix only once.

Arguments, responses, authentication, and project scoping remain unchanged. Prompt identifiers and the MCP endpoint remain unchanged. Calls using old tool names fail as unknown tools before their handlers execute.

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
  "name": "testportal-get-results",
  "arguments": {
    "projectId": "11111111-1111-4111-8111-111111111111",
    "status": "failed",
    "page": 1,
    "limit": 10
  }
}
```

For issues, note the different pagination types:

```json
{
  "name": "testportal-get-issues",
  "arguments": {
    "projectId": "11111111-1111-4111-8111-111111111111",
    "category": "bug",
    "page": "1",
    "limit": "10"
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
  "name": "testportal-create-issue",
  "arguments": {
    "projectId": "11111111-1111-4111-8111-111111111111",
    "name": "Example checkout failure",
    "category": "bug",
    "description": "Synthetic example; replace with reviewed failure details."
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

Handler failures set `isError: true` with text such as `Error fetching results: ...`; the suffix depends on the actual failure. Schema/protocol errors can be returned before the handler. Check both protocol errors and tool `isError` before using the result. A bulk review's overall response is not proof every item succeeded: inspect its item/count outcomes.

Mock tools and unregistered exports are excluded. If a name is absent from live discovery, check the deployed version with the maintainer instead of guessing a replacement endpoint. Use [UI guides](../guides/issues.md) to inspect resulting issue associations.

For the nine project-scoped Test Scenario tools, see the dedicated [Test Scenario MCP reference](test-scenarios.md). Its source baseline does not guarantee that every instance has deployed those tools; check live discovery first.

For the nine manual execution and history tools, see [Manual test runs over MCP](manual-test-runs.md). They record client-observed outcomes and require explicit completion; check live discovery before relying on deployed availability.

The four shared environment-profile tools and a profile-to-run example are documented in [Manual test runs over MCP](manual-test-runs.md#manage-environment-profiles). Check live discovery for their availability.
