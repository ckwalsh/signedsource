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

const unsignedPartialSource = `
// ${PARTIALLY_GENERATED_TOKEN}

function getBestPet() {
// ${BEGIN_MANUAL_SECTION_TOKEN} pet
  return 'Kitten';
// ${END_MANUAL_SECTION_TOKEN}
}
`;

function fullExample() {
  const signed = signSource(unsignedSource);
  const manipulated = signed.replace('Kittens', 'Puppies');

  assert(manipulated !== signed);

  console.log('Fully signed files verify correctly');
  assert(verifySignedSource(signed));

  console.log('Manipulated files fail verification');
  assert(!verifySignedSource(manipulated));
}

function partialExample() {
  const signed = signSource(unsignedPartialSource);
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
}

fullExample();
partialExample();
