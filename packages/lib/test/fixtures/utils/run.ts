/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, test } from '@jest/globals';

import type { SignedSourceAnalysis } from '../../../src/index.ts';
import { SIGNER_OPTIONS_TEST_CASE_MAP } from '../../utils/dimensions/signerOptions.ts';
import type { SignerDefaultOptionsTestCaseKey } from '../../utils/dimensions/signerOptions.ts';
import type { ValidatorDefaultOptionsTestCaseKey } from '../../utils/dimensions/validatorOptions.ts';
import { eachAnalyzer, eachSigner, eachValidator } from '../../utils/each.ts';
import { stubNonDeterministicSignature } from '../../utils/signature.ts';
import type { SourceProviderIf } from '../../utils/source.ts';
import type {
  LabeledFixtureTestCase,
  ResolvedFixtureTestCase,
} from './case.ts';
import { getFixtureTestCases } from './files.ts';
import { FixtureFileSourceProvider } from './source.ts';

export function runFixtureTests(
  testUrl: string,
  fixtures: Record<string, LabeledFixtureTestCase>,
  ignoreFiles: readonly string[] = [],
): void {
  const cases = getFixtureTestCases(testUrl, fixtures, ignoreFiles);

  describe.each(cases)('Fixture "$label"', (fixture) => {
    const sourceProvider = new FixtureFileSourceProvider(fixture);

    testAnalyzersAgainstFixture(sourceProvider, fixture);
    testValidatorsAgainstFixture(sourceProvider, fixture);
    testSignersAgainstFixture(sourceProvider, fixture);
  });
}

function testAnalyzersAgainstFixture(
  sourceProvider: SourceProviderIf,
  {
    sourceType,
    isWellFormed,
    signedBy,
    manualSections,
  }: ResolvedFixtureTestCase,
) {
  let expected: SignedSourceAnalysis | null = null;

  eachAnalyzer(sourceProvider, ({ analyzer, analyzerOptions, getInput }) => {
    const supported =
      isWellFormed && (analyzerOptions.sourceType ?? sourceType) === sourceType;

    if (supported) {
      test('can successfully call analyze()', async () => {
        const input = await getInput();
        const actual = await analyzer.analyze(input);

        expect(actual.sourceType).toEqual(sourceType);

        if (actual.sourceType === 'partially-generated') {
          expect(Object.keys(actual.manualSections).sort()).toEqual(
            manualSections,
          );
        }

        if (expected === null) {
          expect(actual).toMatchSnapshot();
          expected = actual;
        } else {
          expect(actual).toEqual(expected);
        }
      });

      test('can successfully call isGenerated()', async () => {
        const input = await getInput();

        const actual = await analyzer.isGenerated(input);

        expect(actual).toEqual(sourceType !== 'manual');
      });

      test('can successfully call isSigned()', async () => {
        const input = await getInput();

        const actual = await analyzer.isSigned(input);

        expect(actual).toEqual(!!signedBy);
      });
    } else {
      test('fails to call analyze()', async () => {
        const input = await getInput();

        await expect(
          analyzer.analyze(input),
        ).rejects.toThrowErrorMatchingSnapshot();
      });

      test('fails to call isGenerated()', async () => {
        const input = await getInput();

        await expect(
          analyzer.isGenerated(input),
        ).rejects.toThrowErrorMatchingSnapshot();
      });

      test('fails to call isSigned()', async () => {
        const input = await getInput();

        await expect(
          analyzer.isSigned(input),
        ).rejects.toThrowErrorMatchingSnapshot();
      });
    }
  });
}

function testValidatorsAgainstFixture(
  sourceProvider: SourceProviderIf,
  { isWellFormed, signedBy, isValidSignature }: ResolvedFixtureTestCase,
) {
  const validatedBySet = signedBy
    ? new Set<ValidatorDefaultOptionsTestCaseKey>(
        SIGNER_OPTIONS_TEST_CASE_MAP[signedBy].validatedBy,
      )
    : new Set<ValidatorDefaultOptionsTestCaseKey>();

  eachValidator(
    sourceProvider,
    ({ validatorOptionsKey, validator, getInput }) => {
      if (isWellFormed) {
        const expected: boolean =
          (isValidSignature ?? false) &&
          validatedBySet.has(validatorOptionsKey);

        test('can successfully call isValid()', async () => {
          const input = await getInput();
          const actual = await validator.isValid(input);

          expect(actual).toEqual(expected);
        });

        if (expected) {
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
      } else {
        test('fails to call isValid()', async () => {
          const input = await getInput();
          await expect(
            validator.isValid(input),
          ).rejects.toThrowErrorMatchingSnapshot();
        });

        test('fails to call assertIsValid()', async () => {
          const input = await getInput();
          await expect(
            validator.assertIsValid(input),
          ).rejects.toThrowErrorMatchingSnapshot();
        });
      }
    },
  );
}

function testSignersAgainstFixture(
  sourceProvider: SourceProviderIf,
  { sourceType, isWellFormed }: ResolvedFixtureTestCase,
) {
  const expectedSigned: Partial<
    Record<SignerDefaultOptionsTestCaseKey, string>
  > = {};
  const expectedUnsigned: Partial<
    Record<SignerDefaultOptionsTestCaseKey, string>
  > = {};

  eachSigner(
    sourceProvider,
    ({ signer, signerOptionsKey, getInput, outputToString }) => {
      if (isWellFormed && sourceType !== 'manual') {
        test('can successfully call sign()', async () => {
          const input = await getInput();
          const output = await signer.sign(input);

          const unstubbed = await outputToString(output);
          const stubbed = stubNonDeterministicSignature(unstubbed);

          if (signerOptionsKey in expectedSigned) {
            expect(stubbed).toEqual(expectedSigned[signerOptionsKey]);
          } else {
            expect(stubbed).toMatchSnapshot();
            expectedSigned[signerOptionsKey] = stubbed;
          }
        });

        test('can successfully call unsign()', async () => {
          const input = await getInput();
          const output = await signer.unsign(input);

          const actual = await outputToString(output);

          if (signerOptionsKey in expectedUnsigned) {
            expect(actual).toEqual(expectedUnsigned[signerOptionsKey]);
          } else {
            expect(actual).toMatchSnapshot();
            expectedUnsigned[signerOptionsKey] = actual;
          }
        });
      } else {
        test('fails to call sign()', async () => {
          const input = await getInput();
          const output = (async () => {
            return outputToString(await signer.sign(input));
          })();

          await expect(output).rejects.toThrowErrorMatchingSnapshot();
        });

        test('fails to call unsign()', async () => {
          const input = await getInput();
          const output = (async () => {
            return outputToString(await signer.unsign(input));
          })();

          await expect(output).rejects.toThrowErrorMatchingSnapshot();
        });
      }
    },
  );
}
