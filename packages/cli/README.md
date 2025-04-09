# @ckwalsh/signedsource-cli

CLI to sign and verify generated code, based on Meta's signedsource package.


## Installation

<details>
<summary>npm</summary>

```
npm install --global @ckwalsh/signedsource-cli
```

</details>
<details>
<summary>yarn</summary>

```
yarn add --global @ckwalsh/signedsource-cli
```

</details>
<details>
<summary>pnpm</summary>

```
pnpm add --global @ckwalsh/signedsource-cli
```

</details>

## Usage

```
$ # Sign the file in place
$ signedsource sign unsigned.txt

$ # Output to a different file
$ signedsource sign unsigned.txt --outFile signed.txt

$ # Output to stdout
$ signedsource sign unsigned.txt --outFile -

$ # Verify a signed file
$ signedsource verify signed.txt
```

## Other Packages

- [@ckwalsh/signedsource](../lib#readme) - Library to sign and verify generated code, based on Meta's signedsource package.
- [@ckwalsh/signedsource-eslint-plugin](../eslint#readme) - ESLint plugin for ensuring that generated files haven't been tampered with.

## License

MIT License

Copyright (c) 2025 Cullen Walsh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

<!-- @generated SignedSource<<5834f8101790570c01157119051de641>> -->
