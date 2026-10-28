---
title: Review scenario automation evidence
description: Link Test Scenarios to Specs and understand related Results and observed-Issue evidence.
slug: /guides/scenario-automation-evidence
sidebar_position: 7
---

# Review scenario automation evidence

A Test Scenario can be linked to a **Spec** from the result's scenario-link controls. The link associates the scenario with that automated Spec. It does not turn a manual run into an automated result.

## Link or unlink a scenario

1. Open the automated result and its issue/context view.
2. Review the related scenarios, or open the scenario picker and search the current project's scenarios.
3. Select a scenario and confirm linking it to the result's Spec. To remove a link, use its unlink action and confirm.
4. Check the refreshed coverage list. If a write succeeds but coverage cannot refresh, refresh the data before retrying a write.

The link is project-scoped. The available picker is paginated and can be searched. A scenario may be linked to multiple Specs; links do not copy the scenario or change its fields.

## Understand the evidence

When you inspect scenario evidence, **Results** come from executions of linked Specs. **Observed Issues** are derived through those Results and their recorded issue associations. Evidence can be paginated separately for Results and Issues. The evidence view reports linked Specs and result/issue totals, so an empty page does not necessarily mean there are no records on another page. The MCP `get-test-scenario` tool returns these evidence collections with the scenario detail.

If a scenario has no linked Specs, there is no linked execution evidence to show. A linked Spec may also have no Results, and Results may have no observed Issues. These are different states; an empty evidence collection does not by itself indicate an integration failure.

The **Related issue URL** field on a scenario is simply a URL entered by an author. It does not create a Test Portal issue association or appear as observed-Issue evidence. Likewise, a manual run and its outcome are separate from automated Results. See [manual test runs](manual-test-runs.md) and [inspect test results](test-results.md).

Deleting a scenario removes its Spec links but preserves linked Specs and existing Results, errors, assumptions, and Issues. Folder moves and suite membership changes do not alter the automated evidence.

## See also

- [Create and edit Test Scenarios](test-scenarios.md)
- [Investigate and manage issues](issues.md)
- [Scenario MCP tools](../mcp/test-scenarios.md)
