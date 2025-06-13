[![main](https://github.com/ckwalsh/signedsource/actions/workflows/main.yml/badge.svg)](https://github.com/ckwalsh/signedsource/actions/workflows/main.yml)

# @ckwalsh/signedsource

Library to sign generated code to ensure it has not been tampered with, based on
Meta's signedsource package.

This library supports both fully and partially generated documents, and both
cryptographic and non-cryptographic signatures.

This package does not contain any user tooling for working with generated files.
If you are looking for a CLI, check out
[@ckwalsh/signedsource-cli](../cli/README.md).

## Installation

<details>
<summary>npm</summary>

```sh
npm install @ckwalsh/signedsource
```

</details>
<details>
<summary>yarn</summary>

```sh
yarn add @ckwalsh/signedsource
```

</details>
<details>
<summary>pnpm</summary>

```sh
pnpm add @ckwalsh/signedsource
```

</details>

## Working with Generated Files

Generated files are annotated with specially formatted tags in their comments.
These tags consist of two parts, separated by a space:

- **Type:** Generated files can be marked as either `@generated` or
  `@partially-generated`
  - `@generated` files cannot be modified without invalidating the embedded
    signature. Use this for files that should never be manually altered.
  - `@partially-generated` files can contain sections bounded by
    `BEGIN MANUAL SECTION SectionName` and `END MANUAL SECTION`, between which
    the content may be changed without invalidating the embedded signature. It
    is possible to extract and retain these manual sections when working with
    codegen, allowing manual sections to remain untouched while generated code
    is updated.
- **Signature Token:** Unsigned files contain a signature placeholder, while
  signed files contain a cryptographic signature.
  - Placeholders are of the form `<<SignedSource::PaddingData>>`. For backwards
    compatibility with the Meta implementation, the placeholder
    `<<SignedSource::*O*zOeWoEQle#+L!plEphiEmie@IsG>>` is frequently used.
  - Signatures are of the form `SignedSource<<SignatureData>>`. Signatures
    compatible with the Meta library consist of 32 hexadecimal characters,
    representing the md5 digest of the signed content. Signatures may also be
    created using a JSON Web Key (JWK), consisting of the base64url encoded
    protected header and signature of a JSON Web Signature (JWS). The payload
    for the JWS is the sha256 digest of the signed content, and is omitted from
    the token.

## Examples

### Generated Source

```typescript
/* eslint-disable */

/* @generated SignedSource<<6fde99c7ccfb41abcb26139df27817ec>> */

const foo = 'bar';
```

### Partially Generated Source

```typescript
/* eslint-disable */

/* @partially-generated SignedSource<<b2e42e793ae28eece8f6d05cae623680>> */

const foo = 'bar';

/* BEGIN MANUAL SECTION pets */

// This section can be modified without invalidating the signature

const favoritePet = 'cats';

/* END MANUAL SECTION */
```
