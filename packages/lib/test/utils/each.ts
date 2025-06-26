/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe } from '@jest/globals';

import type {
  SignedSourceAnalyzerDefaultOptions,
  SignedSourceAnalyzerIf,
  SignedSourceSignerIf,
  SignedSourceValidatorIf,
  SignedStreamAnalyzerIf,
  SignedStreamSignerIf,
  SignedStreamValidatorIf,
  SignedStringAnalyzerIf,
  SignedStringSignerIf,
  SignedStringValidatorIf,
} from '../../src/index.ts';
import type { AnalyzerTestCaseKey } from './dimensions/analyzer.ts';
import { ANALYZER_TEST_CASES } from './dimensions/analyzer.ts';
import type { AnalyzerDefaultOptionsTestCaseKey } from './dimensions/analyzerOptions.ts';
import { ANALYZER_OPTIONS_TEST_CASES } from './dimensions/analyzerOptions.ts';
import { HASHER_TEST_CASES } from './dimensions/hasher.ts';
import type { SignerTestCaseKey } from './dimensions/signer.ts';
import { SIGNER_TEST_CASES } from './dimensions/signer.ts';
import type { SignerDefaultOptionsTestCaseKey } from './dimensions/signerOptions.ts';
import { SIGNER_OPTIONS_TEST_CASES } from './dimensions/signerOptions.ts';
import type { ValidatorTestCaseKey } from './dimensions/validator.ts';
import { VALIDATOR_TEST_CASES } from './dimensions/validator.ts';
import type { ValidatorDefaultOptionsTestCaseKey } from './dimensions/validatorOptions.ts';
import { VALIDATOR_OPTIONS_TEST_CASES } from './dimensions/validatorOptions.ts';
import { streamToString } from './source.ts';
import type { SourceProviderIf } from './source.ts';

interface AnalyzerBlockFnArgs<TInput = unknown> {
  analyzerKey: AnalyzerTestCaseKey;
  analyzerOptionsKey: AnalyzerDefaultOptionsTestCaseKey;
  analyzer: SignedSourceAnalyzerIf<TInput>;
  analyzerOptions: SignedSourceAnalyzerDefaultOptions;
  getInput: () => Promise<TInput>;
}

interface ValidatorBlockFnArgs<TInput = unknown> {
  validatorKey: ValidatorTestCaseKey;
  validatorOptionsKey: ValidatorDefaultOptionsTestCaseKey;
  validator: SignedSourceValidatorIf<TInput>;
  getInput: () => Promise<TInput>;
}

interface SignerBlockFnArgs<TInput = unknown, TOutput = unknown> {
  signerKey: SignerTestCaseKey;
  signerOptionsKey: SignerDefaultOptionsTestCaseKey;
  signer: SignedSourceSignerIf<TInput, TOutput>;

  getInput: () => Promise<TInput>;
  outputToString: (out: TOutput) => Promise<string>;
}

export function eachAnalyzer(
  sourceProvider: SourceProviderIf,
  blockFn: (args: AnalyzerBlockFnArgs) => void,
) {
  describe.each(ANALYZER_TEST_CASES)(
    'analyzed using $analyzerKey',
    ({
      analyzerKey,
      supportsStringInput,
      supportsStreamInput,
      AnalyzerCtor,
    }) => {
      describe.each(ANALYZER_OPTIONS_TEST_CASES)(
        'with options "$analyzerOptionsKey"',
        ({ analyzerOptionsKey, analyzerOptions }) => {
          describe.each(HASHER_TEST_CASES)(
            'and hasher "$label"',
            ({ hasherFn }) => {
              if (supportsStringInput) {
                describe('on input "string"', () => {
                  const analyzer: SignedStringAnalyzerIf = new AnalyzerCtor(
                    analyzerOptions,
                  );
                  (
                    analyzer as unknown as { __hasherFnForTesting: unknown }
                  ).__hasherFnForTesting = hasherFn;

                  blockFn({
                    analyzerKey,
                    analyzerOptionsKey,
                    analyzer,
                    analyzerOptions: analyzerOptions ?? {},
                    getInput: sourceProvider.getString,
                  });
                });
              }

              if (supportsStreamInput) {
                describe.each(sourceProvider.streams)(
                  'on input "$label"',
                  ({ getStream: getInput }) => {
                    const analyzer: SignedStreamAnalyzerIf = new AnalyzerCtor(
                      analyzerOptions,
                    );
                    (
                      analyzer as unknown as { __hasherFnForTesting: unknown }
                    ).__hasherFnForTesting = hasherFn;

                    blockFn({
                      analyzerKey,
                      analyzerOptionsKey,
                      analyzer,
                      analyzerOptions: analyzerOptions ?? {},
                      getInput,
                    });
                  },
                );
              }
            },
          );
        },
      );
    },
  );
}

export function eachValidator(
  sourceProvider: SourceProviderIf,
  blockFn: (args: ValidatorBlockFnArgs) => void,
) {
  describe.each(VALIDATOR_TEST_CASES)(
    'validated using $validatorKey',
    ({
      validatorKey,
      supportsStringInput,
      supportsStreamInput,
      ValidatorCtor,
    }) => {
      describe.each(VALIDATOR_OPTIONS_TEST_CASES)(
        'with options "$validatorOptionsKey"',
        ({ validatorOptionsKey, validatorOptions }) => {
          if (supportsStringInput) {
            describe('on string input', () => {
              const validator: SignedStringValidatorIf = new ValidatorCtor(
                validatorOptions,
              );

              blockFn({
                validator,
                validatorKey,
                validatorOptionsKey,
                getInput: sourceProvider.getString,
              });
            });
          }

          if (supportsStreamInput) {
            describe.each(sourceProvider.streams)(
              'on $label input',
              ({ getStream: getInput }) => {
                const validator: SignedStreamValidatorIf = new ValidatorCtor(
                  validatorOptions,
                );

                blockFn({
                  validator,
                  validatorKey,
                  validatorOptionsKey,
                  getInput,
                });
              },
            );
          }
        },
      );
    },
  );
}

export function eachSigner(
  sourceProvider: SourceProviderIf,
  blockFn: <TInput, TOutput>(args: SignerBlockFnArgs<TInput, TOutput>) => void,
) {
  describe.each(SIGNER_TEST_CASES)(
    'transformed with $signerKey',
    ({ signerKey, supportsStringInput, supportsStreamInput, SignerCtor }) => {
      describe.each(SIGNER_OPTIONS_TEST_CASES)(
        'with options "$signerOptionsKey"',
        ({ signerOptionsKey, signerOptions }) => {
          if (supportsStringInput) {
            describe('on string input', () => {
              const signer: SignedStringSignerIf = new SignerCtor(
                signerOptions,
              );

              blockFn({
                signerKey,
                signerOptionsKey,
                signer,
                getInput: sourceProvider.getString,
                outputToString: (out) => out,
              });
            });
          }

          if (supportsStreamInput) {
            describe.each(sourceProvider.streams)(
              'on $label input',
              ({ getStream: getInput }) => {
                const signer: SignedStreamSignerIf = new SignerCtor(
                  signerOptions,
                );

                blockFn({
                  signerKey,
                  signerOptionsKey,
                  signer,
                  getInput,
                  outputToString: streamToString,
                });
              },
            );
          }
        },
      );
    },
  );
}
