---
title: Cypress
description: Prepare Mochawesome JSON for the Cypress provider without losing nested tests.
slug: /integrations/cypress
sidebar_position: 4
---

# Cypress

## Overview

The `cypress` provider consumes a Mochawesome-shaped JSON report. In CLI 1.1.2 it reads only top-level suite tests and expects test titles as arrays. Standard nested Mochawesome output therefore needs the normalization below. Raw Cypress run objects, HTML reports and arbitrary JSON are not supported by this recipe.

## Prerequisites

Have a working Cypress project and its normal browser/application setup, [CLI 1.1.2](../cli/installation.md), an instance/project and [upload key](../getting-started/authentication.md). Install and lock compatible `mochawesome` and `mochawesome-merge` versions in the test project:

```bash
npm install --save-dev mochawesome mochawesome-merge
```

## Generate the source report

Start from a fresh report directory for each run, so reports from earlier runs are not merged accidentally:

```bash
npx cypress run --reporter mochawesome \
  --reporter-options 'reportDir=reports/mochawesome,overwrite=false,html=false,json=true'
npx mochawesome-merge 'reports/mochawesome/*.json' -o reports/cypress.json
```

[Cypress's reporter guide](https://docs.cypress.io/app/tooling/reporters) explains per-spec reports and merging. After failing tests, run the merge step separately while preserving the test command's failing outcome. The merge command must receive only files from the current run.

Save this as `normalize-cypress.cjs`. It flattens every nested suite, preserves full test titles, supplies inherited file paths and checks the count before producing a separate input for the CLI:

```javascript
const fs = require('node:fs');
const [input, output] = process.argv.slice(2);
const report = JSON.parse(fs.readFileSync(input, 'utf8'));
if (!Array.isArray(report.results) || !(report.stats?.tests > 0)) {
  throw new Error('Expected a nonempty Mochawesome report');
}
const flat = [];
function visit(suite, inheritedFile = '') {
  const file = suite.file || suite.fullFile || inheritedFile;
  const tests = (suite.tests || []).map(test => ({
    ...test,
    title: Array.isArray(test.title) ? test.title : [test.title],
  }));
  if (tests.length) {
    if (!file) throw new Error('Missing Cypress spec file');
    if (tests.some(test => !['passed', 'failed', 'pending'].includes(test.state))) {
      throw new Error('Unsupported Cypress test state; inspect the report');
    }
    flat.push({...suite, file, tests, suites: []});
  }
  for (const child of suite.suites || []) visit(child, file);
}
for (const suite of report.results) visit(suite);
if (flat.reduce((n, suite) => n + suite.tests.length, 0) !== report.stats.tests) {
  throw new Error('Cypress test count mismatch');
}
fs.writeFileSync(output, JSON.stringify({...report, results: flat}, null, 2));
```

```bash
node normalize-cypress.cjs reports/cypress.json reports/cypress.normalized.json
```

## Configure Test Portal

Supply `TEST_PORTAL_API_KEY` securely and the complete CTRF API-key upload URL as `TEST_PORTAL_URL`; see [configuration](../cli/configuration.md).

## Convert and upload

```bash
test-portal-cli --input reports/cypress.normalized.json --type cypress \
  --output reports/cypress.ctrf.json --webhook "$TEST_PORTAL_URL"
```

Compare the converted `results.tests` length and names with `stats.tests` and the merged source before accepting the upload. Prefer [checked REST submission](../api/report-upload.md) in scripts, since CLI webhook failures can still exit 0.

## Verify the results

In **Results**, choose the key's project/date and inspect your spec files and full test names. `pending` maps to skipped. This provider creates one attempt per test; it does not reconstruct Cypress retries or upload videos/screenshots. Error text/stack is available only when supplied in the report.

## Troubleshooting

Zero tests or names reduced to single characters indicate unnormalized nested/string-title output. A normalization error means the report needs inspection; do not bypass count/state checks. Stale extra tests usually mean an old report directory was merged. For authentication, HTTP or UI filters see [troubleshooting](../troubleshooting.md).
