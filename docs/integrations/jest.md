---
title: Jest
description: Normalize Jest JSON for CLI 1.1.2, convert to CTRF and submit results.
slug: /integrations/jest
sidebar_position: 3
---

# Jest

## Overview

Use Jest JSON with provider `jest`. CLI 1.1.2 expects `testFilePath`, while standard Jest JSON uses `name`. Normalize this field before conversion. This documented compatibility step is required for the inspected version.

## Prerequisites

Have a working Jest project, its dependencies, [CLI access](../cli/installation.md), and a Test Portal project/[upload key](../getting-started/authentication.md). Keep your Jest version's Node requirements.

## Generate the source report

```bash
mkdir -p reports
npx jest --runInBand --json --outputFile=reports/jest.json
```

The [Jest CLI](https://jestjs.io/docs/30.0/cli) writes JSON even when assertions fail; preserve the nonzero test outcome separately from reporting.

Save the following as `normalize-jest.cjs`. It preserves the source and adds the fields expected by this CLI. It refuses an empty or inconsistent report rather than silently uploading fewer tests.

```javascript
const fs = require('node:fs');
const [input, output] = process.argv.slice(2);
const report = JSON.parse(fs.readFileSync(input, 'utf8'));
if (!Array.isArray(report.testResults) || !(report.numTotalTests > 0)) {
  throw new Error('Expected a nonempty Jest JSON report');
}
let count = 0;
for (const suite of report.testResults) {
  suite.testFilePath = suite.testFilePath || suite.name;
  if (typeof suite.testFilePath !== 'string') throw new Error('Missing Jest file path');
  suite.perfStats = suite.perfStats || {runtime: Math.max(0, suite.endTime - suite.startTime)};
  if (!suite.skipped) count += (suite.assertionResults || []).length;
}
if (count !== report.numTotalTests) throw new Error('Jest test count mismatch; inspect skipped files');
fs.writeFileSync(output, JSON.stringify(report, null, 2));
```

```bash
node normalize-jest.cjs reports/jest.json reports/jest.normalized.json
```

## Configure Test Portal

Set `TEST_PORTAL_API_KEY` securely and `TEST_PORTAL_URL` to the complete CTRF API-key upload URL for your backend. The key chooses the destination project; see [configuration](../cli/configuration.md).

## Convert and upload

```bash
test-portal-cli --input reports/jest.normalized.json --type jest \
  --output reports/jest.ctrf.json --webhook "$TEST_PORTAL_URL"
```

Inspect `results.tests.length` and the source count before accepting the result. For automation, separate local conversion from [checked REST upload](../api/report-upload.md); webhook errors can leave CLI exit 0.

## Verify the results

In the same project and report date in **Results**, find the file/spec and assertion names. Passed/failed assertions retain their statuses; Jest `pending` becomes skipped and `todo` becomes pending in CTRF. Entirely skipped files are omitted by this converter, so the normalization check deliberately stops on a count mismatch. Retries are not reconstructed as multiple attempts by this provider.

## Troubleshooting

An error involving `split`/an undefined path commonly indicates missing normalization. `Invalid jest format in file` means required JSON counts or `testResults` are absent. A count mismatch requires reviewing skipped files or report-producer differences; do not ignore it or claim full import. See [troubleshooting](../troubleshooting.md).
