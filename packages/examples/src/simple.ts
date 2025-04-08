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
