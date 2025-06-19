# @ckwalsh/signedsource

## 0.3.1

### Patch Changes

- 13f4d32: Generate provenance statements for npm

  Setting up a GitHub Actions workflow based on
  https://docs.npmjs.com/generating-provenance-statements

  If this was set up correctly, the GitHub-hosted runner should only be
  triggered if changesets attempts to publish from the self-hosted runner.

## 0.3.0

### Minor Changes

- 7ee7205: Rewrite ALL THE THINGS!

  Rewrote just about everything.

  Still not completely satisfied, so not bumping to 1.0.0 yet.

  - Complete API change
  - Complete Implementation change (to streams based)

  **Future Work:**

  - Synchronous API (NodeJS only)

  **Workspace Changes:**

  - Deleted eslint workspace package. It will be re-added when I implement the
    synchronous API, since eslint rules don't support async logic.
  - Delete dev workspace package. Now using `@ckwalsh/typescript-dev-configs`
  - Rearrange a ton of devtools. Trying to unify them in the root package and
    share configs as much as possible.
  - Stripped out readme generation. It's cool, but really should be it's own
    package if it sticks around.

## 0.2.1

### Patch Changes

- 8abcb38: Fix issues with fully generated files not being checked

## 0.2.0

### Minor Changes

- Switch to pnpm, significant refactoring
