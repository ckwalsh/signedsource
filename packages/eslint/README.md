# @ckwalsh/signedsource-eslint-plugine

ESLint plugin for ensuring generated files signed by the [@ckwalsh/signedsource](../lib#readme) library.

## Installation

<details>
<summary>npm</summary>

```
npm install --save-dev @ckwalsh/signedsource-eslint-plugine
```

</details>
<details>
<summary>yarn</summary>

```
yarn add --save-dev @ckwalsh/signedsource-eslint-plugine
```

</details>
<details>
<summary>pnpm</summary>

```
pnpm add --save-dev @ckwalsh/signedsource-eslint-plugine
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

## Related Packages

- [@ckwalsh/signedsource](../lib#readme) - Library for signing / verifying files programatically.

## License

MIT
