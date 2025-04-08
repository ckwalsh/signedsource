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
