---
title: Integrations
description: Choose a source report format for Playwright, Jest, or Cypress.
slug: /integrations
sidebar_position: 1
---

# Integrations

The Test Portal integration CLI includes converters for Playwright, Jest, and Cypress reports. Choose the converter that matches the report contents.

| Framework | Source report |
| --- | --- |
| Playwright | JSON report produced by the Playwright JSON reporter |
| Jest | Jest JSON results with the documented file-path normalization |
| Cypress | Mochawesome JSON with the documented suite/title normalization |

A filename ending in `.json` does not guarantee compatibility. Cypress console output or an arbitrary JSON report is not interchangeable with the expected Mochawesome structure.

The CLI converts reports to CTRF for output and upload. See the [CLI overview](../cli/index.md) and [API overview](../api/index.md) before choosing your submission method.

## Guides

- [Playwright](playwright.md)
- [Jest](jest.md)
- [Cypress](cypress.md)
- [GitHub Actions](github-actions.md)

See [troubleshooting](../troubleshooting.md) for symptoms and resolutions.
