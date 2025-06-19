---
'@ckwalsh/signedsource-cli': patch
'@ckwalsh/signedsource': patch
---

Generate provenance statements for npm

Setting up a GitHub Actions workflow based on
https://docs.npmjs.com/generating-provenance-statements

If this was set up correctly, the GitHub-hosted runner should only be triggered
if changesets attempts to publish from the self-hosted runner.
