# @ckwalsh/signedsource-cli

Command line tool for signing / verifying source files using the
[@ckwalsh/signedsource](../lib#readme) library.

## Installation

<details>
<summary>npm</summary>

```
npm install -g @ckwalsh/signedsource-cli
```
</details>
<details>
<summary>yarn</summary>

```
yarn add -g @ckwalsh/signedsource-cli
```
</details>
<details>
<summary>pnpm</summary>

```
pnpm add -g @ckwalsh/signedsource-cli
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

- [@ckwalsh/signedsource](../lib#readme) - Library for signing / verifying
  files programatically.

## License

MIT
