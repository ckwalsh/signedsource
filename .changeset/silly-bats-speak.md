---
'@ckwalsh/signedsource': minor
'@ckwalsh/signedsource-cli': minor
---

# Rewrite ALL THE THINGS!

Rewrote just about everything.

Still not completely satisfied, so not bumping to 1.0.0 yet.

- Complete API change
- Complete Implementation change (to streams based)

## Future Work

- Synchronous API (NodeJS only)

## Workspace Changes

- Deleted eslint workspace package. It will be re-added when I implement the
  synchronous API, since eslint rules don't support async logic.
- Delete dev workspace package. Now using `@ckwalsh/typescript-dev-configs`
- Rearrange a ton of devtools. Trying to unify them in the root package and
  share configs as much as possible.
- Stripped out readme generation. It's cool, but really should be it's own
  package if it sticks around.
