# @ckwalsh/signedsource

This library can be used to sign generated code and detect if that code has been accidentally modified.

It supports two signature modes, one that signs an entire file, another that allows some sections to support manual
modifications.

This signature scheme is NOT cryptographically secure, nor is it intended to be. It merely provides some signal that a
file may have had accidental modifications.

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
import { strict as assert } from 'node:assert';
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
import { strict as assert } from 'node:assert';
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
import { strict as assert } from 'node:assert';
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

## Related Packages

- [@ckwalsh/signedsource-cli](../cli#readme) - CLI for signing / verifying files signed with this library.

## License

MIT
