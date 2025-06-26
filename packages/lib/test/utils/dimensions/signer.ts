/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {
  SignedSourceSignerDefaultOptions,
  SignedStreamSignerIf,
  SignedStringSignerIf,
} from '../../../src/index.ts';
import {
  SignedSourceSigner,
  SignedStreamSigner,
  SignedStringSigner,
} from '../../../src/index.ts';

export type SignerTestCaseKey =
  | 'SignedStringSigner'
  | 'SignedStreamSigner'
  | 'SignedSourceSigner';

interface SignerTestCaseBase {
  signerKey: SignerTestCaseKey;
  SignerCtor: new (
    options: SignedSourceSignerDefaultOptions | undefined,
  ) => SignedStringSignerIf | SignedStreamSignerIf;
}

interface StringSignerTestCase extends SignerTestCaseBase {
  supportsStringInput: true;
  supportsStreamInput: false;
  SignerCtor: new (
    options: SignedSourceSignerDefaultOptions | undefined,
  ) => SignedStringSignerIf;
}

interface StreamSignerTestCase extends SignerTestCaseBase {
  supportsStringInput: false;
  supportsStreamInput: true;
  SignerCtor: new (
    options: SignedSourceSignerDefaultOptions | undefined,
  ) => SignedStreamSignerIf;
}

interface UnifiedSignerTestCase extends SignerTestCaseBase {
  supportsStringInput: true;
  supportsStreamInput: true;
  SignerCtor: new (
    options: SignedSourceSignerDefaultOptions | undefined,
  ) => SignedStringSignerIf & SignedStreamSignerIf;
}

type SignerTestCase =
  | StringSignerTestCase
  | StreamSignerTestCase
  | UnifiedSignerTestCase;

const TEST_CASE_MAP: Record<SignerTestCaseKey, SignerTestCase> = {
  SignedStringSigner: {
    signerKey: 'SignedStringSigner',
    SignerCtor: SignedStringSigner,
    supportsStringInput: true,
    supportsStreamInput: false,
  },
  SignedStreamSigner: {
    signerKey: 'SignedStreamSigner',
    SignerCtor: SignedStreamSigner,
    supportsStringInput: false,
    supportsStreamInput: true,
  },
  SignedSourceSigner: {
    signerKey: 'SignedSourceSigner',
    SignerCtor: SignedSourceSigner,
    supportsStringInput: true,
    supportsStreamInput: true,
  },
};

for (const [key, value] of Object.entries(TEST_CASE_MAP)) {
  if (value.signerKey !== key) {
    throw new Error(
      `Signer test case label mismatch: expected ${key}, got ${value.signerKey}`,
    );
  }
}

export const SIGNER_TEST_CASES: SignerTestCase[] = Object.entries(
  TEST_CASE_MAP,
).map((entry) => entry[1]);
