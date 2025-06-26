/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {
  SignedSourceValidatorDefaultOptions,
  SignedStreamValidatorIf,
  SignedStringValidatorIf,
} from '../../../src/index.ts';
import {
  SignedSourceValidator,
  SignedStreamValidator,
  SignedStringValidator,
} from '../../../src/index.ts';

export type ValidatorTestCaseKey =
  | 'SignedStringValidator'
  | 'SignedStreamValidator'
  | 'SignedSourceValidator';

interface ValidatorTestCaseBase {
  validatorKey: ValidatorTestCaseKey;
  ValidatorCtor: new (
    options: SignedSourceValidatorDefaultOptions | undefined,
  ) => SignedStringValidatorIf | SignedStreamValidatorIf;
}

interface StringValidatorTestCase extends ValidatorTestCaseBase {
  supportsStringInput: true;
  supportsStreamInput: false;
  ValidatorCtor: new (
    options: SignedSourceValidatorDefaultOptions | undefined,
  ) => SignedStringValidatorIf;
}

interface StreamValidatorTestCase extends ValidatorTestCaseBase {
  supportsStringInput: false;
  supportsStreamInput: true;
  ValidatorCtor: new (
    options: SignedSourceValidatorDefaultOptions | undefined,
  ) => SignedStreamValidatorIf;
}

interface UnifiedValidatorTestCase extends ValidatorTestCaseBase {
  supportsStringInput: true;
  supportsStreamInput: true;
  ValidatorCtor: new (
    options: SignedSourceValidatorDefaultOptions | undefined,
  ) => SignedStringValidatorIf & SignedStreamValidatorIf;
}

type ValidatorTestCase =
  | StringValidatorTestCase
  | StreamValidatorTestCase
  | UnifiedValidatorTestCase;

const TEST_CASE_MAP: Record<ValidatorTestCaseKey, ValidatorTestCase> = {
  SignedStringValidator: {
    validatorKey: 'SignedStringValidator',
    ValidatorCtor: SignedStringValidator,
    supportsStringInput: true,
    supportsStreamInput: false,
  },
  SignedStreamValidator: {
    validatorKey: 'SignedStreamValidator',
    ValidatorCtor: SignedStreamValidator,
    supportsStringInput: false,
    supportsStreamInput: true,
  },
  SignedSourceValidator: {
    validatorKey: 'SignedSourceValidator',
    ValidatorCtor: SignedSourceValidator,
    supportsStringInput: true,
    supportsStreamInput: true,
  },
};

for (const [key, value] of Object.entries(TEST_CASE_MAP)) {
  if (value.validatorKey !== key) {
    throw new Error(
      `Validator test case label mismatch: expected ${key}, got ${value.validatorKey}`,
    );
  }
}

export const VALIDATOR_TEST_CASES: ValidatorTestCase[] = Object.entries(
  TEST_CASE_MAP,
).map((entry) => entry[1]);
