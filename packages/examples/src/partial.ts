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
