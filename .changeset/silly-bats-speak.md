---
'@ckwalsh/signedsource': minor
---

Rewrote just about everything

- Complete API rewrite of lib
- Rewrite of CLI
- Delete eslint workspace package. It will be re-added when I implement a
  non-async export for nodejs usage only, since eslint rules don't support async
  code.
- Delete dev workspace package. Now using `@ckwalsh/typescript-dev-configs`
- Rearrange a ton of devtools. Trying to unify them in the root package and
  share configs as much as possible.
- Stripped out readme generation. It's cool, but really should be it's own
  package if it sticks around.
