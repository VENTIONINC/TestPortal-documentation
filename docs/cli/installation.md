---
title: Install the CLI
description: Install the integration CLI with the correct package registry and executable.
slug: /cli/installation
sidebar_position: 2
---

# Install the CLI

Use Node.js 18 or newer as required by the CLI manifest; prefer a currently maintained Node release. These requirements belong to the CLI, independently of the Test Portal instance or documentation website.

## Registry access

The inspected CLI version is **1.1.2**. Its package is `@vention-test-portal/test-portal-integration-cli`, published to GitHub Packages. You need a GitHub account/token with package read access and access to this package. Ask your instance maintainer to confirm that this version is available to your account before continuing. Anonymous installation from npm is not established.

For this package scope, put the following in your user npm configuration (`~/.npmrc`). `${NPM_TOKEN}` is a variable reference; supply it securely in the shell or CI secret store, never as a committed token value.

```ini
@vention-test-portal:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

Install the version used in these guides:

```bash
npm install --global @vention-test-portal/test-portal-integration-cli@1.1.2
```

The npm registry token downloads the package. The separate Test Portal upload API key submits reports. See [authentication](../getting-started/authentication.md).

## Verify installation

```bash
node --version
test-portal-cli --version
test-portal-cli --help
```

Expect version `1.1.2` and required `--input` and `--type` options. The help banner calls the program `test-convert`; use the installed executable **`test-portal-cli`** shown above.

If npm returns 401/403/404, confirm the scoped registry, package/version availability, token permission and any organization access requirements with the package maintainer. If the command is missing, check npm's global executable directory is on `PATH`. Continue with [configuration](configuration.md) and [your first report](../getting-started/first-report.md).
