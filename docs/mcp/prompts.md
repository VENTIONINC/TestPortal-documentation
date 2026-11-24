---
title: TMS workflow prompt
description: Discover and use the TMS workflow assistant with an MCP client.
slug: /mcp/prompts
sidebar_position: 4
---

# TMS workflow prompt

The source supports `tms-workflow-assistant`, a prompt that guides scenario authoring, organization, manual runs, retests and evidence investigation. Availability depends on the deployed instance.

## Use the Prompts gallery

Open **Prompts** in TestPortal and select **TMS Workflow Assistant**. The builder shows the selected active project's name and UUID; choose an active project if none is selected or switch projects in the selector. Optionally enter a task and choose an execution mode:

- **Not specified** leaves the mode unset, so the consuming assistant can clarify it when needed.
- **Human guided** means a tester reports observations and outcomes to the assistant.
- **Client executed** means the consuming AI client observes the application using its own available tools.

The preview updates as you configure the prompt. You can also select **Generate Prompt**, then use **Copy to Clipboard** and paste the result into your AI client. Generation and copying only produce instructions; any execution occurs in the consuming AI client with the necessary access and authorization.

## Use an MCP client

Use a client that supports MCP prompts. Reconnect, then check `prompts/list` and discover actions on that instance.

Retrieve it with `prompts/get`; omit `arguments` or provide an empty object when no context is known:

```json
{"jsonrpc":"2.0","id":2,"method":"prompts/get","params":{"name":"tms-workflow-assistant"}}
```

All arguments are optional strings. `project_id` must be a UUID, `task` must be nonblank, and `execution_mode` must be `human_guided` or `client_executed`. Invalid supplied values are rejected. This example UUID is synthetic:

```json
{"jsonrpc":"2.0","id":3,"method":"prompts/get","params":{"name":"tms-workflow-assistant","arguments":{"project_id":"11111111-1111-4111-8111-111111111111","task":"Retest the failed checkout scenario","execution_mode":"human_guided"}}}
```

The returned instructions do not execute application tests or change records. The client discovers contracts with `testportal-find-action` and invokes action IDs through `testportal-execute-action`; see the [tool reference](tools.md). The client must resolve project and task context and operate within your authorization.

## Example workflows

- **Find scenarios:** “Find high-priority checkout scenarios by Alice or Bob in Payments.” Look up the authors and folder, then combine their UUIDs with the text and priority filters. Ask the client to say how many matches it inspected and clarify any unresolved author or folder.
- **Author and organize:** “Create an expired-session checkout scenario with these three steps, place it in Payments, and add it to Checkout Regression.” The client should use the folder's full path and the intended suite's UUID. If suite names repeat and metadata leaves multiple candidates, it should ask which suite to use before writing. It should report the generated key and read back the saved steps, folder, and membership. If a follow-up fails or its outcome is uncertain, it should report the saved key and inspect that part before retrying it.
- **Edit an existing step:** “In TMS-42, change step 3’s expected result to ‘The session-expired message appears.’” The client should resolve the exact project key, read the ordered steps to find the saved step UUID, and verify the updated step, revision, and updater.
- **Human-guided execution:** Choose `human_guided`. The client presents each snapshot step and records the tester's reported observation and outcome. An expected result or missing reply is not a pass.
- **Client-executed execution:** Choose `client_executed`. The client needs its own browser or API access to observe the application; it records the actual observations and their source. Missing access or evidence is a blocker, not a pass. TestPortal records manual history and does not execute those checks or create automated Results.
- **Retest:** Ask for a new run from the live scenario after a failure. The new snapshot has its own step IDs; the completed earlier run remains unchanged.
- **Investigate:** Ask the client to inspect manual history and current linked automated Results and Issues. It should use discovery across `tms` and `core`, check pagination independently, distinguish authored URLs from observed Issues, and label unconfirmed hypotheses and coverage limits.

For every write, request or expect a read-back. If a response is lost, inspect current state before retrying to avoid duplicates. Client behavior varies; verify the actual trace and persisted results.
