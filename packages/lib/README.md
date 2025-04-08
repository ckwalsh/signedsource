# @ckwalsh/signedsource

Library to sign and verify generated code, based on Meta's signedsource package.

This library can be used to sign generated code and detect if that code has
been accidentally modified.

It supports two signature modes, one that signs an entire file, another that
allows some sections to support manual modifications.

This signature scheme is NOT cryptographically secure, nor is it intended to
be. It merely provides some signal that a file may have had accidental
modifications.

## Installation

<details>
<summary>npm</summary>

```
npm install @ckwalsh/signedsource
```

</details>
<details>
<summary>yarn</summary>

```
yarn add @ckwalsh/signedsource
```

</details>
<details>
<summary>pnpm</summary>

```
pnpm add @ckwalsh/signedsource
```

</details>

## Usage

```typescript
import { strict as assert } from 'assert';
import {
  BEGIN_MANUAL_SECTION_TOKEN,
  END_MANUAL_SECTION_TOKEN,
  GENERATED_TOKEN,
  PARTIALLY_GENERATED_TOKEN,
  signSource,
  verifySignedSource,
} from '@ckwalsh/signedsource';

const unsignedSource = `
// ${GENERATED_TOKEN}

I like Kittens!
`;

const signed = signSource(unsignedSource);
assert(verifySignedSource(signed));

const unsignedPartialSource = `
// ${PARTIALLY_GENERATED_TOKEN}

function getBestPet() {
// ${BEGIN_MANUAL_SECTION_TOKEN} pet
  return 'Kitten';
// ${END_MANUAL_SECTION_TOKEN}
}
`;

const signedPartial = signSource(unsignedPartialSource);
assert(verifySignedSource(signedPartial));

```

### Full file signatures only

```typescript
import { strict as assert } from 'assert';
import { GENERATED_TOKEN, signSource, verifySignedSource } from '@ckwalsh/signedsource/full';

const unsignedSource = `
// ${GENERATED_TOKEN}

I like Kittens!
`;

const signed = signSource(unsignedSource);
const manipulated = signed.replace('Kittens', 'Puppies');

assert(manipulated !== signed);

console.log('Fully signed files verify correctly');
assert(verifySignedSource(signed));

console.log('Manipulated files fail verification');
assert(!verifySignedSource(manipulated));

```

### Partial file signatures only

```typescript
import { strict as assert } from 'assert';
import {
  BEGIN_MANUAL_SECTION_TOKEN,
  END_MANUAL_SECTION_TOKEN,
  GENERATED_TOKEN,
  signSource,
  verifySignedSource,
} from '@ckwalsh/signedsource/partial';

const unsignedSource = `
// ${GENERATED_TOKEN}

function getBestPet() {
// ${BEGIN_MANUAL_SECTION_TOKEN} pet
  return 'Kitten';
// ${END_MANUAL_SECTION_TOKEN}
}
`;

const signed = signSource(unsignedSource);
const allowedManipulated = signed.replace('Kitten', 'Puppy');
const forbiddenManipulated = signed.replace('Best', 'Cutest');

assert(allowedManipulated !== signed);
assert(forbiddenManipulated !== signed);

console.log('Partially signed files verify correctly');
assert(verifySignedSource(signed));

console.log('Verification passes when the content of a manual block is modified');
assert(verifySignedSource(allowedManipulated));

console.log('Verification fails when content outside a manual block is modified');
assert(!verifySignedSource(forbiddenManipulated));

```

## Other Packages

- [@ckwalsh/signedsource-cli](/packages/cli#readme) - CLI to sign and verify generated code, based on Meta's signedsource package.
- [@ckwalsh/signedsource-eslint-plugin](/packages/eslint#readme) - ESLint plugin for ensuring that generated files haven't been tampered with.

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

<!-- @generated SignedSource<<af9dceb18b69a3b8b80e56f2301e6759>> -->
