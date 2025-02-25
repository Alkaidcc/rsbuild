# Rsbuild Contribution Guide

Thanks for that you are interested in contributing to Rsbuild. Before starting your contribution, please take a moment to read the following guidelines.

---

## Setup the Environment

### Fork the Repo

[Fork](https://help.github.com/articles/fork-a-repo/) this repository to your
own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local.

### Install Node.js

We recommend using Node.js 20. You can check your currently used Node.js version with the following command:

```bash
node -v
```

If you do not have Node.js installed in your current environment, you can use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to install it.

Here is an example of how to install the Node.js 20 LTS version via nvm:

```bash
# Install the LTS version of Node.js 20
nvm install 20 --lts

# Make the newly installed Node.js 20 as the default version
nvm alias default 20

# Switch to the newly installed Node.js 20
nvm use 20
```

### Install Dependencies

Enable [pnpm](https://pnpm.io/) with corepack:

```sh
corepack enable
```

Install dependencies:

```sh
pnpm install
```

What this will do:

- Install all dependencies
- Create symlinks between packages in the monorepo
- Run the `prepare` script to build all packages, powered by [nx](https://nx.dev/).

### Set Git Email

Please make sure you have your email set up in `<https://github.com/settings/emails>`. This will be needed later when you want to submit a pull request.

Check that your git client is already configured the email:

```sh
git config --list | grep email
```

Set the email to global config:

```sh
git config --global user.email "SOME_EMAIL@example.com"
```

Set the email for local repo:

```sh
git config user.email "SOME_EMAIL@example.com"
```

---

## Making Changes and Building

Once you have set up the local development environment in your forked repo, we can start development.

### Checkout A New Branch

It is recommended to develop on a new branch, as it will make things easier later when you submit a pull request:

```sh
git checkout -b MY_BRANCH_NAME
```

### Build the Package

Use [nx build](https://nx.dev/nx-api/nx/documents/run) to build the package you want to change:

```sh
npx nx build @rsbuild/core
```

Build all packages:

```sh
pnpm run build
```

---

## Testing

### Add New Tests

If you've fixed a bug or added code that should be tested, then add some tests.

You can add unit test cases in the `<PACKAGE_DIR>/tests` folder. The test runner is based on [Vitest](https://vitest.dev/).

### Run Unit Tests

Before submitting a pull request, it's important to make sure that the changes haven't introduced any regressions or bugs. You can run the unit tests for the project by executing the following command:

```sh
pnpm run ut
```

You can also run the unit tests of single package:

```sh
pnpm run ut packages/core
```

### Run E2E Tests

Rsbuild uses [playwright](https://github.com/microsoft/playwright) to run end-to-end tests.

You can run the `e2e` command to run E2E tests:

```sh
pnpm run e2e
```

If you need to run a specified test, you can add keywords to filter:

```sh
# Only run test cases which contains `vue` keyword in file path with Rspack
pnpm e2e:rspack vue
# Only run test cases which contains `vue` keyword in test name with Rspack
pnpm e2e:rspack -g vue
```

---

## Linting

To help maintain consistency and readability of the codebase, we use [Biome](https://github.com/biomejs/biome) to lint the codes.

You can run the linters by executing the following command:

```sh
pnpm run lint
```

For VS Code users, you can install the [Biome VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) to see lints while typing.

---

## Documentation

Currently Rsbuild provides documentation in English and Chinese. If you can use Chinese, please update both documents at the same time. Otherwise, just update the English documentation.

You can find all the documentation in the `packages/document` folder:

```bash
root
└─ packages
   └─ document
```

This website is built with [Rspress](https://github.com/web-infra-dev/rspress), the document content can be written using markdown or mdx syntax. You can refer to the [Rspress Website](https://rspress.dev/) for detailed usage.

---

## Submitting Changes

### Committing your Changes

Commit your changes to your forked repo, and [create a pull request](https://help.github.com/articles/creating-a-pull-request/).

### Format of PR titles

The format of PR titles follow Conventional Commits.

An example:

```
feat(plugin-swc): Add `myOption` config
^    ^    ^
|    |    |__ Subject
|    |_______ Scope
|____________ Type
```

---

## Benchmarking

You can input `!bench` in the comment area of ​​the PR to do benchmarking on `rsbuild` (you need to have Collaborator and above permissions).

You can focus on metrics related to build time and bundle size based on the comparison table output by comments to assist you in making relevant performance judgments and decisions.

Dependencies installation-related metrics base on publishing process, so the data is relatively lagging and is for reference only.

---

## Versioning

We use [changesets] to manage version. Currently, all Rsbuild packages will use a fixed unified version.

The release notes are automatically generated by [GitHub releases](https://github.com/web-infra-dev/rsbuild/releases).

## Releasing

Repository maintainers can publish a new version of all packages to npm.

Here are the steps to publish (we generally use CI for releases and avoid publishing npm packages locally):

1. [Create release pull request](https://github.com/web-infra-dev/rsbuild/actions/workflows/release-pull-request.yml).
2. [Run the release action](https://github.com/web-infra-dev/rsbuild/actions/workflows/release.yml).
3. [Generate the release notes](https://github.com/web-infra-dev/rsbuild/releases).
4. Merge the release pull request.
