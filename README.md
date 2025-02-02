# @ckwalsh/signedsource

[![main](https://github.com/ckwalsh/signedsource/actions/workflows/main.yml/badge.svg)](https://github.com/ckwalsh/signedsource/actions/workflows/main.yml)

This library can be used to sign generated code and detect if that code has been accidentally modified.

This signature scheme is NOT cryptographically secure, nor is it intended to be. It merely provides some signal that a
file may have had accidental modifications.

## Installation

```
npm install --save-dev @ckwalsh/signedsource
```

## Usage

### As a library

```typescript
import { GENERATED_TOKEN, signCode, verifyCode } from '@ckwalsh/signedsource';

const generatedCode = `
/* ${GENERATED_TOKEN} */
const foo = 'FOO';
`;

const signedCode = signCode(generatedCode);

verifyCode(signedCode); // === true
verifyCode(signedCode + `const bar = 'BAR';`); // === false
```

### As a CLI

```bash
npx tsx generate-code.ts > generated.ts;

npx signedsource sign generated.ts;

npx signedsource verify generated.ts; // Exit code 0
echo "// foobar" >> generated.ts
npx signedsource verify generated.ts; // Exit code 1
```

## Partial Code Generation

This library supports partial code generation, where sections of the code may be manually modified without affecting the
signature of the file.

To use, embed the `PARTIALLY_GENERATED_TOKEN` constant instead of `GENERATED_TOKEN`, and surround the manual sections of
code with `BEGIN MANUAL SECTION MyCustomSectionName` and `END MANUAL SECTION` within comments. Any modifications outside
of these sections will break the signature, but modifications within them are permitted.

```typescript
import { PARTIALLY_GENERATED_TOKEN, signCode, verifyCode } from '@ckwalsh/signedsource';

const generatedCode = `
/* ${PARTIALLY_GENERATED_TOKEN} */

function getBestFood() {
// BEGIN MANUAL SECTION food
return 'pizza';
// END MANUAL SECTION

function getBestDrink() {
// BEGIN MANUAL SECTION drink
return 'lemonade';
// END MANUAL SECTION
}
`;

const signedCode = signCode(generatedCode);

verifyCode(signedCode); // === true
verifyCode(signedCode.replace('pizza', 'hamburgers')); // === true
```

Partially generated code can also be updated while preserving the contents of the defined fields. Continuing the example
from before:

```typescript
import { PARTIALLY_GENERATED_TOKEN, signCode, verifyCode } from '@ckwalsh/signedsource';

const newGeneratedCode = `
/* ${PARTIALLY_GENERATED_TOKEN} */

function getBestDrink() {
// BEGIN MANUAL SECTION drink
return 'water';
// END MANUAL SECTION
}

function getBestFood() {
// BEGIN MANUAL SECTION food
return 'cabbage';
// END MANUAL SECTION

function getBestFriend() {
// BEGIN MANUAL SECTION friend
return 'dog';
// END MANUAL SECTION
`;

const updatedSignedCode = signCode(newGeneratedCode, signedCode);

verifyCode(updatedSignedCode); // === true

const expectedEndsWith = `
function getBestDrink() {
// BEGIN MANUAL SECTION drink
return 'lemonade';
// END MANUAL SECTION
}

function getBestFood() {
// BEGIN MANUAL SECTION food
return 'pizza';
// END MANUAL SECTION

function getBestFriend() {
// BEGIN MANUAL SECTION friend
return 'dog';
// END MANUAL SECTION
`;
updatedSignedCode.endsWith(expectedEndsWith); // === true
```

## Using signedsource with eslint

Check out the [@ckwalsh/eslint-plugin-signedsource](https://github.com/ckwalsh/eslint-plugin-signedsource) plugin to
have generated file signatures checked as part of your linting process.

## License

MIT
