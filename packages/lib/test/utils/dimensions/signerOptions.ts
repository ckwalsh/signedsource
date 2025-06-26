/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSecretKey } from 'node:crypto';

import type { SignedSourceSignerDefaultOptions } from '../../../src/index.ts';
import {
  MD5SignedContentSignerValidator,
  createJwsContentSigner,
} from '../../../src/index.ts';
import ed25519PrivateKey from '../key.ed25519.json' with { type: 'json' };
import p256PrivateKey from '../key.p256.json' with { type: 'json' };
import type { ValidatorDefaultOptionsTestCaseKey } from './validatorOptions.ts';

export type SignerDefaultOptionsTestCaseKey =
  | 'default'
  | 'md5'
  | 'ed25519'
  | 'ed25519 embed jwk'
  | 'p256'
  | 'p256 embed jwk'
  | 'symmetric';

interface SignerDefaultOptionsTestCase {
  signerOptionsKey: SignerDefaultOptionsTestCaseKey;
  signerOptions: SignedSourceSignerDefaultOptions;
  validatedBy: ValidatorDefaultOptionsTestCaseKey[];
}

export const SIGNER_OPTIONS_TEST_CASE_MAP: Record<
  SignerDefaultOptionsTestCaseKey,
  SignerDefaultOptionsTestCase
> = {
  'default': {
    signerOptionsKey: 'default',
    signerOptions: {},
    validatedBy: ['default', 'md5'],
  },
  'md5': {
    signerOptionsKey: 'md5',
    signerOptions: {
      signer: new MD5SignedContentSignerValidator(),
    },
    validatedBy: ['default', 'md5'],
  },
  'ed25519': {
    signerOptionsKey: 'ed25519',
    signerOptions: {
      signer: await createJwsContentSigner({
        key: ed25519PrivateKey,
        embedJWK: false,
      }),
    },
    validatedBy: ['ed25519 pubkey', 'ed25519 privkey'],
  },
  'ed25519 embed jwk': {
    signerOptionsKey: 'ed25519 embed jwk',
    signerOptions: {
      signer: await createJwsContentSigner({
        key: ed25519PrivateKey,
        embedJWK: true,
      }),
    },
    validatedBy: [
      'default',
      'embedded jwk',
      'ed25519 pubkey',
      'ed25519 privkey',
    ],
  },
  'p256': {
    signerOptionsKey: 'p256',
    signerOptions: {
      signer: await createJwsContentSigner({
        key: p256PrivateKey,
        embedJWK: false,
      }),
    },
    validatedBy: ['p256 pubkey', 'p256 privkey'],
  },
  'p256 embed jwk': {
    signerOptionsKey: 'p256 embed jwk',
    signerOptions: {
      signer: await createJwsContentSigner({
        key: p256PrivateKey,
        embedJWK: true,
      }),
    },
    validatedBy: ['default', 'embedded jwk', 'p256 pubkey', 'p256 privkey'],
  },
  'symmetric': {
    signerOptionsKey: 'symmetric',
    signerOptions: {
      signer: await createJwsContentSigner({
        key: createSecretKey('secret', 'utf-8'),
        header: {
          alg: 'HS256',
        },
      }),
    },
    validatedBy: ['symmetric'],
  },
};

for (const [key, value] of Object.entries(SIGNER_OPTIONS_TEST_CASE_MAP)) {
  if (value.signerOptionsKey !== key) {
    throw new Error(
      `Signer Options test case label mismatch: expected ${key}, got ${value.signerOptionsKey}`,
    );
  }
}

export const SIGNER_OPTIONS_TEST_CASES: SignerDefaultOptionsTestCase[] =
  Object.entries(SIGNER_OPTIONS_TEST_CASE_MAP).map((entry) => entry[1]);
