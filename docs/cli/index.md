---
title: CLI
description: Understand the Test Portal integration CLI and how it handles reports.
slug: /cli
sidebar_position: 1
---

# CLI

The integration package is `@vention-test-portal/test-portal-integration-cli`. Its installed executable is `test-portal-cli`. The package declares GitHub Packages as its publication registry, so confirm package access before installing it in your environment.

## Conversion and submission

The CLI requires an input file and a provider type. It can write CTRF to a file, print it to standard output, or send it to a webhook. The webhook URL can be supplied explicitly or through `TEST_PORTAL_URL`; `TEST_PORTAL_API_KEY` supplies the upload API key.

Setting a webhook URL enables submission even when you also request file output. Use an environment without a configured webhook when you want local conversion only.

## Confirm upload success

Inspect the upload outcome. In the audited implementation, a failed webhook is logged without necessarily causing a nonzero process exit status. A successful CLI exit alone does not prove the report reached Test Portal.

See the [integration overview](../integrations/index.md) for source formats and the [API overview](../api/index.md) for upload authentication.
