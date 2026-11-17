---
title: AI-assisted workflows
description: Review AI-generated issue drafts, polished issue text, and insights in dashboard PDF exports.
slug: /guides/ai-assisted-workflows
---

# AI-assisted workflows

Select a project in your Test Portal instance. Available actions and their labels depend on the deployed client and backend versions. Generated output also depends on the instance's AI configuration.

## Triage a failed result

1. In **Results**, open a failed result's error message to inspect its error and available diagnostics.
2. In the **Assign Issue** dialog, choose **Categorise with AI** when available. The backend uses the stored result and its error details. It uses existing classification information when available and otherwise attempts to classify the result before generating an issue draft.
3. Review the suggested category, issue name and description in the form. Look in the description for suggested investigation steps and check them against the failure details. Edit the draft before choosing **Assign Issue**.

The suggestion workflow supports stored failed or flaky results with error details. If the request fails, you can still enter the issue details manually. See [Inspect test results](test-results.md) and [Investigate and manage issues](issues.md).

## Polish issue text

In the result's issue dialog, use the polish control beside a filled issue name or description to format that field. Review the replacement in the same field. Use **Undo polish** to restore the previous wording if needed.

On the **Issues** page, open **Manage issue** and choose **Polish with AI** to format the issue name and description together. Review both fields in the edit drawer before choosing **Update**.

## Review AI insights in a dashboard PDF

1. Open **Dashboard** and select the filters for the report you want to share.
2. Open the **Export PDF** menu and choose **Export PDF + AI**.
3. Open the downloaded PDF and review the **AI Insights** section when present. Check its interpretation against the report's metrics before sharing.

## Set up direct OpenAI access

Administrators of the public version can configure the Test Portal backend to connect directly to the OpenAI API. Use the [AI connection configuration](https://github.com/VENTIONINC/TestPortal-backend/blob/da2b73baa138da3c7eada3550f68f8151942fff1/docs/DEVELOPMENT_GUIDE.md#-ai-connection-configuration) instructions for a backend version that includes this configuration.

Follow [Troubleshooting direct OpenAI setup](https://github.com/VENTIONINC/TestPortal-backend/blob/da2b73baa138da3c7eada3550f68f8151942fff1/docs/DEVELOPMENT_GUIDE.md#troubleshooting-direct-openai-setup) to run the optional synthetic check. Success verifies technical compatibility for one formatting request with the configured model and API settings.
