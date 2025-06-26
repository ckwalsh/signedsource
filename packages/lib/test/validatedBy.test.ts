/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, test } from '@jest/globals';

import { SignedStringSigner } from '../src/index.ts';
import { SIGNER_OPTIONS_TEST_CASES } from './utils/dimensions/signerOptions.ts';
import { eachValidator } from './utils/each.ts';
import { SignedSourceProvider } from './utils/source.ts';

interface TestCase {
  label: string;
  unsigned: string;
}

const GENERATED_SOURCE = `
/* @generated <<SignedSource::*O*zOeWoEQle#+L!plEphiEmie@IsG>> */

const foo = 'bar';
`;

const PARTIALLY_GENERATED_SOURCE = `
/* @partially-generated <<SignedSource::*O*zOeWoEQle#+L!plEphiEmie@IsG>> */

const foo = 'bar';

/* BEGIN MANUAL SECTION pets */
const favoritePet = 'cats';
/* END MANUAL SECTION */
`;

const CASES: TestCase[] = [
  {
    label: '@generated',
    unsigned: GENERATED_SOURCE,
  },
  {
    label: '@partially-generated',
    unsigned: PARTIALLY_GENERATED_SOURCE,
  },
];

describe.each(CASES)('$label source', ({ unsigned }) => {
  describe.each(SIGNER_OPTIONS_TEST_CASES)(
    'signed with $signerOptionsKey signer',
    ({ validatedBy, signerOptions }) => {
      const signer = new SignedStringSigner(signerOptions);
      const provider = new SignedSourceProvider(signer, unsigned);

      const validatedBySet = new Set(validatedBy);

      eachValidator(
        provider,
        ({ validatorOptionsKey, validator, getInput }) => {
          const expected = validatedBySet.has(validatorOptionsKey);

          test('can successfully call isValid()', async () => {
            const input = await getInput();
            const actual = await validator.isValid(input);

            expect(actual).toEqual(expected);
          });

          if (validatedBySet.has(validatorOptionsKey)) {
            test('can successfully call assertIsValid()', async () => {
              const input = await getInput();
              await expect(
                validator.assertIsValid(input),
              ).resolves.toBeUndefined();
            });
          } else {
            test('throws on assertIsValid()', async () => {
              const input = await getInput();
              await expect(
                validator.assertIsValid(input),
              ).rejects.toThrowErrorMatchingSnapshot();
            });
          }
        },
      );
    },
  );
});
